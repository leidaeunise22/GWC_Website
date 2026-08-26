// Fills the __PLACEHOLDER__ tokens in firebase-config.js and contact.html
// with real values from .env, so you can test locally the same way the
// GitHub Actions workflow does at deploy time (see .github/workflows/static.yml).
//
// Run:    node scripts/apply-local-env.js
// Revert: git checkout -- firebase-config.js contact.html
//
// Never commit the files while the real values are applied — .env is
// gitignored specifically so this stays local only.

const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const envPath = path.join(root, ".env");

if (!fs.existsSync(envPath)) {
  console.error("No .env file found at " + envPath);
  console.error("Create one with FIREBASE_API_KEY, FIREBASE_AUTH_DOMAIN, etc.");
  process.exit(1);
}

const env = {};
for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) continue;
  const eq = trimmed.indexOf("=");
  if (eq === -1) continue;
  env[trimmed.slice(0, eq).trim()] = trimmed.slice(eq + 1).trim();
}

const targets = [
  {
    file: "firebase-config.js",
    replacements: {
      __FIREBASE_API_KEY__: env.FIREBASE_API_KEY,
      __FIREBASE_AUTH_DOMAIN__: env.FIREBASE_AUTH_DOMAIN,
      __FIREBASE_PROJECT_ID__: env.FIREBASE_PROJECT_ID,
      __FIREBASE_STORAGE_BUCKET__: env.FIREBASE_STORAGE_BUCKET,
      __FIREBASE_MESSAGING_SENDER_ID__: env.FIREBASE_MESSAGING_SENDER_ID,
      __FIREBASE_APP_ID__: env.FIREBASE_APP_ID,
      __FIREBASE_MEASUREMENT_ID__: env.FIREBASE_MEASUREMENT_ID
    }
  },
  {
    file: "contact.html",
    replacements: {
      __WEB3FORMS_ACCESS_KEY__: env.WEB3FORMS_ACCESS_KEY
    }
  }
];

let missing = [];

for (const target of targets) {
  const filePath = path.join(root, target.file);
  let content = fs.readFileSync(filePath, "utf8");

  for (const [placeholder, value] of Object.entries(target.replacements)) {
    if (!value) {
      missing.push(placeholder);
      continue;
    }
    content = content.split(placeholder).join(value);
  }

  fs.writeFileSync(filePath, content);
  console.log("Updated " + target.file);
}

if (missing.length) {
  console.warn("\nMissing values in .env for: " + missing.join(", "));
  console.warn("Those placeholders were left as-is.");
}

console.log("\nDone. Remember to run `git checkout -- firebase-config.js contact.html` before committing.");
