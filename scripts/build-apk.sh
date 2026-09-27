#!/usr/bin/env bash
# Builds the Android app (Capacitor) and copies it to dist/Pestle.apk.
# Downloads a JDK and the Android SDK on first use and keeps them (plus Gradle's cache and the
# signing key) in node_modules/.cache so later Vercel builds can reuse them.
set -euo pipefail

ROOT="$(pwd)"
CACHE="$ROOT/node_modules/.cache/pestle-android"
mkdir -p "$CACHE"
SITE_URL="${PESTLE_SITE_URL:-https://${VERCEL_PROJECT_PRODUCTION_URL:-pestesting.vercel.app}}"
echo "▶ Android build: the app will use the API at $SITE_URL"

# --- JDK 21 (Eclipse Temurin) ---------------------------------------------------------------
JDK="$CACHE/jdk-21"
if [ ! -x "$JDK/bin/java" ]; then
  echo "▶ Downloading JDK 21"
  rm -rf "$JDK" && mkdir -p "$JDK"
  curl -fsSL "https://api.adoptium.net/v3/binary/latest/21/ga/linux/x64/jdk/hotspot/normal/eclipse" \
    | tar -xz -C "$JDK" --strip-components=1
fi
export JAVA_HOME="$JDK"
export PATH="$JDK/bin:$PATH"

# --- Android SDK ------------------------------------------------------------------------------
export ANDROID_HOME="$CACHE/android-sdk"
export ANDROID_SDK_ROOT="$ANDROID_HOME"
SDKMANAGER="$ANDROID_HOME/cmdline-tools/latest/bin/sdkmanager"
if [ ! -x "$SDKMANAGER" ]; then
  echo "▶ Downloading Android command-line tools"
  url="$(curl -fsSL https://developer.android.com/studio 2>/dev/null \
    | grep -oE 'https://dl.google.com/android/repository/commandlinetools-linux-[0-9]+_latest.zip' | head -1 || true)"
  url="${url:-https://dl.google.com/android/repository/commandlinetools-linux-11076708_latest.zip}"
  tmp="$(mktemp -d)"
  curl -fsSL "$url" -o "$tmp/tools.zip"
  (cd "$tmp" && jar xf tools.zip)   # the JDK's jar tool unzips; no need for unzip
  mkdir -p "$ANDROID_HOME/cmdline-tools"
  rm -rf "$ANDROID_HOME/cmdline-tools/latest"
  mv "$tmp/cmdline-tools" "$ANDROID_HOME/cmdline-tools/latest"
  chmod +x "$ANDROID_HOME/cmdline-tools/latest/bin/"*
  rm -rf "$tmp"
fi
echo "▶ Installing Android SDK packages"
yes | "$SDKMANAGER" --licenses > /dev/null 2>&1 || true
"$SDKMANAGER" "platforms;android-36" "build-tools;36.0.0" > /dev/null

# --- Signing key --------------------------------------------------------------------------------
# Use PESTLE_KEYSTORE_BASE64 (+ passwords) from the Vercel environment if set. Otherwise create a
# key once and keep it in the build cache, so new APKs install over the previous version.
if [ -n "${PESTLE_KEYSTORE_BASE64:-}" ]; then
  export PESTLE_KEYSTORE_PATH="$CACHE/provided.jks"
  echo "$PESTLE_KEYSTORE_BASE64" | base64 -d > "$PESTLE_KEYSTORE_PATH"
else
  export PESTLE_KEYSTORE_PATH="$CACHE/pestle.jks"
  if [ ! -f "$PESTLE_KEYSTORE_PATH" ] || [ ! -f "$CACHE/pestle.jks.pass" ]; then
    echo "▶ Creating a signing key (kept in the build cache)"
    rm -f "$PESTLE_KEYSTORE_PATH"
    head -c 32 /dev/urandom | base64 | tr -dc 'A-Za-z0-9' > "$CACHE/pestle.jks.pass"
    keytool -genkeypair -keystore "$PESTLE_KEYSTORE_PATH" -alias pestle -keyalg RSA -keysize 4096 \
      -validity 10000 -storepass "$(cat "$CACHE/pestle.jks.pass")" -keypass "$(cat "$CACHE/pestle.jks.pass")" \
      -dname "CN=Pestle" > /dev/null 2>&1
  fi
  export PESTLE_KEYSTORE_PASSWORD="$(cat "$CACHE/pestle.jks.pass")"
  export PESTLE_KEY_PASSWORD="$PESTLE_KEYSTORE_PASSWORD"
  export PESTLE_KEY_ALIAS="pestle"
fi

# --- Web assets for the app (they call the API on $SITE_URL) -----------------------------------
# Build into a separate folder and point Capacitor at it temporarily, so the website in dist/
# is never touched.
cp capacitor.config.json "$CACHE/capacitor.config.json.bak"
restore_config() { cp "$CACHE/capacitor.config.json.bak" "$ROOT/capacitor.config.json"; }
trap restore_config EXIT
VITE_API_BASE="$SITE_URL" VITE_PUBLIC_URL="$SITE_URL" npx vite build --outDir dist-android --emptyOutDir > /dev/null
node -e "const f='capacitor.config.json';const c=JSON.parse(require('fs').readFileSync(f));c.webDir='dist-android';require('fs').writeFileSync(f,JSON.stringify(c,null,2))"
npx cap sync android > /dev/null
restore_config

# --- Gradle build -------------------------------------------------------------------------------
export GRADLE_USER_HOME="$CACHE/gradle"
export PESTLE_VERSION_CODE="$(( $(date +%s) / 60 ))"
export PESTLE_VERSION_NAME="1.0.$(date -u +%Y%m%d.%H%M)"
echo "▶ Building APK $PESTLE_VERSION_NAME"
(cd android && chmod +x gradlew && ./gradlew --no-daemon -q assembleRelease)

cp android/app/build/outputs/apk/release/app-release.apk dist/Pestle.apk
(cd dist && sha256sum Pestle.apk > Pestle.apk.sha256)
rm -rf dist-android
ls -lh dist/Pestle.apk
