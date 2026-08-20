import { cp, mkdir, rm, writeFile } from "node:fs/promises";

const OUTPUT_DIR = "dist";
const STATIC_FILES = [
  "index.html",
  "app.js",
  "styles.css",
  "sw.js",
  "manifest.webmanifest",
  "fixtures.live.json"
];

await rm(OUTPUT_DIR, { force: true, recursive: true });
await mkdir(OUTPUT_DIR, { recursive: true });

for (const file of STATIC_FILES) {
  await cp(file, `${OUTPUT_DIR}/${file}`);
}

await cp("assets", `${OUTPUT_DIR}/assets`, { recursive: true });
await writeFile(
  `${OUTPUT_DIR}/_headers`,
  `/*
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=()

/fixtures.live.json
  Cache-Control: no-store

/app.js
  Cache-Control: public, max-age=300

/styles.css
  Cache-Control: public, max-age=300

/sw.js
  Cache-Control: no-cache
`
);

console.log(`Prepared Cloudflare Pages output in ${OUTPUT_DIR}.`);
