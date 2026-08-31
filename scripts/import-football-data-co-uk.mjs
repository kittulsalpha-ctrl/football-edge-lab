import { mkdir, readFile, writeFile } from "node:fs/promises";
import { basename } from "node:path";

await import("../prediction-engine-v2.js");

const inputPath = process.argv[2];
if (!inputPath) {
  throw new Error("Usage: node scripts/import-football-data-co-uk.mjs <csv-file> [competition] [season]");
}

const competition = process.argv[3] || process.env.FDUK_COMPETITION || "";
const season = process.argv[4] || process.env.FDUK_SEASON || "";
const csvText = await readFile(inputPath, "utf8");
const rows = globalThis.GoalIQPredictionEngine.parseFootballDataCsv(csvText);
const historicalMatches = globalThis.GoalIQPredictionEngine.adaptFootballDataCoUkRows(rows, {
  competition,
  season
});
const output = {
  meta: {
    source: "football-data.co.uk local CSV import",
    sourceFile: basename(inputPath),
    importedAt: new Date().toISOString(),
    note: "Review Football-Data.co.uk usage conditions before deploying imported data."
  },
  historicalMatches
};

await mkdir("generated/imports", { recursive: true });
await writeFile("generated/imports/football-data-co-uk.json", `${JSON.stringify(output, null, 2)}\n`);

console.log(`Imported ${historicalMatches.length} historical matches from ${inputPath}.`);
