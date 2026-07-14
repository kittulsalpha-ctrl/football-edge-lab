import { cp, mkdir, rm } from "node:fs/promises";
import { existsSync } from "node:fs";

const root = new URL("../", import.meta.url);
const output = new URL("../www/", import.meta.url);
const appFiles = [
  "index.html",
  "app.js",
  "styles.css",
  "fixtures.live.json",
  "standings.live.json",
  "competitions.live.json",
  "fixtures.sample.json",
  "manifest.webmanifest",
  "sw.js",
  "assets"
];

await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });

for (const entry of appFiles) {
  const source = new URL(entry, root);
  if (!existsSync(source)) continue;
  await cp(source, new URL(entry, output), { recursive: true });
}

console.log(`Prepared GoalIQ mobile web assets in ${output.pathname}`);
