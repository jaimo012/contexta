const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const API_DIR = path.join(ROOT, "src", "app", "api");
const MIDDLEWARE = path.join(ROOT, "src", "middleware.ts");
const API_BACKUP = path.join(ROOT, "src", "app", "_api_backup");
const MIDDLEWARE_BACKUP = path.join(ROOT, "src", "_middleware_backup.ts");

function safeCopyAndRemove(src, dest) {
  if (!fs.existsSync(src)) return;
  fs.cpSync(src, dest, { recursive: true });
  fs.rmSync(src, { recursive: true, force: true });
}

function safeRestore(backup, original) {
  if (!fs.existsSync(backup)) return;
  if (fs.existsSync(original)) {
    fs.rmSync(original, { recursive: true, force: true });
  }
  fs.cpSync(backup, original, { recursive: true });
  fs.rmSync(backup, { recursive: true, force: true });
}

function run(cmd) {
  console.log(`> ${cmd}`);
  execSync(cmd, { stdio: "inherit", env: { ...process.env, BUILD_TARGET: "capacitor" } });
}

function restore() {
  safeRestore(API_BACKUP, API_DIR);
  safeRestore(MIDDLEWARE_BACKUP, MIDDLEWARE);
}

try {
  console.log("[1/4] API Routes + Middleware 임시 제거...");
  safeCopyAndRemove(API_DIR, API_BACKUP);
  safeCopyAndRemove(MIDDLEWARE, MIDDLEWARE_BACKUP);

  console.log("[2/4] Static Export 빌드...");
  run("npx next build");

  console.log("[3/4] Capacitor 동기화...");
  run("npx cap sync");

  console.log("[4/4] API Routes + Middleware 복원...");
  restore();

  console.log("\nCapacitor 빌드 + 동기화 완료!");
} catch (err) {
  console.error("\n빌드 실패, 파일 복원 중...");
  restore();
  console.error(err.message);
  process.exit(1);
}
