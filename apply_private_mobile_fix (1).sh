#!/usr/bin/env bash
set -Eeuo pipefail

echo "======================================================"
echo " ALFAJORSA — private Android + iPhone compatibility fix"
echo " NO publish • NO push • NO App Store • NO Google Play"
echo "======================================================"

fail() {
  echo
  echo "ERROR: $*" >&2
  exit 1
}

command -v git >/dev/null 2>&1 || fail "git is not installed"
command -v node >/dev/null 2>&1 || fail "Node.js is not installed"
command -v npm >/dev/null 2>&1 || fail "npm is not installed"
command -v python3 >/dev/null 2>&1 || fail "python3 is not installed"

ROOT="$(git rev-parse --show-toplevel 2>/dev/null)" || fail "Run this file from inside the ALFAJORSA repository"
cd "$ROOT"

REMOTE="$(git config --get remote.origin.url || true)"
case "$REMOTE" in
  *eladbezalel42-sketch/ALFAJORSA*) ;;
  *) fail "Wrong repository. Expected eladbezalel42-sketch/ALFAJORSA; origin is: ${REMOTE:-missing}" ;;
esac

# Protect existing work.
if [[ -n "$(git status --porcelain --untracked-files=no)" ]]; then
  fail "There are uncommitted tracked changes. Commit or stash them, then run this file again."
fi

STAMP="$(date +%Y%m%d-%H%M%S)"
BACKUP_DIR=".repair-backup/$STAMP"
mkdir -p "$BACKUP_DIR/.github/workflows"

for file in App.tsx app.json eas.json package.json package-lock.json .github/workflows/android-apk.yml; do
  if [[ -f "$file" ]]; then
    mkdir -p "$BACKUP_DIR/$(dirname "$file")"
    cp "$file" "$BACKUP_DIR/$file"
  fi
done

echo
echo "1/6 Installing the Expo-compatible safe-area package..."
npx expo install react-native-safe-area-context

echo
echo "2/6 Updating App.tsx for iPhone notches and home indicators..."
python3 <<'PY'
from pathlib import Path

path = Path("App.tsx")
text = path.read_text(encoding="utf-8")

# Remove deprecated React Native SafeAreaView import.
text = text.replace("  SafeAreaView,\n", "")

safe_import = "import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';\n"
rn_end = "} from 'react-native';\n"
if safe_import not in text:
    if rn_end not in text:
        raise SystemExit("Could not find the react-native import block")
    text = text.replace(rn_end, rn_end + safe_import, 1)

old_open = "  return (\n    <SafeAreaView style={styles.safeArea}>"
new_open = (
    "  return (\n"
    "    <SafeAreaProvider>\n"
    "      <SafeAreaView\n"
    "        style={styles.safeArea}\n"
    "        edges={['top', 'right', 'bottom', 'left']}\n"
    "      >"
)
if old_open in text:
    text = text.replace(old_open, new_open, 1)
elif "<SafeAreaProvider>" not in text:
    raise SystemExit("Could not find the root SafeAreaView opening tag")

old_close = "    </SafeAreaView>\n  );"
new_close = "      </SafeAreaView>\n    </SafeAreaProvider>\n  );"
if old_close in text:
    text = text.replace(old_close, new_close, 1)
elif "</SafeAreaProvider>" not in text:
    raise SystemExit("Could not find the root SafeAreaView closing tag")

path.write_text(text, encoding="utf-8")
PY

echo
echo "3/6 Updating cross-platform app configuration..."
python3 <<'PY'
from pathlib import Path
import json

app_path = Path("app.json")
data = json.loads(app_path.read_text(encoding="utf-8"))
expo = data.setdefault("expo", {})

expo["platforms"] = ["ios", "android"]
expo["scheme"] = "alfajorsa"
expo["orientation"] = "portrait"
expo["userInterfaceStyle"] = "light"

ios = expo.setdefault("ios", {})
ios["bundleIdentifier"] = ios.get("bundleIdentifier", "com.alfajorsa.app")
ios["buildNumber"] = str(ios.get("buildNumber", "1"))
ios["supportsTablet"] = bool(ios.get("supportsTablet", True))
info = ios.setdefault("infoPlist", {})
info["CFBundleDevelopmentRegion"] = "he"

android = expo.setdefault("android", {})
android["package"] = android.get("package", "com.alfajorsa.app")
android["versionCode"] = int(android.get("versionCode", 1))
android["edgeToEdgeEnabled"] = True

app_path.write_text(
    json.dumps(data, ensure_ascii=False, indent=2) + "\n",
    encoding="utf-8",
)

package_path = Path("package.json")
pkg = json.loads(package_path.read_text(encoding="utf-8"))
scripts = pkg.setdefault("scripts", {})
scripts["doctor"] = "npx expo-doctor"
scripts["verify:mobile"] = "npm run typecheck && npm run doctor"
package_path.write_text(
    json.dumps(pkg, ensure_ascii=False, indent=2) + "\n",
    encoding="utf-8",
)
PY

