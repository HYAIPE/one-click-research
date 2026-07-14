import { build, context } from "esbuild";
import { cp, mkdir, rm } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dist = path.join(root, "dist");
const watch = process.argv.includes("--watch");

const buildOptions = {
  entryPoints: [
    { in: path.join(root, "src/background/service-worker.ts"), out: "background/service-worker" },
    { in: path.join(root, "src/popup/popup.ts"), out: "popup/popup" },
    { in: path.join(root, "src/options/options.ts"), out: "options/options" },
  ],
  outdir: dist,
  bundle: true,
  format: "iife",
  target: "chrome120",
  sourcemap: false,
  minify: !watch,
  logLevel: "info",
};

async function copyStatic() {
  await cp(path.join(root, "public/manifest.json"), path.join(dist, "manifest.json"));
  await cp(path.join(root, "src/styles/tokens.css"), path.join(dist, "styles/tokens.css"));
  await cp(path.join(root, "src/popup/popup.html"), path.join(dist, "popup/popup.html"));
  await cp(path.join(root, "src/popup/popup.css"), path.join(dist, "popup/popup.css"));
  await cp(path.join(root, "src/options/options.html"), path.join(dist, "options/options.html"));
  await cp(path.join(root, "src/options/options.css"), path.join(dist, "options/options.css"));
  await cp(path.join(root, "src/assets/icons"), path.join(dist, "icons"), { recursive: true });
}

await rm(dist, { recursive: true, force: true });
await mkdir(dist, { recursive: true });

if (watch) {
  const ctx = await context(buildOptions);
  await copyStatic();
  await ctx.watch();
  console.log("Watching for changes. Static files are copied once per run.");
} else {
  await build(buildOptions);
  await copyStatic();
  console.log("Build complete: dist/ is loadable via chrome://extensions (Load unpacked).");
}
