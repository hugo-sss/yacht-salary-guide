import { createClient } from '@supabase/supabase-js';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { loadLocalEnvFiles } from './load-env.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

loadLocalEnvFiles(path.join(__dirname, '..'));

type SalaryBenchmarkRow = {
  id?: string;
  position: string;
  yacht_size: string;
  min_salary: number;
  max_salary: number;
  currency?: string | null;
  source: string;
  department?: string | null;
  created_at?: string | null;
};

const WRITE_FLAG = '--write';
const REPLACE_FLAG = '--replace';
const BATCH_SIZE = 500;
const TABLE_NAME = 'salary_benchmarks';
const COLUMN_LIST =
  'id,position,yacht_size,min_salary,max_salary,currency,source,department,created_at';

function getRequiredEnv(name: string): string {
  const value = process.env[name];

  if (!value) {
    console.error(`Missing required environment variable: ${name}`);
    process.exit(1);
  }

  return value;
}

function chunkRows<T>(rows: T[], chunkSize: number): T[][] {
  const chunks: T[][] = [];

  for (let index = 0; index < rows.length; index += chunkSize) {
    chunks.push(rows.slice(index, index + chunkSize));
  }

  return chunks;
}

async function fetchAllRows(): Promise<SalaryBenchmarkRow[]> {
  const sourceUrl = getRequiredEnv('SOURCE_SUPABASE_URL');
  const sourceKey =
    process.env.SOURCE_SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SOURCE_SUPABASE_SERVICE_KEY;

  if (!sourceKey) {
    console.error(
      'Missing SOURCE_SUPABASE_SERVICE_ROLE_KEY. A service-role key is required to read from the source project.'
    );
    process.exit(1);
  }

  const source = createClient(sourceUrl, sourceKey);
  const rows: SalaryBenchmarkRow[] = [];
  let from = 0;

  while (true) {
    const { data, error } = await source
      .from(TABLE_NAME)
      .select(COLUMN_LIST)
      .order('id', { ascending: true })
      .range(from, from + BATCH_SIZE - 1);

    if (error) {
      console.error('Failed to read salary_benchmarks from the source project.');
      console.error(error.message);
      process.exit(1);
    }

    if (!data || data.length === 0) {
      break;
    }

    rows.push(...data);
    from += data.length;
  }

  return rows;
}

async function getTargetCount() {
  const targetUrl = getRequiredEnv('TARGET_SUPABASE_URL');
  const targetKey =
    process.env.TARGET_SUPABASE_SERVICE_ROLE_KEY ||
    process.env.TARGET_SUPABASE_SERVICE_KEY;

  if (!targetKey) {
    console.error(
      'Missing TARGET_SUPABASE_SERVICE_ROLE_KEY. A service-role key is required to write to the target project.'
    );
    process.exit(1);
  }

  const target = createClient(targetUrl, targetKey);
  const result = await target.from(TABLE_NAME).select('id', { count: 'exact', head: true });

  if (result.error) {
    console.error('Failed to inspect the target project.');
    console.error(
      `${result.error.message} Run /Users/hugo-sss/yacht-salary-guide/supabase-schema.sql in the target project first if the table does not exist yet.`
    );
    process.exit(1);
  }

  return {
    client: target,
    count: result.count ?? 0,
  };
}

async function main() {
  const shouldWrite = process.argv.includes(WRITE_FLAG);
  const shouldReplace = process.argv.includes(REPLACE_FLAG);
  const sourceRows = await fetchAllRows();
  const { client: target, count: targetCount } = await getTargetCount();

  console.log(`Source rows found: ${sourceRows.length}`);
  console.log(`Target rows currently present: ${targetCount}`);

  if (sourceRows.length === 0) {
    console.log('No rows found in the source project, so there is nothing to transfer.');
    return;
  }

  if (!shouldWrite) {
    console.log('Dry run only. No data was written.');
    console.log(
      'Re-run with --write to copy rows, or --write --replace to clear the target table before copying.'
    );
    return;
  }

  if (shouldReplace) {
    const { error } = await target.from(TABLE_NAME).delete().not('id', 'is', null);

    if (error) {
      console.error('Failed to clear the target table before transfer.');
      console.error(error.message);
      process.exit(1);
    }

    console.log('Cleared existing target rows.');
  }

  const rowChunks = chunkRows(sourceRows, BATCH_SIZE);

  for (const [index, chunk] of rowChunks.entries()) {
    const { error } = await target.from(TABLE_NAME).upsert(chunk, { onConflict: 'id' });

    if (error) {
      console.error(`Failed while writing batch ${index + 1} of ${rowChunks.length}.`);
      console.error(error.message);
      process.exit(1);
    }

    console.log(`Transferred batch ${index + 1} of ${rowChunks.length} (${chunk.length} rows).`);
  }

  console.log('Transfer complete.');
}

main().catch((error) => {
  console.error('Unexpected transfer failure.');
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
