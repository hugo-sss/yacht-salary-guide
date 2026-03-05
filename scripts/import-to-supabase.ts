import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials. Set SUPABASE_URL and SUPABASE_SERVICE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function importData() {
  // Read the JSON data
  const dataPath = path.join(__dirname, '..', 'salary-data.json');
  const rawData = fs.readFileSync(dataPath, 'utf-8');
  const salaryData = JSON.parse(rawData);
  
  console.log(`Importing ${salaryData.length} salary records to Supabase...`);
  
  // Transform data to match Supabase schema
  const records = salaryData.map((item: any) => ({
    position: item.position,
    yacht_size: item.yachtSize,
    min_salary: item.minSalary,
    max_salary: item.maxSalary,
    currency: item.currency,
    source: item.source,
    department: item.category,
  }));
  
  // Insert in batches of 50
  const batchSize = 50;
  for (let i = 0; i < records.length; i += batchSize) {
    const batch = records.slice(i, i + batchSize);
    const { data, error } = await supabase
      .from('salary_benchmarks')
      .insert(batch);
    
    if (error) {
      console.error(`Error inserting batch ${i / batchSize + 1}:`, error);
    } else {
      console.log(`✅ Inserted batch ${i / batchSize + 1} (${batch.length} records)`);
    }
  }
  
  console.log('✅ Import complete!');
  console.log(`Total records: ${records.length}`);
}

importData().catch(console.error);
