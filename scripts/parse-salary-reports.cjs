const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function parseMoneyRange(value) {
  const cleaned = value.replace(/€/g, '').replace(/\$/g, '').replace(/,/g, '').trim();

  if (!cleaned) return null;

  const approx = cleaned.replace(/^~/, '').trim();

  if (approx.includes('-')) {
    const [left, right] = approx.split('-').map((part) => part.replace(/\+/g, '').trim());
    const min = Number(left);
    const max = Number(right);

    if (Number.isFinite(min) && Number.isFinite(max)) {
      return { min, max };
    }
  }

  const single = Number(approx.replace(/\+/g, '').trim());
  if (Number.isFinite(single)) {
    return { min: single, max: single };
  }

  return null;
}

function inferDepartment(position) {
  const value = position.toLowerCase();

  if (
    value.includes('engineer') ||
    value.includes('eto') ||
    value.includes('av/it') ||
    value.includes('motorman') ||
    value.includes('oiler') ||
    value.includes('hvac') ||
    value.includes('electrician') ||
    value.includes('mechanical') ||
    value.includes('engine room') ||
    value.includes('plumber (engineer')
  ) {
    return 'Engineering';
  }

  if (
    value.includes('captain') ||
    value.includes('mate') ||
    value.includes('officer') ||
    value.includes('bosun') ||
    value.includes('deck') ||
    value.includes('tender') ||
    value.includes('dive') ||
    value.includes('water sports') ||
    value.includes('helideck') ||
    value.includes('security')
  ) {
    return 'Deck';
  }

  if (value.includes('chef') || value.includes('cook')) {
    return 'Culinary';
  }

  return 'Interior';
}

function parseMorganMallet() {
  const filePath = path.join(rootDir, 'research/salary-reports/morgan-mallet-2026-salary-guide.md');
  const text = fs.readFileSync(filePath, 'utf8');

  const sections = [
    { yachtSize: 'Below 30m', body: text.split('## Small Yachts (up to 30m)')[1]?.split('## Medium Yachts (30-40m)')[0] ?? '' },
    { yachtSize: '30-40m', body: text.split('## Medium Yachts (30-40m)')[1]?.split('## Large Yachts (40-50m)')[0] ?? '' },
    { yachtSize: '40-50m', body: text.split('## Large Yachts (40-50m)')[1]?.split('## Super Yachts (50-70m)')[0] ?? '' },
    { yachtSize: '50-70m', body: text.split('## Super Yachts (50-70m)')[1]?.split('## Mega Yachts (70-90m)')[0] ?? '' },
    { yachtSize: '70-90m', body: text.split('## Mega Yachts (70-90m)')[1]?.split('## Notes')[0] ?? '' },
  ];

  const rows = [];

  for (const section of sections) {
    const lines = section.body
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line.startsWith('|') && !line.includes('------') && !line.includes('Role |'));

    for (const line of lines) {
      const cells = line
        .split('|')
        .map((cell) => cell.trim())
        .filter(Boolean);

      if (cells.length < 3) continue;

      const position = cells[0];
      const range = parseMoneyRange(`${cells[1]} - ${cells[2]}`);
      if (!range) continue;

      rows.push({
        position,
        yachtSize: section.yachtSize,
        minSalary: range.min,
        maxSalary: range.max,
        currency: 'EUR',
        source: 'Morgan & Mallet (2026)',
        department: inferDepartment(position),
      });
    }
  }

  return rows;
}

function parseUksa() {
  const filePath = path.join(rootDir, 'research/salary-reports/uksa-2025-salary-guide.md');
  const text = fs.readFileSync(filePath, 'utf8');

  const tableLines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.startsWith('|'));

  const headerLine = tableLines[0];
  const sizeHeaders = headerLine
    .split('|')
    .map((cell) => cell.trim())
    .filter(Boolean)
    .slice(1);

  const dataLines = tableLines.slice(2);
  const rows = [];

  for (const line of dataLines) {
    const cells = line
      .split('|')
      .map((cell) => cell.trim())
      .filter(Boolean);

    const position = cells[0]?.replace(/\*\*/g, '');
    if (!position) continue;

    for (let index = 1; index < cells.length; index += 1) {
      const yachtSize = sizeHeaders[index - 1];
      const parsed = parseMoneyRange(cells[index]);
      if (!parsed) continue;

      rows.push({
        position,
        yachtSize,
        minSalary: parsed.min,
        maxSalary: parsed.max,
        currency: 'EUR',
        source: 'UKSA (2025)',
        department: inferDepartment(position),
      });
    }
  }

  return rows;
}

function writeImportFile(name, rows) {
  const outputDir = path.join(rootDir, 'data/imports');
  ensureDir(outputDir);
  const filePath = path.join(outputDir, name);
  fs.writeFileSync(filePath, `${JSON.stringify(rows, null, 2)}\n`, 'utf8');
  console.log(`Wrote ${rows.length} rows to ${filePath}`);
}

writeImportFile('morgan-mallet-2026.json', parseMorganMallet());
writeImportFile('uksa-2025.json', parseUksa());
