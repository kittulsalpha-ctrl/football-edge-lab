# GoalIQ Prediction Engine v2

GoalIQ v2 is designed to produce measurable, auditable football probabilities for static hosting. It does not use fake AI, browser-side secrets, scraping, or fabricated advanced statistics.

## Audit Summary

| Input | Current source | Classification | Notes |
| --- | --- | --- | --- |
| Fixture date, time, competition, teams, status, score | `fixtures.live.json` generated from football-data.org | REAL | Provider data is fetched server-side by GitHub Actions or local scripts. |
| Team recent form rows | football-data.org finished matches, exported as `team.form` | REAL | The UI displays at most five recent rows. Missing form stays empty. |
| Historical match records | `historicalMatches` in `fixtures.live.json`, optional imports | REAL | Result fields are real only when the provider/import supplies them. |
| Goals per match, conceded average, clean-sheet rate, PPM | Calculated from verified scores | DERIVED | These are score-derived features, not independent provider statistics. |
| Elo overall rating | Chronological update from historical results | MODELLED | Ratings are regenerated without future results for each prediction/backtest. |
| Attack and defence indexes | Goals scored/conceded, opponent strength, recency | MODELLED | Separate indexes drive expected scoring. |
| Expected scoring model | Dixon-Coles/Poisson lambdas | MODELLED | Displayed as model estimates, never as real xG. |
| 1X2, BTTS, over/under, clean sheets, likely score | Same Poisson score matrix | MODELLED | Markets are mathematically consistent because they come from one score matrix. |
| Built-in sample teams and fixtures | `app.js` demo snapshot | DEMO | Used only after pressing Demo data/reset or for offline development. |
| xG, xGA, shots, shots on target, big chances, cards, lineups, injuries | Not provided by current football-data.org plan | UNAVAILABLE | Shown as unavailable unless a licensed provider/import supplies verified fields. |

## Data Sources

The canonical fixture source remains football-data.org. API tokens must stay server-side in GitHub Actions, Cloudflare Workers, or another secure backend. Browser code only reads static JSON.

Optional historical CSV imports are isolated in `scripts/import-football-data-co-uk.mjs`. Football-Data.co.uk publishes historical result/odds CSVs, but their site also disclaims betting advice and does not guarantee correctness. Review their terms and disclaimer before deploying imported data:

- https://www.football-data.co.uk/
- https://www.football-data.co.uk/disclaimer.php

## Normalized History

GoalIQ v2 consumes normalized records shaped like:

```json
{
  "id": "match-id",
  "competitionId": "EPL",
  "season": "2025-26",
  "date": "2026-02-01",
  "homeTeamId": "ARS",
  "awayTeamId": "CHE",
  "homeGoals": 2,
  "awayGoals": 1,
  "halftimeHomeGoals": null,
  "halftimeAwayGoals": null,
  "homeShots": null,
  "awayShots": null,
  "homeShotsOnTarget": null,
  "awayShotsOnTarget": null,
  "homeXg": null,
  "awayXg": null,
  "source": "football-data.org",
  "sourceQuality": {
    "fixture": "provider",
    "score": "provider",
    "advancedStats": "unavailable"
  }
}
```

Nullable fields stay `null`. The engine does not invent them.

## Rating Method

For every prediction, v2 rebuilds features using matches that occurred before kickoff only.

- Overall strength uses an Elo-style update with home advantage and goal-margin scaling.
- Attack strength updates from goals scored against opponent defensive strength.
- Defence strength updates from goals conceded against opponent attack strength; lower is better.
- Recent matches receive more weight using a half-life decay.
- League scoring rates and league strength adjust expected goals.
- Existing team ratings are used as priors, not as final truth.

This prevents future-data leakage during live predictions and backtests.

## Score Model

The engine estimates:

- `lambdaHome`
- `lambdaAway`

Then it builds a 0-0 through 7-7 score matrix with Poisson probabilities and a Dixon-Coles-style low-score correction. The same matrix produces:

- home win, draw, away win;
- BTTS yes/no;
- over/under 0.5, 1.5, 2.5, 3.5, 4.5;
- clean sheet probabilities;
- most likely score;
- expected home and away goals.

## Ensemble

The first v2 ensemble exposes three components:

- Elo outcome model.
- Dixon-Coles/Poisson score model.
- Opponent-adjusted recent-form model.

The final displayed match markets come from the score matrix so the probabilities remain internally consistent. Elo and form components shape expected scoring and are used for model-disagreement and confidence.

Model weights live in `DEFAULT_CONFIG.modelWeights` inside `prediction-engine-v2.js`.

## Confidence

Confidence is separate from the top probability. It considers:

- historical sample size;
- recent-form coverage;
- fixture feed freshness;
- team identity confidence;
- head-to-head sample;
- provider advanced-stat availability;
- lineup and injury availability;
- model agreement.

The UI shows a data quality score and freshness status:

- Fresh
- Aging
- Stale

## Backtesting And Calibration

Run:

```bash
npm run model:backtest
npm run model:evaluate
npm run prediction:snapshot
```

Backtesting predicts each historical match using only earlier records, then stores:

- samples;
- home/draw/away top-pick accuracy;
- overall top-pick accuracy;
- Brier score;
- multiclass log loss;
- calibration buckets;
- home-team, league-frequency, and Elo-only baselines.

Prediction snapshots are written before matches begin so old predictions can be evaluated honestly without recalculating after results are known.

## Known Limitations

- football-data.org fixture coverage and refresh timing can lag on free tiers.
- Current browser UI has no licensed xG, shot, lineup, injury, or market-consensus provider.
- Small historical samples produce limited confidence.
- Provider plan limits can leave competitions unavailable; the updater skips restricted competitions rather than inventing fixtures or statistics.

## Provider Roadmap

Future providers should be implemented as adapters that map into the normalized history/provenance schema. Suggested interfaces already exist in the engine:

- `StatisticsProvider`
- `ExpectedGoalsProvider`
- `LineupProvider`
- `InjuryProvider`

Do not expose API tokens in browser code. Do not scrape undocumented consumer app endpoints.
