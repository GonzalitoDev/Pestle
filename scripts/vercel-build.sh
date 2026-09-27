#!/usr/bin/env bash
# Vercel build command: builds the website, then (best effort) the Android APK so it is served
# from the same site at /Pestle.apk. If the APK step fails or times out, the website is still
# deployed unchanged — only the download is missing.
set -uo pipefail

npm run build || exit 1

if [ "${SKIP_APK:-}" = "1" ]; then
  echo "SKIP_APK=1: not building the Android APK."
  exit 0
fi
if [ -z "${VERCEL:-}" ] && [ "${BUILD_APK:-}" != "1" ]; then
  echo "Not running on Vercel (set BUILD_APK=1 to force): skipping the Android APK."
  exit 0
fi

if timeout 1800 bash scripts/build-apk.sh; then
  echo "✓ Android APK built: /Pestle.apk"
else
  echo "⚠ Android APK build failed or timed out; the website was deployed without /Pestle.apk."
fi
exit 0
