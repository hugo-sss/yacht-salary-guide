import { createClient } from '@supabase/supabase-js';

// Create client only when needed (not during SSR/static generation)
let supabaseInstance: ReturnType<typeof createClient> | null = null;

export function getSupabase() {
  if (!supabaseInstance && typeof window !== 'undefined') {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
    supabaseInstance = createClient(supabaseUrl, supabaseKey);
  }
  return supabaseInstance;
}

export interface SalaryRecord {
  id: string;
  position: string;
  yacht_size: string;
  min_salary: number;
  max_salary: number;
  currency: string;
  source: string;
  department: string;
  created_at: string;
}

export async function getSalaryData(): Promise<SalaryRecord[]> {
  const client = getSupabase();
  if (!client) return [];
  
  const { data, error } = await client
    .from('salary_benchmarks')
    .select('*')
    .order('position', { ascending: true });
  
  if (error) {
    console.error('Error fetching salary data:', error);
    return [];
  }
  
  return data || [];
}

export async function getSalaryForPositionAndSize(
  position: string, 
  yachtSize: string
): Promise<SalaryRecord[]> {
  const client = getSupabase();
  if (!client) return [];
  
  const { data, error } = await client
    .from('salary_benchmarks')
    .select('*')
    .eq('position', position)
    .eq('yacht_size', yachtSize);
  
  if (error) {
    console.error('Error fetching salary data:', error);
    return [];
  }
  
  return data || [];
}

export function getUniquePositions(data: SalaryRecord[]): string[] {
  return [...new Set(data.map(d => d.position))].sort();
}

export function getUniqueYachtSizes(data: SalaryRecord[]): string[] {
  return [...new Set(data.map(d => d.yacht_size))].sort();
}

export function getAverageSalary(data: SalaryRecord[]): { min: number; max: number; avg: number; count: number } {
  if (data.length === 0) return { min: 0, max: 0, avg: 0, count: 0 };
  
  const mins = data.map(d => d.min_salary);
  const maxs = data.map(d => d.max_salary);
  
  const minAvg = mins.reduce((a, b) => a + b, 0) / mins.length;
  const maxAvg = maxs.reduce((a, b) => a + b, 0) / maxs.length;
  
  return {
    min: Math.round(minAvg),
    max: Math.round(maxAvg),
    avg: Math.round((minAvg + maxAvg) / 2),
    count: data.length,
  };
}
