const fs = require('fs');
const path = require('path');

function parseValue(rawValue) {
  const value = rawValue.trim();

  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1);
  }

  return value;
}

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return;
  }

  const lines = fs.readFileSync(filePath, 'utf8').split(/\r?\n/);

  for (const line of lines) {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith('#')) {
      continue;
    }

    const normalized = trimmed.startsWith('export ') ? trimmed.slice(7) : trimmed;
    const separatorIndex = normalized.indexOf('=');

    if (separatorIndex === -1) {
      continue;
    }

    const key = normalized.slice(0, separatorIndex).trim();
    const value = parseValue(normalized.slice(separatorIndex + 1));

    if (!key || process.env[key] !== undefined) {
      continue;
    }

    process.env[key] = value;
  }
}

function loadLocalEnvFiles(cwd = process.cwd()) {
  const candidates = ['.env.local', '.env'];

  for (const candidate of candidates) {
    loadEnvFile(path.join(cwd, candidate));
  }
}

module.exports = {
  loadLocalEnvFiles,
};
