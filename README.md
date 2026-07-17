# ALFAJORSA
echo "=== תיקיית הפרויקט ==="
pwd

echo ""
echo "=== מצב Git ==="
git status --short --branch

echo ""
echo "=== גרסאות Node ו-NPM ==="
node --version
npm --version

echo ""
echo "=== גרסת Expo בפרויקט ==="
node -p "require('./package.json').dependencies?.expo || 'Expo not found'"

echo ""
echo "=== גרסת EAS CLI ==="
npx --yes eas-cli@latest --version

echo ""
echo "=== חשבון Expo מחובר ==="
npx --yes eas-cli@latest whoami || true

echo ""
echo "=== פרטי פרויקט EAS ==="
npx --yes eas-cli@latest project:info || true

echo ""
echo "=== app.json ==="
sed -n '1,200p' app.json 2>/dev/null || echo "app.json לא נמצא"

echo ""
echo "=== eas.json ==="
sed -n '1,200p' eas.json 2>/dev/null || echo "eas.json לא נמצא"