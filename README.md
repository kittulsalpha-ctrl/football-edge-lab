# GoalIQ

GoalIQ is a zero-cost static football prediction and analysis app hosted on GitHub Pages. It supports FIFA World Cup 2026 plus the 2026/27 domestic seasons for Premier League, La Liga, Bundesliga, and Serie A.

Predictions are informational analysis only. GoalIQ does not include real-money betting, deposits, wallets, bookmaker links, odds comparison, betting slips, or cash prizes.

## Supported Competitions

- FIFA World Cup 2026 (`WC`)
- Premier League 2026/27 (`EPL`, football-data.org `PL`)
- La Liga 2026/27 (`LALIGA`, football-data.org `PD`)
- Bundesliga 2026/27 (`BUNDESLIGA`, football-data.org `BL1`)
- Serie A 2026/27 (`SERIEA`, football-data.org `SA`)

The app accepts aliases such as `Premier League`, `PL`, `La Liga`, `Primera División`, `Bundesliga`, `BL1`, `Serie A`, `SA`, `World Cup`, and `FIFA World Cup`.

## Current Screens

- Today, Live, Upcoming, and Finished fixture boards.
- Competition selector for All, World Cup 2026, Premier League, La Liga, Bundesliga, and Serie A.
- Date selector and team or league search scoped to the selected competition.
- Compact fixture cards with home win, draw, and away win prediction percentages.
- Competition summary views with today’s matches, next fixtures, recent results, standings, team list, top insights, source, and update timestamp.
- Match detail pages with Overview, Form, Stats, H2H, and Predictions.
- FIFA World Cup 2026 bracket at `#worldcup-2026`, including group tables, knockout rounds, model champion, match drawer, and saved user picks.
- Local JSON import, remote JSON URL import, live feed loading, browser storage, export, and reset.

Direct links are supported where practical:

```text
#competition/epl
#competition/laliga
#competition/bundesliga
#competition/seriea
#worldcup-2026
```

## Data Architecture

GoalIQ stays zero-cost by using static generated JSON files:

```text
football-data.org
        ↓
GitHub Actions updater
        ↓
fixtures.live.json + standings.live.json + competitions.live.json
        ↓
GitHub Pages / PWA / Android / iOS WebView
```

Generated files:

- `fixtures.live.json`: normalized fixtures, scores, teams, recent form, source metadata, UTC kickoff fields, local display date/time, statuses, venue, referee, and score fields.
- `standings.live.json`: official league-table rows when the provider publishes them. If unavailable, the UI shows: “The 2026/27 league table will appear when official competition data becomes available.”
- `competitions.live.json`: competition metadata and official or inferred team lists.

The frontend never contains the API token. Add a repository secret named `FOOTBALL_DATA_TOKEN` for GitHub Actions.

## Updater Behavior

The updater is `scripts/update-fixtures.mjs`. It:

- Fetches season fixtures and official team lists for the supported competitions.
- Fetches official standings for the four domestic leagues.
- Fetches recent finished matches for each team where football-data.org provides them.
- Builds `team.form` from a maximum of five latest real finished matches.
- Keeps World Cup/international form separate from domestic club form.
- Continues if one competition fails.
- Preserves a previous valid snapshot if a provider response is empty or failed.
- Logs which competitions were updated.
- Respects provider rate limits and retries 429 responses.

Run manually:

```bash
FOOTBALL_DATA_TOKEN=your_token node scripts/update-fixtures.mjs
```

GitHub Actions workflow: `.github/workflows/update-fixtures.yml`

- Manual trigger: `workflow_dispatch`
- Schedule: every four hours
- Commits only when generated JSON files change

## Prediction Logic

`calculatePrediction(matchData)` uses available data only:

- Recent five-match form
- Goals scored and conceded
- Clean sheets and failed-to-score count
- Head-to-head meetings from finished fixture data
- Home advantage
- Team rating
- Competition average goals
- Data completeness

Returned probabilities are rounded for display so home/draw/away totals equal 100%. When form or verified stats are missing, GoalIQ lowers confidence and shows “Insufficient data” or unavailable states instead of unrelated demo records.

## Service Functions

The browser app exposes these functions on `window.GoalIQServices`. `window.FootballEdgeServices` remains as a compatibility alias.

```js
getMatchesByDate(date)
getLiveMatches()
getUpcomingMatches()
getFinishedMatches()
getMatchDetails(matchId)
getTeamLastFiveMatches(teamId)
calculatePrediction(matchData)
importFixtureData(payload)
resetFixtureData()
getFixtureDataExport()
loadFixtureDataFromUrl(url)
loadLiveFixtureFeed()
loadLiveStandingsFeed()
loadLiveCompetitionsFeed()
getWorldCupBracket()
```

## Local Development

```bash
npm install
npm run dev
npm run build
npm test
npm run mobile:prepare
```

`npm run dev` serves the static app at `http://localhost:4173/`.

You can also open `index.html` directly for a simple local preview, though live feed requests work best through a local server or GitHub Pages.

## PWA And Mobile Packaging

GoalIQ is PWA-ready and can be wrapped with Capacitor for Android and iOS. The PWA path stays free on GitHub Pages: users open the site in a mobile browser and add it to their home screen.

Native publishing may have platform costs:

- Google Play has a one-time developer fee.
- Apple App Store requires the yearly Apple Developer Program.

Included files:

- `manifest.webmanifest` for installable app metadata.
- `sw.js` for an offline-safe shell and network-first JSON feed refreshes.
- App icons in `assets/`.
- `capacitor.config.json` pointing Capacitor at `www`.
- `npm run mobile:prepare` to copy static web assets and live JSON feeds into `www`.

Install Capacitor packages when ready to create native projects:

```bash
npm i @capacitor/core
npm i -D @capacitor/cli
npm i @capacitor/android @capacitor/ios
```

Create and open native projects:

```bash
npm run mobile:add:android
npm run mobile:add:ios
npm run mobile:android
npm run mobile:ios
```

Android builds require Android Studio. iOS builds require macOS with Xcode and an Apple Developer account for App Store distribution.

## Local And Remote JSON Imports

Use the Data source panel in the app:

- Load live feed from GitHub-hosted JSON.
- Import a local `.json` file.
- Load a remote JSON URL when CORS allows it.
- Export the current fixture set.
- Reset to the built-in demo snapshot.

A minimal fixture shape is still supported:

```json
{
  "meta": {
    "source": "My fixture file",
    "updatedAt": "2026-07-14"
  },
  "matches": [
    {
      "id": "epl-example",
      "competitionId": "EPL",
      "date": "2026-08-15",
      "time": "15:00",
      "homeTeam": "Arsenal",
      "awayTeam": "Chelsea",
      "status": "upcoming",
      "venue": "Emirates Stadium",
      "matchday": 1
    }
  ]
}
```

## Current Limitations

- Official 2026/27 fixtures and tables depend on football-data.org availability.
- Some leagues or teams may not have recent form on the free provider tier.
- Advanced player/team match statistics such as shots, corners, possession, and xG appear only when real data is available; GoalIQ does not fabricate them.
- The app is static. There is no backend, account system, payment system, wallet, or betting slip.

## Disclaimer

Predictions are for analysis only. No result is guaranteed.