echo
echo "4/6 Restricting EAS to private preview builds only..."
cat > eas.json <<'JSON'
{
  "cli": {
    "version": ">= 16.0.0"
  },
  "build": {
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    },
    "ios-simulator": {
      "distribution": "internal",
      "ios": {
        "simulator": true
      }
    }
  }
}
JSON

echo
echo "5/6 Replacing the old Android-only workflow with Android + iOS verification..."
mkdir -p .github/workflows
cat > .github/workflows/android-apk.yml <<'YAML'
name: Verify Android and iOS — No Publish

on:
  workflow_dispatch:
  pull_request:
    paths:
      - 'App.tsx'
      - 'index.ts'
      - 'app.json'
      - 'eas.json'
      - 'package.json'
      - 'package-lock.json'
      - 'tsconfig.json'
      - '.github/workflows/android-apk.yml'
  push:
    branches:
      - main
      - 'agent/**'
      - 'fix/**'
    paths:
      - 'App.tsx'
      - 'index.ts'
      - 'app.json'
      - 'eas.json'
      - 'package.json'
      - 'package-lock.json'
      - 'tsconfig.json'
      - '.github/workflows/android-apk.yml'

permissions:
  contents: read

concurrency:
  group: mobile-verify-${{ github.ref }}
  cancel-in-progress: true

jobs:
  android:
    name: Android standalone build check
    runs-on: ubuntu-24.04
    timeout-minutes: 45

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '22.13.1'
          cache: npm

      - name: Setup Java
        uses: actions/setup-java@v4
        with:
          distribution: temurin
          java-version: '17'
          cache: gradle

      - name: Setup Android SDK
        uses: android-actions/setup-android@v3

      - name: Install Android SDK packages
        run: |
          yes | sdkmanager --licenses >/dev/null || true
          sdkmanager 'platform-tools' 'platforms;android-36' 'build-tools;36.0.0'

      - name: Install dependencies
        run: npm ci --no-audit --no-fund

      - name: Validate Expo and TypeScript
        run: npm run verify:mobile

      - name: Generate Android project
        env:
          NODE_ENV: production
        run: npx expo prebuild --platform android --clean --non-interactive

      - name: Configure Android SDK path
        run: |
          SDK_PATH="${ANDROID_SDK_ROOT:-$ANDROID_HOME}"
          test -n "$SDK_PATH"
          printf 'sdk.dir=%s\n' "$SDK_PATH" > android/local.properties

      - name: Verify standalone Android release
        working-directory: android
        env:
          NODE_ENV: production
        run: |
          chmod +x gradlew
          ./gradlew :app:assembleRelease --no-daemon --stacktrace

      # Intentionally no artifact upload and no store submission.

  ios:
    name: iPhone simulator build check
    runs-on: macos-26
    timeout-minutes: 60

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '22.13.1'
          cache: npm

      - name: Install dependencies
        run: npm ci --no-audit --no-fund

      - name: Validate Expo and TypeScript
        run: npm run verify:mobile

      - name: Generate iOS project
        env:
          NODE_ENV: production
        run: npx expo prebuild --platform ios --clean --non-interactive

      - name: Install CocoaPods
        working-directory: ios
        run: pod install --repo-update

      - name: Verify iPhone simulator build without signing
        shell: bash
        run: |
          WORKSPACE="$(find ios -maxdepth 1 -type d -name '*.xcworkspace' -print -quit)"
          test -n "$WORKSPACE"

          xcodebuild -workspace "$WORKSPACE" -list -json > /tmp/xcode-list.json
          SCHEME="$(python3 - <<'PY'
          import json
          with open('/tmp/xcode-list.json', encoding='utf-8') as f:
              data = json.load(f)
          schemes = data.get('workspace', {}).get('schemes', [])
          if not schemes:
              raise SystemExit('No Xcode scheme found')
          print(schemes[0])
          PY
          )"

          xcodebuild \
            -workspace "$WORKSPACE" \
            -scheme "$SCHEME" \
            -configuration Debug \
            -sdk iphonesimulator \
            -destination 'generic/platform=iOS Simulator' \
            -derivedDataPath build/ios-simulator \
            CODE_SIGNING_ALLOWED=NO \
            build

      # Intentionally no IPA upload, TestFlight upload, or App Store submission.
YAML

echo
echo "6/6 Running local checks (no build and no publishing)..."
npm run typecheck
npx expo-doctor
git diff --check

echo
echo "======================================================"
echo "Local compatibility changes are ready."
echo
echo "Nothing was committed."
echo "Nothing was pushed."
echo "Nothing was published."
echo
echo "Review with:"
echo "  git status"
echo "  git diff"
echo
echo "Backup:"
echo "  $BACKUP_DIR"
echo "======================================================"
