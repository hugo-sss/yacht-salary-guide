const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const { loadLocalEnvFiles } = require('./load-env.cjs');

loadLocalEnvFiles(path.join(__dirname, '..'));

const TABLE_NAME = 'salary_benchmarks';
const BATCH_SIZE = 200;

function getArg(flag) {
  const index = process.argv.indexOf(flag);
  return index === -1 ? undefined : process.argv[index + 1];
}

function hasFlag(flag) {
  return process.argv.includes(flag);
}

function exitWithHelp(message) {
  if (message) {
    console.error(message);
    console.error('');
  }

  console.error('Usage: npm run supabase:upsert -- --file data/imports/my-file.json [--write] [--replace-source]');
  console.error('');
  console.error('Flags:');
  console.error('  --file <path>         Path to a JSON file containing salary rows');
  console.error('  --write               Actually write to Supabase. Without this, the script runs as a dry run');
  console.error('  --replace-source      Delete existing rows for the same source(s) before inserting');
  process.exit(1);
}

function normalizeDepartment(value) {
  if (value === 'Deck' || value === 'Engineering' || value === 'Interior' || value === 'Culinary') {
    return value;
  }

  throw new Error(`Invalid department/category "${String(value)}". Use Deck, Engineering, Interior, or Culinary.`);
}

function normalizeRow(row, index) {
  const yachtSize = row.yacht_size ?? row.yachtSize;
  const minSalary = row.min_salary ?? row.minSalary;
  const maxSalary = row.max_salary ?? row.maxSalary;
  const department = row.department ?? row.category;

  if (!row.position) {
    throw new Error(`Row ${index + 1}: missing "position"`);
  }

  if (!yachtSize) {
    throw new Error(`Row ${index + 1}: missing "yachtSize" or "yacht_size"`);
  }

  if (typeof minSalary !== 'number' || Number.isNaN(minSalary)) {
    throw new Error(`Row ${index + 1}: missing or invalid "minSalary" / "min_salary"`);
  }

  if (typeof maxSalary !== 'number' || Number.isNaN(maxSalary)) {
    throw new Error(`Row ${index + 1}: missing or invalid "maxSalary" / "max_salary"`);
  }

  if (!row.source) {
    throw new Error(`Row ${index + 1}: missing "source"`);
  }

  if (!department) {
    throw new Error(`Row ${index + 1}: missing "department" or "category"`);
  }

  return {
    position: row.position.trim(),
    yacht_size: yachtSize.trim(),
    min_salary: minSalary,
    max_salary: maxSalary,
    currency: (row.currency ?? 'EUR').trim(),
    source: row.source.trim(),
    department: normalizeDepartment(department),
  };
}

function chunkRows(rows, size) {
  const chunks = [];

  for (let index = 0; index < rows.length; index += size) {
    chunks.push(rows.slice(index, index + size));
  }

  return chunks;
}

function makeRowKey(row) {
  return [
    row.position,
    row.yacht_size,
    row.min_salary,
    row.max_salary,
    row.currency,
    row.source,
    row.department,
  ].join('|');
}

async function main() {
  const fileArg = getArg('--file');
  const shouldWrite = hasFlag('--write');
  const shouldReplaceSource = hasFlag('--replace-source');

  if (!fileArg) {
    exitWithHelp('Missing required --file argument.');
  }

  const filePath = path.resolve(process.cwd(), fileArg);

  if (!fs.existsSync(filePath)) {
    exitWithHelp(`Import file not found: ${filePath}`);
  }

  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local.');
    process.exit(1);
  }

  const parsed = JSON.parse(fs.readFileSync(filePath, 'utf8'));

  if (!Array.isArray(parsed)) {
    throw new Error('Import file must be a JSON array of rows.');
  }

  const normalizedRows = parsed.map((row, index) => normalizeRow(row, index));
  const dedupedRows = Array.from(new Map(normalizedRows.map((row) => [makeRowKey(row), row])).values());
  const sources = [...new Set(dedupedRows.map((row) => row.source))];

  console.log(`Loaded ${parsed.length} rows from ${filePath}`);
  console.log(`Normalized rows: ${normalizedRows.length}`);
  console.log(`Deduped rows: ${dedupedRows.length}`);
  console.log(`Sources in file: ${sources.join(', ')}`);

  if (!shouldWrite) {
    console.log('Dry run only. Re-run with --write to insert rows.');
    if (!shouldReplaceSource) {
      console.log('Tip: add --replace-source if you want to fully replace all rows for the source(s) in this file.');
    }
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  if (shouldReplaceSource) {
    for (const source of sources) {
      const { error } = await supabase.from(TABLE_NAME).delete().eq('source', source);

      if (error) {
        throw new Error(`Failed to delete existing rows for source "${source}": ${error.message}`);
      }

      console.log(`Cleared existing rows for source: ${source}`);
    }
  }

  const chunks = chunkRows(dedupedRows, BATCH_SIZE);

  for (const [index, chunk] of chunks.entries()) {
    const { error } = await supabase.from(TABLE_NAME).insert(chunk);

    if (error) {
      throw new Error(`Failed to insert batch ${index + 1}/${chunks.length}: ${error.message}`);
    }

    console.log(`Inserted batch ${index + 1}/${chunks.length} (${chunk.length} rows)`);
  }

  console.log('Salary import complete.');
}

main().catch((error) => {
  console.error('Salary import failed.');
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
