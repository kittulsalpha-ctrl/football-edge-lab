# Football Edge Lab

A zero-cost static football prediction and analysis app for EPL, La Liga, Serie A, Bundesliga, and UEFA Champions League matches.

## Run

Open `index.html` in a browser. No install step is required.

## Current screens

- Today, Live, Upcoming, and Finished match boards.
- Date selector and team or league search.
- Compact fixture cards with home win, draw, and away win prediction percentages.
- Match detail pages with overview, winning probability, last five form, attacking stats, defensive stats, head-to-head, and extra goal-market predictions.
- Fixture snapshot updated on 28 Apr 2026 with corrected upcoming EPL and UEFA Champions League examples. Connect a live API later for automatic fixture updates.
- Local JSON import, remote JSON URL import, browser storage, export current fixtures, and reset to the built-in snapshot.

## Service functions

The browser app exposes these functions on `window.FootballEdgeServices` so a real data API can be connected later:

```js
getMatchesByDate(date)
getLiveMatches()
getUpcomingMatches()
getMatchDetails(matchId)
getTeamLastFiveMatches(teamId)
calculatePrediction(matchData)
importFixtureData(payload)
resetFixtureData()
getFixtureDataExport()
loadFixtureDataFromUrl(url)
```

## Refresh fixtures without editing code

Use the Data source panel in the app:

- Import a local `.json` file. This works even when opening `index.html` directly from `file://`.
- Load a remote JSON URL. This works when the URL allows browser access with CORS.
- Export the current fixture set as JSON.
- Reset to the built-in fixture snapshot.

See `fixtures.sample.json` for the supported shape. The simplest format is:

```json
{
  "meta": {
    "source": "My fixture file",
    "updatedAt": "2026-04-28"
  },
  "matches": [
    {
      "id": "ucl-ars-atm",
      "league": "UCL",
      "date": "2026-05-06",
      "time": "00:30",
      "homeTeam": "Arsenal",
      "awayTeam": "Atletico Madrid",
      "status": "upcoming",
      "venue": "Emirates Stadium",
      "stage": "Semi-final - Leg 2 of 2"
    }
  ]
}
```

Accepted league names include `EPL`, `Premier League`, `La Liga`, `Serie A`, `Bundesliga`, `UCL`, and `Champions League`. Unknown teams are created automatically with neutral starter ratings.

## Prediction logic

The mock prediction engine combines:

- Last five match form.
- Goals scored and conceded.
- Clean sheets and failed-to-score counts.
- Head-to-head trend.
- Home advantage.
- Recent win, draw, and loss trend.

## Zero-cost hosting

This can be hosted free on GitHub Pages because it is only HTML, CSS, JavaScript, and an SVG asset.

## Disclaimer

Predictions are for analysis only. No result is guaranteed. This app has no real-money betting, payment, wallet, or betting slip features.
