#!/usr/bin/env node
/**
 * Downloads the gitleaks binary into node_modules/.bin/ if missing.
 * Idempotent — skip if version matches. Skipped in CI and prod installs.
 */
const fs = require("node:fs");
const path = require("node:path");
const { spawnSync } = require("node:child_process");
const https = require("node:https");
const zlib = require("node:zlib");

const VERSION = "8.30.1";
const BIN_DIR = path.resolve(__dirname, "..", "node_modules", ".bin");
const BIN = path.join(
  BIN_DIR,
  process.platform === "win32" ? "gitleaks.exe" : "gitleaks",
);

if (process.env.CI === "true") {
  process.exit(0); // CI uses workflow-installed binary
}
if (process.env.NODE_ENV === "production") {
  process.exit(0);
}
if (process.env.GITLEAKS_SKIP_INSTALL === "1") {
  process.exit(0);
}

const PLATFORM_MAP = {
  "darwin-arm64": `gitleaks_${VERSION}_darwin_arm64.tar.gz`,
  "darwin-x64": `gitleaks_${VERSION}_darwin_x64.tar.gz`,
  "linux-arm64": `gitleaks_${VERSION}_linux_arm64.tar.gz`,
  "linux-x64": `gitleaks_${VERSION}_linux_x64.tar.gz`,
  "win32-x64": `gitleaks_${VERSION}_windows_x64.zip`,
};

const key = `${process.platform}-${process.arch}`;
const asset = PLATFORM_MAP[key];
if (!asset) {
  console.warn(
    `[gitleaks] no prebuilt binary for ${key} — skip (install manually: brew install gitleaks)`,
  );
  process.exit(0);
}

if (fs.existsSync(BIN)) {
  const r = spawnSync(BIN, ["version"], { encoding: "utf8" });
  const installed = (r.stdout || "").trim();
  if (installed === VERSION) {
    process.exit(0);
  }
}

if (!fs.existsSync(BIN_DIR)) {
  fs.mkdirSync(BIN_DIR, { recursive: true });
}

const url = `https://github.com/gitleaks/gitleaks/releases/download/v${VERSION}/${asset}`;
console.log(`[gitleaks] downloading ${url}`);

function fetchToBuffer(u, redirects = 5) {
  return new Promise((resolve, reject) => {
    const req = https.get(
      u,
      { headers: { "User-Agent": "install-gitleaks-script" } },
      (res) => {
        if (
          res.statusCode >= 300 &&
          res.statusCode < 400 &&
          res.headers.location &&
          redirects > 0
        ) {
          res.resume();
          return resolve(fetchToBuffer(res.headers.location, redirects - 1));
        }
        if (res.statusCode !== 200) {
          return reject(new Error(`HTTP ${res.statusCode} for ${u}`));
        }
        const chunks = [];
        res.on("data", (c) => chunks.push(c));
        res.on("end", () => resolve(Buffer.concat(chunks)));
      },
    );
    req.on("error", reject);
  });
}

(async () => {
  try {
    const buf = await fetchToBuffer(url);
    if (asset.endsWith(".tar.gz")) {
      const tmp = path.join(BIN_DIR, ".gitleaks-download");
      fs.mkdirSync(tmp, { recursive: true });
      const tarPath = path.join(tmp, "gitleaks.tar");
      fs.writeFileSync(tarPath, zlib.gunzipSync(buf));
      const r = spawnSync("tar", ["-xf", tarPath, "-C", tmp], {
        stdio: "ignore",
      });
      if (r.status !== 0) throw new Error("tar extract failed");
      fs.copyFileSync(path.join(tmp, "gitleaks"), BIN);
      fs.chmodSync(BIN, 0o755);
      fs.rmSync(tmp, { recursive: true, force: true });
    } else {
      // zip — we don't ship Windows but keep the branch for completeness
      console.warn(
        "[gitleaks] zip extract not implemented — install gitleaks manually on Windows",
      );
      process.exit(0);
    }
    console.log(`[gitleaks] installed v${VERSION} at ${BIN}`);
  } catch (err) {
    console.warn(
      `[gitleaks] install failed: ${err.message} — pre-commit will warn until installed manually`,
    );
    process.exit(0);
  }
})();
