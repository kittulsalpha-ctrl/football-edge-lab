(function createGoalIQPredictionEngine(globalScope) {
  "use strict";

  const MODEL_VERSION = "goaliq-2.0.0";
  const MAX_SCORE_GOALS = 7;
  const MS_PER_DAY = 24 * 60 * 60 * 1000;
  const DEFAULT_GENERATED_AT = "2026-01-01T00:00:00.000Z";

  const DEFAULT_CONFIG = {
    modelWeights: {
      elo: 0.22,
      poisson: 0.56,
      form: 0.22
    },
    elo: {
      baseRating: 1600,
      kFactor: 28,
      homeAdvantageRating: 62,
      regression: 0.94
    },
    strengths: {
      learningRate: 0.16,
      regression: 0.93,
      recencyHalfLifeDays: 210
    },
    poisson: {
      maxGoals: MAX_SCORE_GOALS,
      minLambda: 0.18,
      maxLambda: 4.4,
      dixonColesRho: -0.08
    },
    leagueStrength: {
      EPL: 1.08,
      LALIGA: 1.02,
      SERIEA: 1,
      LIGUE1: 1.01,
      UCL: 1.1,
      UEL: 1.04,
      DEFAULT: 1
    }
  };

  const ADVANCED_PROVIDER_FIELDS = [
    "homeShots",
    "awayShots",
    "homeShotsOnTarget",
    "awayShotsOnTarget",
    "homeXg",
    "awayXg"
  ];

  class StatisticsProvider {
    async getMatchStatistics() {
      return null;
    }
  }

  class ExpectedGoalsProvider {
    async getExpectedGoals() {
      return null;
    }
  }

  class LineupProvider {
    async getLineups() {
      return null;
    }
  }

  class InjuryProvider {
    async getInjuries() {
      return null;
    }
  }

  function predictMatchV2(input = {}) {
    const config = mergeConfig(DEFAULT_CONFIG, input.config || {});
    const teams = input.teams || {};
    const leagueProfiles = input.leagueProfiles || {};
    const match = normalizePredictionMatch(input.match, teams, leagueProfiles);
    const fixtureMeta = input.fixtureMeta || {};
    const generatedAt = normalizeTimestamp(input.generatedAt) || new Date().toISOString();
    const history = buildHistoricalDatabase({
      matches: input.matches || [],
      teams,
      now: generatedAt
    });
    const features = buildFeatureStore({
      match,
      teams,
      leagueProfiles,
      history,
      fixtureMeta,
      generatedAt,
      config
    });

    const eloModel = buildEloOutcomeModel(features, config);
    const formModel = buildFormOutcomeModel(features, config);
    const lambdas = estimateGoalExpectations(features, eloModel, formModel, config);
    const liveOffset = getLiveScoreOffset(match);
    const remainingFactor = getRemainingFactor(match);
    const matrix = buildScoreMatrix(
      lambdas.lambdaHome * remainingFactor,
      lambdas.lambdaAway * remainingFactor,
      liveOffset,
      config.poisson.maxGoals,
      config.poisson.dixonColesRho
    );
    const poissonOutcome = summarizeScoreMatrix(matrix, lambdas);
    const models = {
      elo: buildModelOutput("Elo outcome model", eloModel.outcomes),
      poisson: buildModelOutput("Dixon-Coles Poisson score model", poissonOutcome),
      form: buildModelOutput("Opponent-adjusted recent form model", formModel.outcomes)
    };
    const disagreement = calculateModelDisagreement(models);
    const dataQuality = calculatePredictionDataQuality(features, disagreement, fixtureMeta, generatedAt);
    const confidence = calculatePredictionConfidence(poissonOutcome, dataQuality, disagreement);
    const marketEdges = buildMarketRecommendations(poissonOutcome, features.homeTeam, features.awayTeam, dataQuality);
    const likelyScore = poissonOutcome.mostLikelyScore;

    return {
      modelVersion: MODEL_VERSION,
      metadata: {
        modelVersion: MODEL_VERSION,
        generatedAt,
        fixtureDataUpdatedAt: fixtureMeta.updatedAt || null,
        featuresUpdatedAt: features.featuresUpdatedAt,
        inputCompleteness: dataQuality.inputCompleteness,
        historyCutoff: features.historyCutoff
      },
      probabilities: {
        home: poissonOutcome.home,
        draw: poissonOutcome.draw,
        away: poissonOutcome.away,
        over05: poissonOutcome.over05,
        under05: poissonOutcome.under05,
        over15: poissonOutcome.over15,
        under15: poissonOutcome.under15,
        over25: poissonOutcome.over25,
        under25: poissonOutcome.under25,
        over35: poissonOutcome.over35,
        under35: poissonOutcome.under35,
        over45: poissonOutcome.over45,
        under45: poissonOutcome.under45,
        btts: poissonOutcome.btts,
        bttsNo: 1 - poissonOutcome.btts,
        homeCleanSheet: poissonOutcome.homeCleanSheet,
        awayCleanSheet: poissonOutcome.awayCleanSheet,
        firstHalfGoal: poissonOutcome.firstHalfGoal
      },
      models,
      final: {
        homeWin: poissonOutcome.home,
        draw: poissonOutcome.draw,
        awayWin: poissonOutcome.away
      },
      modelDisagreement: disagreement,
      predictionConfidence: confidence.label.toLowerCase(),
      dataQualityScore: dataQuality.scorePercent,
      confidence: confidence.label,
      confidenceScore: confidence.score,
      predictedScore: `${likelyScore.homeGoals}-${likelyScore.awayGoals}`,
      expectedGoals: {
        home: roundMetric(liveOffset.home + lambdas.lambdaHome * remainingFactor),
        away: roundMetric(liveOffset.away + lambdas.lambdaAway * remainingFactor)
      },
      mostLikelyResult: getMostLikelyResultLabel(poissonOutcome, features.homeTeam, features.awayTeam),
      form: {
        home: summarizeUiForm(features.homeForm.last5),
        away: summarizeUiForm(features.awayForm.last5)
      },
      formWindows: {
        home: features.homeForm,
        away: features.awayForm
      },
      h2h: features.h2h,
      dataQuality,
      marketEdges,
      modelBreakdown: buildPredictionExplanation({
        features,
        poissonOutcome,
        lambdas,
        models,
        dataQuality,
        disagreement
      }),
      insights: buildPredictionInsights({
        features,
        lambdas,
        dataQuality,
        disagreement
      }),
      statistics: buildProvenanceStatistics(features, lambdas),
      scoreMatrix: matrix
    };
  }

  function buildHistoricalDatabase(input = {}) {
    const teams = input.teams || {};
    const matches = Array.isArray(input.matches) ? input.matches : [];
    const now = normalizeTimestamp(input.now) || DEFAULT_GENERATED_AT;
    const byName = buildTeamNameIndex(teams);
    const records = [];

    matches.forEach((match, index) => {
      const normalized = normalizeHistoricalMatch(match, {
        fallbackId: `fixture-${index}`,
        source: match.source || "football-data.org fixture feed",
        sourceQuality: {
          fixture: "provider",
          score: match.score ? "provider" : "unavailable",
          advancedStats: hasProviderAdvancedStats(match) ? "provider" : "unavailable"
        }
      });
      if (normalized) records.push(normalized);
    });

    Object.values(teams || {}).forEach((team) => {
      const form = Array.isArray(team?.form) ? team.form : [];
      form.forEach((formMatch, index) => {
        const normalized = normalizeTeamFormMatch(team, formMatch, index, byName, now);
        if (normalized) records.push(normalized);
      });
    });

    return dedupeHistoricalMatches(records).sort((a, b) => compareMatchDates(a, b));
  }

  function normalizeHistoricalMatch(match, context = {}) {
    if (!match || typeof match !== "object") return null;
    const score = normalizeScore(match.score || match.result || match.fullTime);
    const homeGoals = finiteOrNull(match.homeGoals ?? score?.home);
    const awayGoals = finiteOrNull(match.awayGoals ?? score?.away);
    const status = normalizeStatus(match.status);
    if (!Number.isFinite(homeGoals) || !Number.isFinite(awayGoals)) return null;
    if (status && !["finished", "awarded"].includes(status)) return null;

    const homeTeamId = normalizeTeamId(match.homeTeamId || match.homeId || match.homeTeam?.id || match.homeTeam || match.home || "");
    const awayTeamId = normalizeTeamId(match.awayTeamId || match.awayId || match.awayTeam?.id || match.awayTeam || match.away || "");
    if (!homeTeamId || !awayTeamId || homeTeamId === awayTeamId) return null;

    const date = normalizeDate(match.date || match.utcDate || match.kickoff || match.kickoffDate);
    if (!date) return null;

    return {
      id: String(match.id || match.matchId || context.fallbackId || `${date}-${homeTeamId}-${awayTeamId}`).toLowerCase(),
      competitionId: normalizeLeague(match.league || match.competitionId || match.competition || "DEFAULT"),
      season: normalizeSeason(match.season, date),
      date,
      kickoff: normalizeTimestamp(match.kickoff || match.utcDate || `${date}T${match.time || "00:00"}:00`) || `${date}T00:00:00.000Z`,
      homeTeamId,
      awayTeamId,
      homeGoals,
      awayGoals,
      homeTeamName: getTeamDisplayName(match.homeTeam || match.home || match.homeTeamName),
      awayTeamName: getTeamDisplayName(match.awayTeam || match.away || match.awayTeamName),
      halftimeHomeGoals: finiteOrNull(match.halftimeHomeGoals ?? match.halfTime?.home),
      halftimeAwayGoals: finiteOrNull(match.halftimeAwayGoals ?? match.halfTime?.away),
      homeShots: finiteOrNull(match.homeShots),
      awayShots: finiteOrNull(match.awayShots),
      homeShotsOnTarget: finiteOrNull(match.homeShotsOnTarget),
      awayShotsOnTarget: finiteOrNull(match.awayShotsOnTarget),
      homeXg: finiteOrNull(match.homeXg ?? match.homeExpectedGoals),
      awayXg: finiteOrNull(match.awayXg ?? match.awayExpectedGoals),
      source: match.source || context.source || "unknown",
      sourceQuality: match.sourceQuality || context.sourceQuality || {
        fixture: "unknown",
        score: "unknown",
        advancedStats: hasProviderAdvancedStats(match) ? "provider" : "unavailable"
      }
    };
  }

  function normalizeTeamFormMatch(team, formMatch, index, byName, now) {
    if (!team || !formMatch || typeof formMatch !== "object") return null;
    const date = normalizeDate(formMatch.date) || dateFromNow(now, -(index + 1) * 7);
    const teamId = normalizeTeamId(team.id);
    const opponentName = String(formMatch.opponent || "").trim();
    const opponentId = byName.get(normalizeName(opponentName)) || createOpponentId(opponentName, formMatch.competition || team.league);
    const goalsFor = finiteOrNull(formMatch.goalsFor);
    const goalsAgainst = finiteOrNull(formMatch.goalsAgainst);
    if (!teamId || !opponentId || !Number.isFinite(goalsFor) || !Number.isFinite(goalsAgainst)) return null;

    const venue = String(formMatch.venue || "H").toUpperCase() === "A" ? "A" : "H";
    const homeTeamId = venue === "H" ? teamId : opponentId;
    const awayTeamId = venue === "H" ? opponentId : teamId;
    const homeGoals = venue === "H" ? goalsFor : goalsAgainst;
    const awayGoals = venue === "H" ? goalsAgainst : goalsFor;

    return {
      id: `form-${date}-${homeTeamId}-${awayTeamId}-${homeGoals}-${awayGoals}`.toLowerCase(),
      competitionId: normalizeLeague(formMatch.competition || team.league || "DEFAULT"),
      season: normalizeSeason(formMatch.season, date),
      date,
      kickoff: `${date}T00:00:00.000Z`,
      homeTeamId,
      awayTeamId,
      homeGoals,
      awayGoals,
      homeTeamName: venue === "H" ? String(team.name || teamId) : opponentName,
      awayTeamName: venue === "H" ? opponentName : String(team.name || teamId),
      halftimeHomeGoals: null,
      halftimeAwayGoals: null,
      homeShots: null,
      awayShots: null,
      homeShotsOnTarget: null,
      awayShotsOnTarget: null,
      homeXg: null,
      awayXg: null,
      source: formMatch.source || "team recent-form feed",
      sourceQuality: formMatch.sourceQuality || {
        fixture: "provider-derived-team-form",
        score: "provider",
        advancedStats: "unavailable"
      }
    };
  }

  function buildFeatureStore(input = {}) {
    const config = input.config || DEFAULT_CONFIG;
    const match = input.match;
    const beforeTimestamp = getMatchTimestamp(match);
    const historicalBeforeKickoff = (input.history || []).filter((record) => getRecordTimestamp(record) < beforeTimestamp);
    const league = normalizeLeague(match.league || "DEFAULT");
    const leagueProfile = match.leagueProfile || input.leagueProfiles?.[league] || {};
    const leagueStats = calculateLeagueStats(historicalBeforeKickoff, league, leagueProfile);
    const ratings = buildDynamicRatings(historicalBeforeKickoff, input.teams || {}, leagueStats, beforeTimestamp, config);
    const homeTeam = match.homeTeam || input.teams?.[match.homeTeamId] || makePlaceholderTeam(match.homeTeamId);
    const awayTeam = match.awayTeam || input.teams?.[match.awayTeamId] || makePlaceholderTeam(match.awayTeamId);
    const homeRating = getTeamRatingState(homeTeam.id, ratings, input.teams, config);
    const awayRating = getTeamRatingState(awayTeam.id, ratings, input.teams, config);
    const homeForm = buildTeamFormWindows(homeTeam.id, historicalBeforeKickoff, ratings, beforeTimestamp);
    const awayForm = buildTeamFormWindows(awayTeam.id, historicalBeforeKickoff, ratings, beforeTimestamp);
    const h2h = summarizeHeadToHead(historicalBeforeKickoff, homeTeam.id, awayTeam.id);
    const advancedCoverage = calculateAdvancedCoverage(historicalBeforeKickoff, homeTeam.id, awayTeam.id);

    return {
      match,
      league,
      leagueProfile,
      leagueStats,
      history: historicalBeforeKickoff,
      ratings,
      homeTeam,
      awayTeam,
      homeRating,
      awayRating,
      homeForm,
      awayForm,
      h2h,
      advancedCoverage,
      historicalMatchesUsed: historicalBeforeKickoff.length,
      featuresUpdatedAt: input.generatedAt || DEFAULT_GENERATED_AT,
      historyCutoff: new Date(beforeTimestamp).toISOString(),
      fixtureMeta: input.fixtureMeta || {}
    };
  }

  function buildDynamicRatings(history, teams, leagueStats, beforeTimestamp, config = DEFAULT_CONFIG) {
    const states = new Map();
    const sorted = [...history].sort((a, b) => getRecordTimestamp(a) - getRecordTimestamp(b));

    Object.values(teams || {}).forEach((team) => {
      if (!team?.id) return;
      states.set(team.id, createRatingState(team.id, Number(team.rating), config));
    });

    sorted.forEach((record) => {
      const home = ensureRatingState(states, record.homeTeamId, teams, config);
      const away = ensureRatingState(states, record.awayTeamId, teams, config);
      const recencyWeight = calculateRecencyWeight(record, beforeTimestamp, config);
      const leagueWeight = getLeagueStrength(record.competitionId, config);
      const k = config.elo.kFactor * recencyWeight * leagueWeight;
      const expectedHome = eloExpected(home.overall + config.elo.homeAdvantageRating, away.overall);
      const actualHome = record.homeGoals > record.awayGoals ? 1 : record.homeGoals === record.awayGoals ? 0.5 : 0;
      const marginMultiplier = Math.max(1, Math.log(Math.abs(record.homeGoals - record.awayGoals) + 1) + 0.7);
      const change = k * marginMultiplier * (actualHome - expectedHome);

      home.overall = regressRating(home.overall + change, config);
      away.overall = regressRating(away.overall - change, config);

      updateAttackDefenseStrength(home, away, record.homeGoals, record.awayGoals, leagueStats.avgHomeGoals, leagueStats.avgAwayGoals, recencyWeight, config);
      updateAttackDefenseStrength(away, home, record.awayGoals, record.homeGoals, leagueStats.avgAwayGoals, leagueStats.avgHomeGoals, recencyWeight, config);

      home.matches += 1;
      away.matches += 1;
      home.lastPlayedAt = record.kickoff;
      away.lastPlayedAt = record.kickoff;
    });

    return states;
  }

  function buildTeamFormWindows(teamId, history, ratings, beforeTimestamp) {
    const teamMatches = history
      .filter((record) => record.homeTeamId === teamId || record.awayTeamId === teamId)
      .sort((a, b) => getRecordTimestamp(b) - getRecordTimestamp(a));

    return {
      last5: summarizeTeamWindow(teamId, teamMatches.slice(0, 5), ratings, beforeTimestamp),
      last10: summarizeTeamWindow(teamId, teamMatches.slice(0, 10), ratings, beforeTimestamp),
      last20: summarizeTeamWindow(teamId, teamMatches.slice(0, 20), ratings, beforeTimestamp),
      season: summarizeTeamWindow(teamId, getCurrentSeasonMatches(teamMatches, beforeTimestamp), ratings, beforeTimestamp),
      home: summarizeTeamWindow(
        teamId,
        teamMatches.filter((record) => record.homeTeamId === teamId).slice(0, 10),
        ratings,
        beforeTimestamp
      ),
      away: summarizeTeamWindow(
        teamId,
        teamMatches.filter((record) => record.awayTeamId === teamId).slice(0, 10),
        ratings,
        beforeTimestamp
      )
    };
  }

  function summarizeTeamWindow(teamId, records, ratings, beforeTimestamp) {
    const summary = {
      wins: 0,
      draws: 0,
      losses: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      cleanSheets: 0,
      failedToScore: 0,
      points: 0,
      adjustedPoints: 0,
      weightedPoints: 0,
      weightTotal: 0,
      results: [],
      matches: []
    };

    records.forEach((record) => {
      const isHome = record.homeTeamId === teamId;
      const opponentId = isHome ? record.awayTeamId : record.homeTeamId;
      const goalsFor = isHome ? record.homeGoals : record.awayGoals;
      const goalsAgainst = isHome ? record.awayGoals : record.homeGoals;
      const result = goalsFor > goalsAgainst ? "W" : goalsFor === goalsAgainst ? "D" : "L";
      const points = result === "W" ? 3 : result === "D" ? 1 : 0;
      const opponentRating = ratings.get(opponentId)?.overall || 1600;
      const strengthAdjustment = clamp((opponentRating - 1600) / 900, -0.35, 0.35);
      const adjustedPoints = clamp(points + strengthAdjustment, 0, 3.35);
      const weight = calculateRecencyWeight(record, beforeTimestamp, DEFAULT_CONFIG);

      summary.wins += result === "W" ? 1 : 0;
      summary.draws += result === "D" ? 1 : 0;
      summary.losses += result === "L" ? 1 : 0;
      summary.goalsFor += goalsFor;
      summary.goalsAgainst += goalsAgainst;
      summary.cleanSheets += goalsAgainst === 0 ? 1 : 0;
      summary.failedToScore += goalsFor === 0 ? 1 : 0;
      summary.points += points;
      summary.adjustedPoints += adjustedPoints;
      summary.weightedPoints += adjustedPoints * weight;
      summary.weightTotal += weight;
      summary.results.push(result);
      summary.matches.push({
        date: record.date,
        competition: record.competitionId,
        opponentId,
        opponent: isHome ? record.awayTeamName || opponentId : record.homeTeamName || opponentId,
        venue: isHome ? "H" : "A",
        goalsFor,
        goalsAgainst,
        result,
        source: record.source
      });
    });

    const matchesPlayed = records.length;
    return {
      ...summary,
      matchesPlayed,
      avgGoalsFor: matchesPlayed ? summary.goalsFor / matchesPlayed : 0,
      avgGoalsAgainst: matchesPlayed ? summary.goalsAgainst / matchesPlayed : 0,
      goalDifference: summary.goalsFor - summary.goalsAgainst,
      goalDifferencePerMatch: matchesPlayed ? (summary.goalsFor - summary.goalsAgainst) / matchesPlayed : 0,
      pointsPerMatch: matchesPlayed ? summary.points / matchesPlayed : 0,
      adjustedPointsPerMatch: matchesPlayed ? summary.adjustedPoints / matchesPlayed : 0,
      recencyWeightedPointsPerMatch: summary.weightTotal ? summary.weightedPoints / summary.weightTotal : 0,
      cleanSheetPct: matchesPlayed ? (summary.cleanSheets / matchesPlayed) * 100 : 0,
      failedToScorePct: matchesPlayed ? (summary.failedToScore / matchesPlayed) * 100 : 0
    };
  }

  function buildEloOutcomeModel(features, config) {
    const ratingDiff = features.homeRating.overall + config.elo.homeAdvantageRating - features.awayRating.overall;
    const noDrawHome = eloExpected(features.homeRating.overall + config.elo.homeAdvantageRating, features.awayRating.overall);
    const parity = 1 - clamp(Math.abs(ratingDiff) / 500, 0, 1);
    const draw = clamp(features.leagueStats.drawRate + parity * 0.055, 0.16, 0.34);
    const home = noDrawHome * (1 - draw);
    const away = (1 - noDrawHome) * (1 - draw);

    return {
      ratingDiff,
      outcomes: normalizeThreeWay({ home, draw, away })
    };
  }

  function buildFormOutcomeModel(features) {
    const homeWindow = features.homeForm.last10.matchesPlayed ? features.homeForm.last10 : features.homeForm.last5;
    const awayWindow = features.awayForm.last10.matchesPlayed ? features.awayForm.last10 : features.awayForm.last5;
    const formEdge =
      (homeWindow.recencyWeightedPointsPerMatch - awayWindow.recencyWeightedPointsPerMatch) * 0.34 +
      (homeWindow.goalDifferencePerMatch - awayWindow.goalDifferencePerMatch) * 0.16 +
      (features.leagueProfile.homeAdvantage || 0.08);
    const homeNoDraw = sigmoid(formEdge);
    const coverage = clamp((homeWindow.matchesPlayed + awayWindow.matchesPlayed) / 20, 0, 1);
    const draw = clamp(features.leagueStats.drawRate + (1 - Math.abs(formEdge)) * 0.035 - coverage * 0.015, 0.17, 0.35);
    const home = homeNoDraw * (1 - draw);
    const away = (1 - homeNoDraw) * (1 - draw);

    return {
      formEdge,
      outcomes: normalizeThreeWay({ home, draw, away })
    };
  }

  function estimateGoalExpectations(features, eloModel, formModel, config) {
    const weights = normalizeWeights(config.modelWeights);
    const homeBase = features.leagueStats.avgHomeGoals * getLeagueStrength(features.league, config);
    const awayBase = features.leagueStats.avgAwayGoals * getLeagueStrength(features.league, config);
    const homeAttack = blend(features.homeRating.attack, formAttackIndex(features.homeForm.last10, homeBase), 0.28);
    const awayAttack = blend(features.awayRating.attack, formAttackIndex(features.awayForm.last10, awayBase), 0.28);
    const homeDefence = blend(features.homeRating.defence, formDefenceIndex(features.homeForm.last10, awayBase), 0.24);
    const awayDefence = blend(features.awayRating.defence, formDefenceIndex(features.awayForm.last10, homeBase), 0.24);
    const eloEdge = logit(eloModel.outcomes.home + eloModel.outcomes.draw * 0.5) * weights.elo;
    const formEdge = logit(formModel.outcomes.home + formModel.outcomes.draw * 0.5) * weights.form;
    const homeAdvantage = features.leagueProfile.homeAdvantage ?? 0.08;
    const marketEdgeMultiplier = Math.exp(clamp((eloEdge + formEdge) * 0.28, -0.18, 0.18));
    const homeAdvantageMultiplier = Math.exp(clamp(homeAdvantage, 0, 0.18));

    const lambdaHome = clamp(
      homeBase * homeAttack * awayDefence * homeAdvantageMultiplier * marketEdgeMultiplier,
      config.poisson.minLambda,
      config.poisson.maxLambda
    );
    const lambdaAway = clamp(
      awayBase * awayAttack * homeDefence / marketEdgeMultiplier,
      config.poisson.minLambda,
      config.poisson.maxLambda
    );

    return {
      lambdaHome: roundMetric(lambdaHome, 4),
      lambdaAway: roundMetric(lambdaAway, 4),
      homeAttack: roundMetric(homeAttack, 4),
      awayAttack: roundMetric(awayAttack, 4),
      homeDefence: roundMetric(homeDefence, 4),
      awayDefence: roundMetric(awayDefence, 4)
    };
  }

  function buildScoreMatrix(lambdaHome, lambdaAway, currentScore = { home: 0, away: 0 }, maxGoals = MAX_SCORE_GOALS, rho = -0.08) {
    const matrix = [];
    let total = 0;
    for (let homeAdd = 0; homeAdd <= maxGoals; homeAdd += 1) {
      const row = [];
      for (let awayAdd = 0; awayAdd <= maxGoals; awayAdd += 1) {
        const baseProbability = poisson(lambdaHome, homeAdd) * poisson(lambdaAway, awayAdd);
        const correction = dixonColesAdjustment(homeAdd, awayAdd, lambdaHome, lambdaAway, rho);
        const probability = Math.max(0, baseProbability * correction);
        total += probability;
        row.push({
          homeGoals: currentScore.home + homeAdd,
          awayGoals: currentScore.away + awayAdd,
          homeAdditionalGoals: homeAdd,
          awayAdditionalGoals: awayAdd,
          probability
        });
      }
      matrix.push(row);
    }

    if (total > 0) {
      matrix.forEach((row) => {
        row.forEach((score) => {
          score.probability /= total;
        });
      });
    }

    return matrix;
  }

  function summarizeScoreMatrix(matrix, lambdas = {}) {
    const result = {
      home: 0,
      draw: 0,
      away: 0,
      over05: 0,
      under05: 0,
      over15: 0,
      under15: 0,
      over25: 0,
      under25: 0,
      over35: 0,
      under35: 0,
      over45: 0,
      under45: 0,
      btts: 0,
      homeCleanSheet: 0,
      awayCleanSheet: 0,
      expectedHomeGoals: 0,
      expectedAwayGoals: 0,
      mostLikelyScore: { homeGoals: 0, awayGoals: 0, probability: 0 }
    };

    matrix.forEach((row) => {
      row.forEach((score) => {
        const totalGoals = score.homeGoals + score.awayGoals;
        if (score.homeGoals > score.awayGoals) result.home += score.probability;
        if (score.homeGoals === score.awayGoals) result.draw += score.probability;
        if (score.homeGoals < score.awayGoals) result.away += score.probability;
        if (totalGoals > 0.5) result.over05 += score.probability;
        if (totalGoals <= 0.5) result.under05 += score.probability;
        if (totalGoals > 1.5) result.over15 += score.probability;
        if (totalGoals <= 1.5) result.under15 += score.probability;
        if (totalGoals > 2.5) result.over25 += score.probability;
        if (totalGoals <= 2.5) result.under25 += score.probability;
        if (totalGoals > 3.5) result.over35 += score.probability;
        if (totalGoals <= 3.5) result.under35 += score.probability;
        if (totalGoals > 4.5) result.over45 += score.probability;
        if (totalGoals <= 4.5) result.under45 += score.probability;
        if (score.homeGoals > 0 && score.awayGoals > 0) result.btts += score.probability;
        if (score.awayGoals === 0) result.homeCleanSheet += score.probability;
        if (score.homeGoals === 0) result.awayCleanSheet += score.probability;
        result.expectedHomeGoals += score.homeGoals * score.probability;
        result.expectedAwayGoals += score.awayGoals * score.probability;
        if (score.probability > result.mostLikelyScore.probability) result.mostLikelyScore = score;
      });
    });

    const outcomeTotal = result.home + result.draw + result.away;
    if (outcomeTotal > 0) {
      result.home /= outcomeTotal;
      result.draw /= outcomeTotal;
      result.away /= outcomeTotal;
    }
    result.firstHalfGoal = clamp(1 - Math.exp(-((lambdas.lambdaHome || result.expectedHomeGoals) + (lambdas.lambdaAway || result.expectedAwayGoals)) * 0.45), 0.05, 0.92);

    Object.keys(result).forEach((key) => {
      if (typeof result[key] === "number") result[key] = roundMetric(result[key], 6);
    });

    return result;
  }

  function dixonColesAdjustment(homeGoals, awayGoals, lambdaHome, lambdaAway, rho = -0.08) {
    if (homeGoals === 0 && awayGoals === 0) return Math.max(0.01, 1 - lambdaHome * lambdaAway * rho);
    if (homeGoals === 0 && awayGoals === 1) return Math.max(0.01, 1 + lambdaHome * rho);
    if (homeGoals === 1 && awayGoals === 0) return Math.max(0.01, 1 + lambdaAway * rho);
    if (homeGoals === 1 && awayGoals === 1) return Math.max(0.01, 1 - rho);
    return 1;
  }

  function poisson(lambda, goals) {
    if (!Number.isFinite(lambda) || lambda < 0 || goals < 0) return 0;
    return (Math.pow(lambda, goals) * Math.exp(-lambda)) / factorial(goals);
  }

  function calculatePredictionDataQuality(features, disagreement, fixtureMeta, generatedAt) {
    const homeSamples = features.homeForm.last20.matchesPlayed;
    const awaySamples = features.awayForm.last20.matchesPlayed;
    const sampleScore = clamp((homeSamples + awaySamples) / 40, 0, 1);
    const formCoverage = clamp((features.homeForm.last5.matchesPlayed + features.awayForm.last5.matchesPlayed) / 10, 0, 1);
    const h2hCoverage = clamp(features.h2h.total / 5, 0, 1);
    const freshness = calculateFreshnessScore(fixtureMeta.updatedAt, generatedAt);
    const identityConfidence = calculateIdentityConfidence(features.homeTeam, features.awayTeam);
    const advancedStats = features.advancedCoverage.xg || features.advancedCoverage.shots ? 1 : 0;
    const lineupAvailability = 0;
    const injuryAvailability = 0;
    const modelAgreement = 1 - clamp(disagreement.maxOutcomeSpread / 0.24, 0, 1);
    const inputCompleteness = clamp(
      sampleScore * 0.28 +
        formCoverage * 0.16 +
        freshness * 0.15 +
        identityConfidence * 0.12 +
        modelAgreement * 0.18 +
        h2hCoverage * 0.05 +
        advancedStats * 0.03 +
        lineupAvailability * 0.015 +
        injuryAvailability * 0.015,
      0,
      1
    );
    const scorePercent = Math.round(inputCompleteness * 100);
    const label = scorePercent >= 78 ? "Strong" : scorePercent >= 55 ? "Moderate" : "Limited";
    const level = label.toLowerCase();
    const freshnessLabel = classifyFreshness(fixtureMeta.updatedAt, generatedAt);
    const reasons = [
      `${homeSamples + awaySamples} historical team-match samples available before kickoff`,
      `${features.homeForm.last5.matchesPlayed + features.awayForm.last5.matchesPlayed} recent form rows available`,
      `${freshnessLabel} fixture feed`,
      "xG provider data unavailable",
      "lineup and injury providers unavailable",
      disagreement.maxOutcomeSpread > 0.16 ? "model disagreement is elevated" : "model agreement is acceptable"
    ];
    const summary =
      label === "Strong"
        ? "verified fixtures plus a usable historical sample"
        : label === "Moderate"
          ? "usable but incomplete evidence"
          : "limited evidence, ratings and league averages carry more weight";

    return {
      score: roundMetric(inputCompleteness, 4),
      scorePercent,
      label,
      level,
      summary,
      reasons,
      formMatches: features.homeForm.last5.matchesPlayed + features.awayForm.last5.matchesPlayed,
      h2hMatches: features.h2h.total,
      freshness: freshnessLabel,
      inputCompleteness: roundMetric(inputCompleteness, 4),
      advancedStatsAvailable: Boolean(advancedStats),
      lineupAvailable: false,
      injuryDataAvailable: false
    };
  }

  function calculatePredictionConfidence(outcome, dataQuality, disagreement) {
    const ordered = [outcome.home, outcome.draw, outcome.away].sort((a, b) => b - a);
    const edge = ordered[0] - ordered[1];
    const disagreementPenalty = clamp(disagreement.maxOutcomeSpread / 0.28, 0, 1) * 0.22;
    const score = clamp(dataQuality.score * 0.58 + edge * 0.9 - disagreementPenalty + 0.04, 0, 1);
    const label = score >= 0.74 ? "High" : score >= 0.48 ? "Medium" : "Low";
    return {
      score: roundMetric(score, 4),
      label
    };
  }

  function buildPredictionExplanation({ features, poissonOutcome, lambdas, models, dataQuality, disagreement }) {
    const home = features.homeTeam;
    const away = features.awayTeam;
    const ratingEdge = (features.homeRating.overall - features.awayRating.overall) / 260;
    const attackEdge = (lambdas.homeAttack - lambdas.awayAttack) / 1.4;
    const defenceEdge = (features.awayRating.defence - features.homeRating.defence) / 1.2;
    const formEdge = (features.homeForm.last10.adjustedPointsPerMatch - features.awayForm.last10.adjustedPointsPerMatch) / 2.2;
    const modelEdge = getOutcomeEdge(poissonOutcome, home, away);
    const summary = `${modelEdge.summary} - ${dataQuality.label} data`;

    return {
      summary,
      rows: [
        breakdownEdgeRow(
          "Long-term rating",
          clamp(ratingEdge, -1, 1),
          home,
          away,
          `${Math.round(features.homeRating.overall)} vs ${Math.round(features.awayRating.overall)}`,
          "Elo-style ratings update chronologically from earlier results."
        ),
        breakdownEdgeRow(
          "Attack strength",
          clamp(attackEdge, -1, 1),
          home,
          away,
          `${formatDecimal(lambdas.homeAttack)} vs ${formatDecimal(lambdas.awayAttack)}`,
          "Separate attack indexes are derived from goals scored, opponent strength, and recency."
        ),
        breakdownEdgeRow(
          "Defence strength",
          clamp(defenceEdge, -1, 1),
          home,
          away,
          `${formatDecimal(features.homeRating.defence)} vs ${formatDecimal(features.awayRating.defence)}`,
          "Lower defensive concession index is stronger."
        ),
        breakdownEdgeRow(
          "Adjusted form",
          clamp(formEdge, -1, 1),
          home,
          away,
          `${formatDecimal(features.homeForm.last10.adjustedPointsPerMatch)} PPM vs ${formatDecimal(features.awayForm.last10.adjustedPointsPerMatch)} PPM`,
          "Recent points are adjusted for opponent strength and weighted by freshness."
        ),
        {
          label: "Model agreement",
          direction: disagreement.maxOutcomeSpread > 0.16 ? "balanced" : "neutral",
          score: clamp(1 - disagreement.maxOutcomeSpread / 0.3, 0, 1),
          lean: disagreement.maxOutcomeSpread > 0.16 ? "Mixed signals" : "Aligned signals",
          value: `${Math.round(disagreement.maxOutcomeSpread * 100)}% spread`,
          description: `Elo ${formatProbability(models.elo.outcomes.home)}, Poisson ${formatProbability(models.poisson.outcomes.home)}, form ${formatProbability(models.form.outcomes.home)} home-win reads.`
        },
        {
          label: "Data provenance",
          direction: "neutral",
          score: dataQuality.score,
          lean: `${dataQuality.label} evidence`,
          value: `${dataQuality.scorePercent}/100`,
          description: dataQuality.reasons.join(" ")
        }
      ]
    };
  }

  function buildPredictionInsights({ features, lambdas, dataQuality, disagreement }) {
    const home = features.homeTeam;
    const away = features.awayTeam;
    const insights = [];

    if (features.homeForm.last5.matchesPlayed && features.awayForm.last5.matchesPlayed) {
      insights.push(
        `Recent form: ${home.shortName || home.name} ${formatDecimal(features.homeForm.last5.pointsPerMatch)} PPM vs ${away.shortName || away.name} ${formatDecimal(
          features.awayForm.last5.pointsPerMatch
        )} PPM.`
      );
    } else {
      insights.push("Recent form is incomplete, so ratings and competition goal rates carry more weight.");
    }

    insights.push(
      `Expected scoring model: ${home.shortName || home.name} ${formatDecimal(lambdas.lambdaHome)}, ${away.shortName || away.name} ${formatDecimal(
        lambdas.lambdaAway
      )}.`
    );

    if (features.h2h.total) {
      insights.push(`Head-to-head sample: ${features.h2h.homeWins}-${features.h2h.draws}-${features.h2h.awayWins} across ${features.h2h.total} verified meeting(s).`);
    } else {
      insights.push("No verified head-to-head sample is available before kickoff.");
    }

    if (disagreement.maxOutcomeSpread > 0.16) {
      insights.push("Internal model disagreement is elevated, so confidence is reduced.");
    } else {
      insights.push(`${dataQuality.label} data quality with acceptable model agreement.`);
    }

    return insights.slice(0, 4);
  }

  function buildProvenanceStatistics(features, lambdas) {
    const homeAttacking = aggregateProviderStats(features.history, features.homeTeam.id, "attack");
    const awayAttacking = aggregateProviderStats(features.history, features.awayTeam.id, "attack");
    const homeDefensive = aggregateProviderStats(features.history, features.homeTeam.id, "defence");
    const awayDefensive = aggregateProviderStats(features.history, features.awayTeam.id, "defence");

    return {
      attacking: [
        {
          label: "Recent goals per match",
          home: derivedStat(features.homeForm.last10.avgGoalsFor, "last-10-results", features.featuresUpdatedAt),
          away: derivedStat(features.awayForm.last10.avgGoalsFor, "last-10-results", features.featuresUpdatedAt)
        },
        {
          label: "Expected scoring model",
          home: modelStat(lambdas.lambdaHome, "dixon-coles-poisson", features.featuresUpdatedAt),
          away: modelStat(lambdas.lambdaAway, "dixon-coles-poisson", features.featuresUpdatedAt)
        },
        {
          label: "Average shots",
          home: providerOrUnavailable(homeAttacking.shots, "licensed-statistics-provider", features.featuresUpdatedAt),
          away: providerOrUnavailable(awayAttacking.shots, "licensed-statistics-provider", features.featuresUpdatedAt)
        },
        {
          label: "Shots on target",
          home: providerOrUnavailable(homeAttacking.shotsOnTarget, "licensed-statistics-provider", features.featuresUpdatedAt),
          away: providerOrUnavailable(awayAttacking.shotsOnTarget, "licensed-statistics-provider", features.featuresUpdatedAt)
        },
        {
          label: "Big chances",
          home: unavailableStat("Big chances provider is not configured."),
          away: unavailableStat("Big chances provider is not configured.")
        },
        {
          label: "Provider xG",
          home: providerOrUnavailable(homeAttacking.xg, "expected-goals-provider", features.featuresUpdatedAt),
          away: providerOrUnavailable(awayAttacking.xg, "expected-goals-provider", features.featuresUpdatedAt)
        }
      ],
      defensive: [
        {
          label: "Goals conceded avg",
          home: derivedStat(features.homeForm.last10.avgGoalsAgainst, "last-10-results", features.featuresUpdatedAt),
          away: derivedStat(features.awayForm.last10.avgGoalsAgainst, "last-10-results", features.featuresUpdatedAt)
        },
        {
          label: "Clean sheet percentage",
          home: derivedStat(features.homeForm.last10.cleanSheetPct, "last-10-results", features.featuresUpdatedAt, "%"),
          away: derivedStat(features.awayForm.last10.cleanSheetPct, "last-10-results", features.featuresUpdatedAt, "%")
        },
        {
          label: "Provider xGA",
          home: providerOrUnavailable(homeDefensive.xgAgainst, "expected-goals-provider", features.featuresUpdatedAt),
          away: providerOrUnavailable(awayDefensive.xgAgainst, "expected-goals-provider", features.featuresUpdatedAt)
        },
        {
          label: "Cards",
          home: unavailableStat("Cards provider is not configured."),
          away: unavailableStat("Cards provider is not configured.")
        }
      ]
    };
  }

  function buildMarketRecommendations(outcome, home, away, dataQuality) {
    const noDrawTotal = outcome.home + outcome.away;
    const homeShort = home.shortName || home.name || "Home";
    const awayShort = away.shortName || away.name || "Away";
    const candidates = [
      marketCandidate(`${homeShort} or draw`, "Double chance", outcome.home + outcome.draw, "Covers the home win and draw outcomes from the score matrix."),
      marketCandidate(`${awayShort} or draw`, "Double chance", outcome.away + outcome.draw, "Covers the away win and draw outcomes from the score matrix."),
      marketCandidate("No draw", "Double chance", outcome.home + outcome.away, "Covers either team winning; draw remains the risk."),
      marketCandidate(
        `${homeShort} draw no bet`,
        "Draw no bet",
        noDrawTotal ? outcome.home / noDrawTotal : 0,
        "Uses the score matrix after removing the draw state."
      ),
      marketCandidate(
        `${awayShort} draw no bet`,
        "Draw no bet",
        noDrawTotal ? outcome.away / noDrawTotal : 0,
        "Uses the score matrix after removing the draw state."
      ),
      marketCandidate("Over 1.5 goals", "Goals", outcome.over15, "Derived directly from the same score matrix."),
      marketCandidate("Under 3.5 goals", "Goals", outcome.under35, "Derived directly from the same score matrix."),
      marketCandidate("Both teams to score", "BTTS", outcome.btts, "Derived directly from the same score matrix."),
      marketCandidate("BTTS - No", "BTTS", 1 - outcome.btts, "One or both teams fail to score in the matrix.")
    ];

    const ranked = candidates
      .map((candidate) => ({
        ...candidate,
        risk: classifyMarketRisk(candidate.probability, dataQuality),
        rank: rankMarketCandidate(candidate, dataQuality)
      }))
      .sort((a, b) => b.rank - a.rank);

    return {
      recommended: ranked[0],
      alternatives: ranked.slice(1, 3),
      all: ranked
    };
  }

  function backtestPredictions(input = {}) {
    const teams = input.teams || {};
    const matches = buildHistoricalDatabase({ matches: input.matches || [], teams, now: input.generatedAt || DEFAULT_GENERATED_AT });
    const finishedMatches = matches.filter((match) => Number.isFinite(match.homeGoals) && Number.isFinite(match.awayGoals)).sort(compareMatchDates);
    const rows = [];

    finishedMatches.forEach((record) => {
      const prediction = predictMatchV2({
        match: {
          id: record.id,
          league: record.competitionId,
          date: record.date,
          time: record.kickoff.slice(11, 16),
          homeTeamId: record.homeTeamId,
          awayTeamId: record.awayTeamId,
          status: "upcoming"
        },
        matches: finishedMatches.filter((candidate) => candidate.id !== record.id),
        teams,
        leagueProfiles: input.leagueProfiles || {},
        fixtureMeta: input.fixtureMeta || {},
        generatedAt: record.kickoff,
        config: input.config || DEFAULT_CONFIG
      });
      rows.push({
        matchId: record.id,
        competition: record.competitionId,
        season: record.season,
        date: record.date,
        probabilities: prediction.probabilities,
        actual: getActualOutcome(record),
        topPick: topOutcome(prediction.probabilities),
        baselines: buildBaselinePredictions(record, finishedMatches, teams)
      });
    });

    return summarizeBacktestRows(rows);
  }

  function summarizeBacktestRows(rows) {
    const samples = rows.length;
    const summary = {
      modelVersion: MODEL_VERSION,
      generatedAt: new Date().toISOString(),
      samples,
      homeWinAccuracy: 0,
      drawAccuracy: 0,
      awayWinAccuracy: 0,
      topPickAccuracy: 0,
      brierScore: null,
      logLoss: null,
      calibrationBuckets: buildEmptyCalibrationBuckets(),
      baselines: {
        homeTeam: null,
        leagueFrequency: null,
        eloOnly: null
      },
      byCompetition: {},
      bySeason: {}
    };

    if (!samples) return summary;

    const modelMetrics = calculateRowsMetrics(rows, (row) => row.probabilities);
    Object.assign(summary, modelMetrics);
    summary.calibrationBuckets = calculateCalibrationBuckets(rows, (row) => row.probabilities);
    summary.baselines.homeTeam = calculateRowsMetrics(rows, () => ({ home: 1, draw: 0, away: 0 }));
    summary.baselines.leagueFrequency = calculateRowsMetrics(rows, (row) => row.baselines.leagueFrequency);
    summary.baselines.eloOnly = calculateRowsMetrics(rows, (row) => row.baselines.eloOnly);
    summary.byCompetition = groupBacktest(rows, "competition");
    summary.bySeason = groupBacktest(rows, "season");

    return summary;
  }

  function createPredictionSnapshot(input = {}) {
    const generatedAt = input.generatedAt || new Date().toISOString();
    const matches = Array.isArray(input.matches) ? input.matches : [];
    return {
      modelVersion: MODEL_VERSION,
      generatedAt,
      fixtureDataUpdatedAt: input.fixtureMeta?.updatedAt || null,
      predictions: matches
        .filter((match) => !normalizeScore(match.score) && !["finished", "awarded"].includes(normalizeStatus(match.status)))
        .map((match) => {
          const prediction = predictMatchV2({
            match,
            matches,
            teams: input.teams || {},
            leagueProfiles: input.leagueProfiles || {},
            fixtureMeta: input.fixtureMeta || {},
            generatedAt,
            config: input.config || DEFAULT_CONFIG
          });
          return {
            matchId: match.id,
            competition: match.league || match.competition,
            date: match.date,
            homeTeamId: match.homeTeamId,
            awayTeamId: match.awayTeamId,
            probabilities: { ...prediction.probabilities },
            predictedScore: prediction.predictedScore,
            dataQualityScore: prediction.dataQualityScore,
            modelDisagreement: prediction.modelDisagreement.maxOutcomeSpread
          };
        })
    };
  }

  function parseFootballDataCsv(csvText) {
    const rows = parseCsv(csvText);
    if (!rows.length) return [];
    const headers = rows[0].map((header) => String(header || "").trim());
    return rows.slice(1).filter((row) => row.some((cell) => String(cell || "").trim())).map((row) => {
      const entry = {};
      headers.forEach((header, index) => {
        entry[header] = row[index] ?? "";
      });
      return entry;
    });
  }

  function adaptFootballDataCoUkRows(rows, options = {}) {
    const competitionId = normalizeLeague(options.competition || options.league || options.division || "DEFAULT");
    const season = options.season || "";
    return rows
      .map((row, index) => {
        const date = normalizeCsvDate(row.Date || row.MatchDate || row.date);
        const homeTeamId = createTeamId(row.HomeTeam || row.Home || "", competitionId);
        const awayTeamId = createTeamId(row.AwayTeam || row.Away || "", competitionId);
        const homeGoals = finiteOrNull(row.FTHG ?? row.HomeGoals);
        const awayGoals = finiteOrNull(row.FTAG ?? row.AwayGoals);
        if (!date || !homeTeamId || !awayTeamId || !Number.isFinite(homeGoals) || !Number.isFinite(awayGoals)) return null;
        return {
          id: `fduk-${competitionId}-${season || "season"}-${index}-${date}-${homeTeamId}-${awayTeamId}`.toLowerCase(),
          competitionId,
          season: season || normalizeSeason(row.Season, date),
          date,
          kickoff: `${date}T00:00:00.000Z`,
          homeTeamId,
          awayTeamId,
          homeGoals,
          awayGoals,
          halftimeHomeGoals: finiteOrNull(row.HTHG),
          halftimeAwayGoals: finiteOrNull(row.HTAG),
          homeShots: finiteOrNull(row.HS),
          awayShots: finiteOrNull(row.AS),
          homeShotsOnTarget: finiteOrNull(row.HST),
          awayShotsOnTarget: finiteOrNull(row.AST),
          homeXg: finiteOrNull(row.HxG ?? row.home_xg),
          awayXg: finiteOrNull(row.AxG ?? row.away_xg),
          source: "football-data.co.uk-csv",
          sourceQuality: {
            fixture: "csv-import",
            score: "csv-import",
            advancedStats: hasAnyValue(row, ["HS", "AS", "HST", "AST", "HxG", "AxG", "home_xg", "away_xg"]) ? "csv-import" : "unavailable"
          }
        };
      })
      .filter(Boolean);
  }

  function buildModelOutput(name, outcomes) {
    return {
      name,
      outcomes: normalizeThreeWay({
        home: outcomes.home,
        draw: outcomes.draw,
        away: outcomes.away
      })
    };
  }

  function calculateModelDisagreement(models) {
    const modelOutcomes = Object.values(models).map((model) => model.outcomes);
    const spreads = ["home", "draw", "away"].map((key) => {
      const values = modelOutcomes.map((outcome) => outcome[key]);
      return Math.max(...values) - Math.min(...values);
    });
    return {
      homeSpread: roundMetric(spreads[0], 4),
      drawSpread: roundMetric(spreads[1], 4),
      awaySpread: roundMetric(spreads[2], 4),
      maxOutcomeSpread: roundMetric(Math.max(...spreads), 4)
    };
  }

  function calculateLeagueStats(history, league, profile = {}) {
    const leagueMatches = history.filter((record) => record.competitionId === league);
    const pool = leagueMatches.length >= 6 ? leagueMatches : history;
    if (!pool.length) {
      const avgGoals = Number(profile.avgGoals) || 2.65;
      return {
        avgGoals,
        avgHomeGoals: avgGoals * 0.53,
        avgAwayGoals: avgGoals * 0.47,
        homeWinRate: 0.43,
        drawRate: 0.26,
        awayWinRate: 0.31
      };
    }

    const totals = pool.reduce(
      (summary, record) => {
        summary.homeGoals += record.homeGoals;
        summary.awayGoals += record.awayGoals;
        summary.homeWins += record.homeGoals > record.awayGoals ? 1 : 0;
        summary.draws += record.homeGoals === record.awayGoals ? 1 : 0;
        summary.awayWins += record.homeGoals < record.awayGoals ? 1 : 0;
        return summary;
      },
      { homeGoals: 0, awayGoals: 0, homeWins: 0, draws: 0, awayWins: 0 }
    );

    return {
      avgGoals: (totals.homeGoals + totals.awayGoals) / pool.length,
      avgHomeGoals: Math.max(0.55, totals.homeGoals / pool.length),
      avgAwayGoals: Math.max(0.45, totals.awayGoals / pool.length),
      homeWinRate: totals.homeWins / pool.length,
      drawRate: totals.draws / pool.length,
      awayWinRate: totals.awayWins / pool.length
    };
  }

  function summarizeHeadToHead(history, homeTeamId, awayTeamId) {
    const meetings = history
      .filter(
        (record) =>
          (record.homeTeamId === homeTeamId && record.awayTeamId === awayTeamId) ||
          (record.homeTeamId === awayTeamId && record.awayTeamId === homeTeamId)
      )
      .sort((a, b) => getRecordTimestamp(b) - getRecordTimestamp(a))
      .slice(0, 5);
    const summary = meetings.reduce(
      (totals, record) => {
        const homePerspectiveGoals = record.homeTeamId === homeTeamId ? record.homeGoals : record.awayGoals;
        const awayPerspectiveGoals = record.homeTeamId === awayTeamId ? record.homeGoals : record.awayGoals;
        totals.total += 1;
        totals.goals += record.homeGoals + record.awayGoals;
        totals.homeWins += homePerspectiveGoals > awayPerspectiveGoals ? 1 : 0;
        totals.awayWins += awayPerspectiveGoals > homePerspectiveGoals ? 1 : 0;
        totals.draws += homePerspectiveGoals === awayPerspectiveGoals ? 1 : 0;
        totals.matches.push(record);
        return totals;
      },
      { total: 0, homeWins: 0, awayWins: 0, draws: 0, goals: 0, matches: [] }
    );

    return {
      ...summary,
      avgGoals: summary.total ? summary.goals / summary.total : 0
    };
  }

  function aggregateProviderStats(history, teamId, mode) {
    const stats = {
      shots: [],
      shotsOnTarget: [],
      xg: [],
      xgAgainst: []
    };

    history.forEach((record) => {
      const isHome = record.homeTeamId === teamId;
      const isAway = record.awayTeamId === teamId;
      if (!isHome && !isAway) return;
      if (mode === "attack") {
        pushFinite(stats.shots, isHome ? record.homeShots : record.awayShots);
        pushFinite(stats.shotsOnTarget, isHome ? record.homeShotsOnTarget : record.awayShotsOnTarget);
        pushFinite(stats.xg, isHome ? record.homeXg : record.awayXg);
      } else {
        pushFinite(stats.shots, isHome ? record.awayShots : record.homeShots);
        pushFinite(stats.shotsOnTarget, isHome ? record.awayShotsOnTarget : record.homeShotsOnTarget);
        pushFinite(stats.xgAgainst, isHome ? record.awayXg : record.homeXg);
      }
    });

    return {
      shots: averageOrNull(stats.shots),
      shotsOnTarget: averageOrNull(stats.shotsOnTarget),
      xg: averageOrNull(stats.xg),
      xgAgainst: averageOrNull(stats.xgAgainst)
    };
  }

  function calculateAdvancedCoverage(history, homeTeamId, awayTeamId) {
    const relevant = history.filter(
      (record) => record.homeTeamId === homeTeamId || record.awayTeamId === homeTeamId || record.homeTeamId === awayTeamId || record.awayTeamId === awayTeamId
    );
    return {
      shots: relevant.some((record) => Number.isFinite(record.homeShots) || Number.isFinite(record.awayShots)),
      xg: relevant.some((record) => Number.isFinite(record.homeXg) || Number.isFinite(record.awayXg))
    };
  }

  function derivedStat(value, method, updatedAt, suffix = "") {
    const numericValue = finiteOrNull(value);
    if (!Number.isFinite(numericValue)) return unavailableStat("Not enough finished results available.");
    return {
      value: numericValue,
      display: suffix === "%" ? `${Math.round(numericValue)}%` : formatDecimal(numericValue),
      sourceType: "derived",
      source: "verified result feed",
      method,
      updatedAt,
      verified: false,
      label: "Derived from verified scores"
    };
  }

  function modelStat(value, method, updatedAt) {
    return {
      value: Number(value),
      display: formatDecimal(Number(value)),
      sourceType: "model",
      method,
      updatedAt,
      verified: false,
      label: "Model estimate"
    };
  }

  function providerOrUnavailable(value, source, updatedAt) {
    const numericValue = finiteOrNull(value);
    if (!Number.isFinite(numericValue)) return unavailableStat(`${source} is not configured.`);
    return {
      value: numericValue,
      display: formatDecimal(numericValue),
      sourceType: "provider",
      source,
      updatedAt,
      verified: true,
      label: "Verified statistic"
    };
  }

  function unavailableStat(reason) {
    return {
      value: null,
      display: "Unavailable",
      sourceType: "unavailable",
      source: null,
      updatedAt: null,
      verified: false,
      label: "Unavailable",
      reason
    };
  }

  function createRatingState(teamId, rating, config) {
    return {
      teamId,
      overall: Number.isFinite(rating) ? rating : config.elo.baseRating,
      attack: 1,
      defence: 1,
      matches: 0,
      lastPlayedAt: null
    };
  }

  function ensureRatingState(states, teamId, teams, config) {
    if (!states.has(teamId)) {
      states.set(teamId, createRatingState(teamId, Number(teams?.[teamId]?.rating), config));
    }
    return states.get(teamId);
  }

  function getTeamRatingState(teamId, ratings, teams, config) {
    return ratings.get(teamId) || createRatingState(teamId, Number(teams?.[teamId]?.rating), config);
  }

  function updateAttackDefenseStrength(team, opponent, goalsFor, goalsAgainst, leagueGoalsFor, leagueGoalsAgainst, recencyWeight, config) {
    const learningRate = config.strengths.learningRate * recencyWeight;
    const attackSignal = clamp((goalsFor / Math.max(0.4, leagueGoalsFor)) / Math.max(0.55, opponent.defence), 0.35, 2.6);
    const defenceSignal = clamp((goalsAgainst / Math.max(0.35, leagueGoalsAgainst)) / Math.max(0.55, opponent.attack), 0.35, 2.6);
    team.attack = clamp(team.attack * (1 - learningRate) + attackSignal * learningRate, 0.55, 1.95);
    team.defence = clamp(team.defence * (1 - learningRate) + defenceSignal * learningRate, 0.52, 2.05);
  }

  function buildBaselinePredictions(record, history, teams) {
    const prior = history.filter((candidate) => getRecordTimestamp(candidate) < getRecordTimestamp(record));
    const leaguePrior = prior.filter((candidate) => candidate.competitionId === record.competitionId);
    const pool = leaguePrior.length ? leaguePrior : prior;
    const leagueFrequency = pool.length
      ? normalizeThreeWay({
          home: pool.filter((candidate) => candidate.homeGoals > candidate.awayGoals).length / pool.length,
          draw: pool.filter((candidate) => candidate.homeGoals === candidate.awayGoals).length / pool.length,
          away: pool.filter((candidate) => candidate.homeGoals < candidate.awayGoals).length / pool.length
        })
      : { home: 0.43, draw: 0.26, away: 0.31 };
    const homeRating = Number(teams?.[record.homeTeamId]?.rating) || 1600;
    const awayRating = Number(teams?.[record.awayTeamId]?.rating) || 1600;
    const homeNoDraw = eloExpected(homeRating + DEFAULT_CONFIG.elo.homeAdvantageRating, awayRating);
    const draw = leagueFrequency.draw;
    return {
      leagueFrequency,
      eloOnly: normalizeThreeWay({
        home: homeNoDraw * (1 - draw),
        draw,
        away: (1 - homeNoDraw) * (1 - draw)
      })
    };
  }

  function calculateRowsMetrics(rows, probabilityGetter) {
    if (!rows.length) {
      return {
        homeWinAccuracy: 0,
        drawAccuracy: 0,
        awayWinAccuracy: 0,
        topPickAccuracy: 0,
        brierScore: null,
        logLoss: null
      };
    }

    let homeCorrect = 0;
    let drawCorrect = 0;
    let awayCorrect = 0;
    let topCorrect = 0;
    let brier = 0;
    let logLoss = 0;
    rows.forEach((row) => {
      const probabilities = probabilityGetter(row);
      const actual = row.actual;
      const vector = actual === "home" ? [1, 0, 0] : actual === "draw" ? [0, 1, 0] : [0, 0, 1];
      const probs = [probabilities.home, probabilities.draw, probabilities.away].map((value) => clamp(Number(value) || 0.000001, 0.000001, 0.999999));
      homeCorrect += actual === "home" && topOutcome(probabilities) === "home" ? 1 : 0;
      drawCorrect += actual === "draw" && topOutcome(probabilities) === "draw" ? 1 : 0;
      awayCorrect += actual === "away" && topOutcome(probabilities) === "away" ? 1 : 0;
      topCorrect += topOutcome(probabilities) === actual ? 1 : 0;
      brier += probs.reduce((sum, probability, index) => sum + Math.pow(probability - vector[index], 2), 0) / 3;
      logLoss += -Math.log(probs[actual === "home" ? 0 : actual === "draw" ? 1 : 2]);
    });

    return {
      homeWinAccuracy: roundMetric(homeCorrect / rows.filter((row) => row.actual === "home").length || 0, 4),
      drawAccuracy: roundMetric(drawCorrect / rows.filter((row) => row.actual === "draw").length || 0, 4),
      awayWinAccuracy: roundMetric(awayCorrect / rows.filter((row) => row.actual === "away").length || 0, 4),
      topPickAccuracy: roundMetric(topCorrect / rows.length, 4),
      brierScore: roundMetric(brier / rows.length, 4),
      logLoss: roundMetric(logLoss / rows.length, 4)
    };
  }

  function calculateCalibrationBuckets(rows, probabilityGetter) {
    const buckets = buildEmptyCalibrationBuckets();
    rows.forEach((row) => {
      const probabilities = probabilityGetter(row);
      ["home", "draw", "away"].forEach((outcome) => {
        const probability = clamp(probabilities[outcome], 0, 1);
        const bucketIndex = Math.min(9, Math.floor(probability * 10));
        const bucket = buckets[bucketIndex];
        bucket.samples += 1;
        bucket.predictedTotal += probability;
        bucket.actualTotal += row.actual === outcome ? 1 : 0;
      });
    });
    return buckets.map((bucket) => ({
      bucket: bucket.bucket,
      samples: bucket.samples,
      averagePredicted: bucket.samples ? roundMetric(bucket.predictedTotal / bucket.samples, 4) : null,
      observedFrequency: bucket.samples ? roundMetric(bucket.actualTotal / bucket.samples, 4) : null
    }));
  }

  function buildEmptyCalibrationBuckets() {
    return Array.from({ length: 10 }, (_, index) => ({
      bucket: `${index * 10}-${(index + 1) * 10}%`,
      samples: 0,
      predictedTotal: 0,
      actualTotal: 0
    }));
  }

  function groupBacktest(rows, key) {
    return rows.reduce((groups, row) => {
      const groupKey = row[key] || "unknown";
      if (!groups[groupKey]) groups[groupKey] = calculateRowsMetrics(rows.filter((candidate) => (candidate[key] || "unknown") === groupKey), (candidate) => candidate.probabilities);
      return groups;
    }, {});
  }

  function normalizePredictionMatch(match = {}, teams = {}, leagueProfiles = {}) {
    const league = normalizeLeague(match.league || match.competition || "DEFAULT");
    const homeTeamId = normalizeTeamId(match.homeTeamId || match.homeId || match.homeTeam?.id || match.homeTeam || "HOME");
    const awayTeamId = normalizeTeamId(match.awayTeamId || match.awayId || match.awayTeam?.id || match.awayTeam || "AWAY");
    const homeTeam = normalizeTeam(match.homeTeam && typeof match.homeTeam === "object" ? match.homeTeam : teams[homeTeamId], homeTeamId);
    const awayTeam = normalizeTeam(match.awayTeam && typeof match.awayTeam === "object" ? match.awayTeam : teams[awayTeamId], awayTeamId);
    return {
      ...match,
      id: String(match.id || `${league}-${homeTeamId}-${awayTeamId}`),
      league,
      date: normalizeDate(match.date || match.kickoff || match.utcDate) || dateFromNow(new Date().toISOString(), 0),
      time: normalizeTime(match.time || match.kickoff || match.utcDate),
      homeTeamId,
      awayTeamId,
      homeTeam,
      awayTeam,
      leagueProfile: match.leagueProfile || leagueProfiles[league] || {},
      status: normalizeStatus(match.status) || "upcoming",
      score: normalizeScore(match.score)
    };
  }

  function normalizeTeam(team, fallbackId) {
    const id = normalizeTeamId(team?.id || fallbackId);
    const name = String(team?.name || fallbackId || "Team").trim();
    return {
      id,
      name,
      shortName: String(team?.shortName || makeShortName(name)).slice(0, 4).toUpperCase(),
      rating: Number.isFinite(Number(team?.rating)) ? Number(team.rating) : 1600,
      venue: team?.venue || "",
      form: Array.isArray(team?.form) ? team.form : []
    };
  }

  function makePlaceholderTeam(id) {
    return normalizeTeam({ id, name: id, shortName: id, rating: 1600, form: [] }, id);
  }

  function getLiveScoreOffset(match) {
    if (!["live", "halftime"].includes(normalizeStatus(match.status)) || !match.score) return { home: 0, away: 0 };
    return {
      home: Number(match.score.home) || 0,
      away: Number(match.score.away) || 0
    };
  }

  function getRemainingFactor(match) {
    if (!["live", "halftime"].includes(normalizeStatus(match.status))) return 1;
    const minute = Number(match.minute) || (normalizeStatus(match.status) === "halftime" ? 45 : 0);
    return clamp((96 - minute) / 96, 0.04, 1);
  }

  function calculateFreshnessScore(updatedAt, generatedAt) {
    const age = freshnessAgeDays(updatedAt, generatedAt);
    if (!Number.isFinite(age)) return 0.25;
    if (age <= 1) return 1;
    if (age <= 3) return 0.76;
    if (age <= 7) return 0.5;
    return 0.22;
  }

  function classifyFreshness(updatedAt, generatedAt) {
    const age = freshnessAgeDays(updatedAt, generatedAt);
    if (!Number.isFinite(age)) return "Stale";
    if (age <= 1) return "Fresh";
    if (age <= 3) return "Aging";
    return "Stale";
  }

  function freshnessAgeDays(updatedAt, generatedAt) {
    const updated = Date.parse(updatedAt || "");
    const generated = Date.parse(generatedAt || "");
    if (!Number.isFinite(updated) || !Number.isFinite(generated)) return Infinity;
    return Math.max(0, (generated - updated) / MS_PER_DAY);
  }

  function calculateIdentityConfidence(homeTeam, awayTeam) {
    const home = homeTeam?.id && homeTeam?.name ? 0.48 : 0.25;
    const away = awayTeam?.id && awayTeam?.name ? 0.48 : 0.25;
    const providerIds = String(homeTeam?.id || "").startsWith("FD") && String(awayTeam?.id || "").startsWith("FD") ? 0.04 : 0;
    return clamp(home + away + providerIds, 0, 1);
  }

  function createTeamId(name, league = "") {
    const clean = normalizeName(name).replace(/\s+/g, "-");
    return `${normalizeLeague(league || "team")}-${clean || "team"}`.toUpperCase();
  }

  function createOpponentId(name, league = "") {
    return createTeamId(name || "opponent", league || "opponent");
  }

  function buildTeamNameIndex(teams) {
    const byName = new Map();
    Object.values(teams || {}).forEach((team) => {
      if (!team?.name || !team?.id) return;
      byName.set(normalizeName(team.name), normalizeTeamId(team.id));
      if (team.shortName) byName.set(normalizeName(team.shortName), normalizeTeamId(team.id));
    });
    return byName;
  }

  function summarizeUiForm(windowSummary) {
    return {
      wins: windowSummary.wins,
      draws: windowSummary.draws,
      losses: windowSummary.losses,
      goalsFor: windowSummary.goalsFor,
      goalsAgainst: windowSummary.goalsAgainst,
      cleanSheets: windowSummary.cleanSheets,
      failedToScore: windowSummary.failedToScore,
      points: windowSummary.points,
      results: windowSummary.results,
      matches: windowSummary.matches,
      matchesPlayed: windowSummary.matchesPlayed,
      avgGoalsFor: windowSummary.avgGoalsFor,
      avgGoalsAgainst: windowSummary.avgGoalsAgainst,
      goalDifference: windowSummary.goalDifference,
      pointsPerMatch: windowSummary.pointsPerMatch,
      adjustedPointsPerMatch: windowSummary.adjustedPointsPerMatch
    };
  }

  function normalizeTeamId(value) {
    return String(value || "").trim();
  }

  function normalizeLeague(value) {
    const raw = String(value || "").trim();
    const clean = raw.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
    const aliases = {
      pl: "EPL",
      epl: "EPL",
      "premier league": "EPL",
      pd: "LALIGA",
      "la liga": "LALIGA",
      laliga: "LALIGA",
      sa: "SERIEA",
      "serie a": "SERIEA",
      "seria a": "SERIEA",
      fl1: "LIGUE1",
      "ligue 1": "LIGUE1",
      "french league": "LIGUE1",
      cl: "UCL",
      ucl: "UCL",
      "champions league": "UCL",
      "uefa champions league": "UCL",
      el: "UEL",
      uel: "UEL",
      "europa league": "UEL",
      "uefa europa league": "UEL"
    };
    return aliases[clean] || raw.toUpperCase() || "DEFAULT";
  }

  function normalizeStatus(status) {
    const clean = String(status || "").toLowerCase().replace(/[^a-z0-9]+/g, "");
    const map = {
      inplay: "live",
      live: "live",
      paused: "halftime",
      halftime: "halftime",
      ht: "halftime",
      finished: "finished",
      awarded: "finished",
      ft: "finished",
      fulltime: "finished",
      scheduled: "upcoming",
      timed: "upcoming",
      upcoming: "upcoming"
    };
    return map[clean] || clean;
  }

  function normalizeScore(score) {
    if (!score || typeof score !== "object") return null;
    const home = finiteOrNull(score.home ?? score.homeGoals ?? score.fullTime?.home ?? score.fulltime?.home);
    const away = finiteOrNull(score.away ?? score.awayGoals ?? score.fullTime?.away ?? score.fulltime?.away);
    if (!Number.isFinite(home) || !Number.isFinite(away)) return null;
    return { home, away };
  }

  function normalizeDate(value) {
    if (!value) return "";
    if (value instanceof Date && !Number.isNaN(value.getTime())) return value.toISOString().slice(0, 10);
    const raw = String(value).trim();
    const iso = raw.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (iso) return `${iso[1]}-${iso[2]}-${iso[3]}`;
    const parsed = Date.parse(raw);
    if (!Number.isNaN(parsed)) return new Date(parsed).toISOString().slice(0, 10);
    return "";
  }

  function normalizeCsvDate(value) {
    const raw = String(value || "").trim();
    if (!raw) return "";
    const slash = raw.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/);
    if (slash) {
      const day = slash[1].padStart(2, "0");
      const month = slash[2].padStart(2, "0");
      const year = slash[3].length === 2 ? `20${slash[3]}` : slash[3];
      return `${year}-${month}-${day}`;
    }
    return normalizeDate(raw);
  }

  function normalizeTime(value) {
    const raw = String(value || "").trim();
    const time = raw.match(/(\d{1,2}):(\d{2})/);
    if (!time) return "00:00";
    return `${time[1].padStart(2, "0")}:${time[2]}`;
  }

  function normalizeTimestamp(value) {
    if (!value) return "";
    const parsed = value instanceof Date ? value.getTime() : Date.parse(String(value));
    if (!Number.isFinite(parsed)) return "";
    return new Date(parsed).toISOString();
  }

  function normalizeSeason(season, date) {
    if (season) return String(season);
    const year = Number(String(date || "").slice(0, 4));
    const month = Number(String(date || "").slice(5, 7));
    if (!Number.isFinite(year) || !Number.isFinite(month)) return "";
    return month >= 7 ? `${year}-${String(year + 1).slice(2)}` : `${year - 1}-${String(year).slice(2)}`;
  }

  function getCurrentSeasonMatches(records, beforeTimestamp) {
    const targetDate = new Date(beforeTimestamp);
    const year = targetDate.getUTCFullYear();
    const month = targetDate.getUTCMonth() + 1;
    const startYear = month >= 7 ? year : year - 1;
    const start = Date.parse(`${startYear}-07-01T00:00:00.000Z`);
    return records.filter((record) => getRecordTimestamp(record) >= start);
  }

  function getMatchTimestamp(match) {
    const timestamp = Date.parse(`${normalizeDate(match.date)}T${normalizeTime(match.time)}:00.000Z`);
    return Number.isFinite(timestamp) ? timestamp : Date.parse(`${normalizeDate(match.date)}T00:00:00.000Z`);
  }

  function getRecordTimestamp(record) {
    const parsed = Date.parse(record.kickoff || record.date || "");
    return Number.isFinite(parsed) ? parsed : 0;
  }

  function compareMatchDates(a, b) {
    return getRecordTimestamp(a) - getRecordTimestamp(b) || String(a.id).localeCompare(String(b.id));
  }

  function calculateRecencyWeight(record, beforeTimestamp, config = DEFAULT_CONFIG) {
    const ageDays = Math.max(0, (beforeTimestamp - getRecordTimestamp(record)) / MS_PER_DAY);
    const halfLife = config.strengths?.recencyHalfLifeDays || DEFAULT_CONFIG.strengths.recencyHalfLifeDays;
    return clamp(Math.pow(0.5, ageDays / halfLife), 0.22, 1);
  }

  function formAttackIndex(formWindow, baseGoals) {
    if (!formWindow.matchesPlayed) return 1;
    return clamp((formWindow.avgGoalsFor + 0.18) / Math.max(0.45, baseGoals + 0.18), 0.58, 1.75);
  }

  function formDefenceIndex(formWindow, baseGoalsAgainst) {
    if (!formWindow.matchesPlayed) return 1;
    return clamp((formWindow.avgGoalsAgainst + 0.18) / Math.max(0.45, baseGoalsAgainst + 0.18), 0.58, 1.75);
  }

  function getLeagueStrength(league, config) {
    return config.leagueStrength?.[league] || config.leagueStrength?.DEFAULT || 1;
  }

  function eloExpected(ratingA, ratingB) {
    return 1 / (1 + Math.pow(10, (ratingB - ratingA) / 400));
  }

  function regressRating(rating, config) {
    return config.elo.baseRating + (rating - config.elo.baseRating) * config.elo.regression;
  }

  function normalizeThreeWay(outcome) {
    const home = Math.max(0, Number(outcome.home) || 0);
    const draw = Math.max(0, Number(outcome.draw) || 0);
    const away = Math.max(0, Number(outcome.away) || 0);
    const total = home + draw + away || 1;
    return {
      home: roundMetric(home / total, 6),
      draw: roundMetric(draw / total, 6),
      away: roundMetric(away / total, 6)
    };
  }

  function normalizeWeights(weights) {
    const output = {
      elo: Number(weights?.elo) || 0,
      poisson: Number(weights?.poisson) || 0,
      form: Number(weights?.form) || 0
    };
    const total = output.elo + output.poisson + output.form || 1;
    output.elo /= total;
    output.poisson /= total;
    output.form /= total;
    return output;
  }

  function marketCandidate(label, market, probability, reason) {
    return {
      label,
      market,
      probability: clamp(probability, 0, 1),
      reason
    };
  }

  function rankMarketCandidate(candidate, dataQuality) {
    const marketBonus = candidate.market === "Double chance" ? 0.045 : candidate.market === "Draw no bet" ? 0.025 : 0;
    const lowDataPenalty = (1 - dataQuality.score) * 0.08;
    return candidate.probability + marketBonus - lowDataPenalty;
  }

  function classifyMarketRisk(probability, dataQuality) {
    const adjusted = probability * (0.82 + dataQuality.score * 0.18);
    if (adjusted >= 0.74) return "Lower risk";
    if (adjusted >= 0.62) return "Balanced";
    return "High variance";
  }

  function topOutcome(probabilities) {
    if (probabilities.home >= probabilities.draw && probabilities.home >= probabilities.away) return "home";
    if (probabilities.away >= probabilities.home && probabilities.away >= probabilities.draw) return "away";
    return "draw";
  }

  function getActualOutcome(record) {
    if (record.homeGoals > record.awayGoals) return "home";
    if (record.awayGoals > record.homeGoals) return "away";
    return "draw";
  }

  function getMostLikelyResultLabel(outcome, home, away) {
    const winner = topOutcome(outcome);
    if (winner === "home") return `${home.name} win`;
    if (winner === "away") return `${away.name} win`;
    return "Draw";
  }

  function getOutcomeEdge(outcome, home, away) {
    const winner = topOutcome(outcome);
    if (winner === "home") return { summary: `${home.shortName || home.name} edge` };
    if (winner === "away") return { summary: `${away.shortName || away.name} edge` };
    return { summary: "Balanced model" };
  }

  function breakdownEdgeRow(label, score, home, away, value, description) {
    const direction = score > 0.04 ? "home" : score < -0.04 ? "away" : "balanced";
    return {
      label,
      direction,
      score,
      lean: direction === "home" ? `${home.shortName || home.name} edge` : direction === "away" ? `${away.shortName || away.name} edge` : "Even",
      value,
      description
    };
  }

  function parseCsv(csvText) {
    const rows = [];
    let row = [];
    let value = "";
    let inQuotes = false;
    const text = String(csvText || "");

    for (let index = 0; index < text.length; index += 1) {
      const char = text[index];
      const next = text[index + 1];
      if (char === '"' && next === '"') {
        value += '"';
        index += 1;
      } else if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === "," && !inQuotes) {
        row.push(value);
        value = "";
      } else if ((char === "\n" || char === "\r") && !inQuotes) {
        if (char === "\r" && next === "\n") index += 1;
        row.push(value);
        rows.push(row);
        row = [];
        value = "";
      } else {
        value += char;
      }
    }
    row.push(value);
    rows.push(row);
    return rows.filter((line) => line.length > 1 || String(line[0] || "").trim());
  }

  function dedupeHistoricalMatches(records) {
    const byKey = new Map();
    records.forEach((record) => {
      const key = `${record.date}:${record.competitionId}:${record.homeTeamId}:${record.awayTeamId}:${record.homeGoals}:${record.awayGoals}`;
      if (!byKey.has(record.id) && !byKey.has(key)) {
        byKey.set(record.id, record);
        byKey.set(key, record);
      }
    });
    return [...new Set([...byKey.values()])];
  }

  function hasProviderAdvancedStats(match) {
    return ADVANCED_PROVIDER_FIELDS.some((field) => Number.isFinite(Number(match?.[field])));
  }

  function hasAnyValue(row, keys) {
    return keys.some((key) => String(row?.[key] || "").trim() !== "");
  }

  function pushFinite(list, value) {
    const number = finiteOrNull(value);
    if (Number.isFinite(number)) list.push(number);
  }

  function averageOrNull(values) {
    if (!values.length) return null;
    return values.reduce((sum, value) => sum + value, 0) / values.length;
  }

  function finiteOrNull(value) {
    if (value === null || value === undefined || value === "") return null;
    const number = Number(value);
    return Number.isFinite(number) ? number : null;
  }

  function dateFromNow(now, offsetDays) {
    const base = Date.parse(now || "");
    const timestamp = Number.isFinite(base) ? base : Date.now();
    return new Date(timestamp + offsetDays * MS_PER_DAY).toISOString().slice(0, 10);
  }

  function makeShortName(name) {
    return String(name || "TEAM")
      .split(/\s+/)
      .filter(Boolean)
      .map((part) => part[0])
      .join("")
      .slice(0, 4)
      .toUpperCase();
  }

  function getTeamDisplayName(value) {
    if (!value) return "";
    if (typeof value === "object") return String(value.name || value.shortName || value.tla || "").trim();
    return String(value).trim();
  }

  function normalizeName(value) {
    return String(value || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/&/g, "and")
      .replace(/[^a-z0-9]+/g, " ")
      .trim();
  }

  function sigmoid(value) {
    return 1 / (1 + Math.exp(-value));
  }

  function logit(value) {
    const bounded = clamp(value, 0.001, 0.999);
    return Math.log(bounded / (1 - bounded));
  }

  function blend(a, b, weightB) {
    const left = Number.isFinite(Number(a)) ? Number(a) : 0;
    const right = Number.isFinite(Number(b)) ? Number(b) : left;
    return left * (1 - weightB) + right * weightB;
  }

  function factorial(number) {
    let total = 1;
    for (let index = 2; index <= number; index += 1) total *= index;
    return total;
  }

  function clamp(value, min, max) {
    return Math.min(Math.max(Number(value) || 0, min), max);
  }

  function roundMetric(value, digits = 2) {
    return Number(Number(value).toFixed(digits));
  }

  function formatDecimal(value) {
    return Number(value).toFixed(2);
  }

  function formatProbability(value) {
    return `${Math.round(value * 100)}%`;
  }

  function mergeConfig(base, overrides) {
    return {
      ...base,
      ...overrides,
      modelWeights: { ...base.modelWeights, ...(overrides.modelWeights || {}) },
      elo: { ...base.elo, ...(overrides.elo || {}) },
      strengths: { ...base.strengths, ...(overrides.strengths || {}) },
      poisson: { ...base.poisson, ...(overrides.poisson || {}) },
      leagueStrength: { ...base.leagueStrength, ...(overrides.leagueStrength || {}) }
    };
  }

  globalScope.GoalIQPredictionEngine = {
    MODEL_VERSION,
    DEFAULT_CONFIG,
    StatisticsProvider,
    ExpectedGoalsProvider,
    LineupProvider,
    InjuryProvider,
    predictMatchV2,
    buildHistoricalDatabase,
    normalizeHistoricalMatch,
    buildFeatureStore,
    buildDynamicRatings,
    buildScoreMatrix,
    summarizeScoreMatrix,
    poisson,
    dixonColesAdjustment,
    backtestPredictions,
    createPredictionSnapshot,
    parseFootballDataCsv,
    adaptFootballDataCoUkRows
  };
})(globalThis);
