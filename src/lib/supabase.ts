import bundledSalaryData from '../../salary-data.json';

export type SalaryDepartment = 'Deck' | 'Engineering' | 'Interior' | 'Culinary';

export interface SalaryRecord {
  id: string;
  position: string;
  yacht_size: string;
  min_salary: number;
  max_salary: number;
  currency: string;
  source: string;
  department: SalaryDepartment;
  created_at?: string;
}

export interface SalaryLoadResult {
  data: SalaryRecord[];
  source: 'live' | 'fallback';
  error: string | null;
}

type RawBundledSalaryRecord = {
  position: string;
  yachtSize: string;
  minSalary: number;
  maxSalary: number;
  currency: string;
  source: string;
  category: SalaryDepartment;
};

export const POSITION_ORDER = [
  'Captain',
  'Chief Engineer',
  'First Officer',
  'Second Officer',
  'Third Officer',
  'Mate',
  'Bosun',
  'Lead Deckhand',
  'Deckhand',
  'Junior Deckhand',
  'Chief Stewardess',
  'Head of Service',
  'Head of Housekeeping',
  'Second Stewardess',
  'Stewardess',
  'Junior Stewardess',
  'Purser',
  'ETO / AV-IT',
  'Second Engineer',
  'Third Engineer',
  'Head Chef',
  'Sous Chef',
  'Crew Chef',
  'Cook',
];

const POSITION_ALIASES: Record<string, string> = {
  'Chief Officer / First Mate': 'First Officer',
  'Chief Officer / First Officer': 'First Officer',
  'First Mate / Deckhand': 'Mate',
  '2nd Mate/Bosun': 'Bosun',
  'Chief Steward/Stewardess': 'Chief Stewardess',
  'Chief Steward(ess)/Purser': 'Chief Stewardess',
  'Second Steward/Stewardess': 'Second Stewardess',
  'Third Steward/Stewardess': 'Stewardess',
  'Steward/Stewardess (or Solo Stew)': 'Stewardess',
  'Steward(ess)': 'Stewardess',
  'Service Steward/Stewardess': 'Stewardess',
  'Senior Service Steward/Stewardess': 'Second Stewardess',
  'Laundry Steward/Stewardess': 'Stewardess',
  'Chef/Cook': 'Head Chef',
  'Chef (small yacht)': 'Head Chef',
  'Cook/Stew': 'Cook',
  ETO: 'ETO / AV-IT',
  'AV/IT Manager': 'ETO / AV-IT',
  'AV/IT Technician': 'ETO / AV-IT',
  'Engineer (or Captain/Engineer)': 'Chief Engineer',
};

const YACHT_SIZE_ALIASES: Record<string, string> = {
  '45-50m': '40-50m',
  '50-55m': '50-60m',
  '55-60m': '50-60m',
  '70-90m': '80-100m',
  '70m+': '80-100m',
};

export const COMPARISON_YACHT_BANDS = [
  'Below 30m',
  '30-40m',
  '40-50m',
  '50-60m',
  '60-80m',
  '80-90m',
  '90-100m',
  '100m+',
] as const;

const DEPARTMENTS: SalaryDepartment[] = ['Deck', 'Engineering', 'Interior', 'Culinary'];

const POSITION_TO_DEPARTMENT = (bundledSalaryData as RawBundledSalaryRecord[]).reduce<
  Record<string, SalaryDepartment>
>((lookup, record) => {
  lookup[normalizePosition(record.position)] = record.category;
  return lookup;
}, {});

function normalizeDepartment(value: unknown): SalaryDepartment | null {
  return typeof value === 'string' && DEPARTMENTS.includes(value as SalaryDepartment)
    ? (value as SalaryDepartment)
    : null;
}

function getFallbackSalaryRecords(): SalaryRecord[] {
  return (bundledSalaryData as RawBundledSalaryRecord[]).map((record, index) => ({
    id: `bundled-${index}`,
    position: record.position,
    yacht_size: record.yachtSize,
    min_salary: record.minSalary,
    max_salary: record.maxSalary,
    currency: record.currency,
    source: record.source,
    department: record.category,
  }));
}

export function getBundledSalaryData(): SalaryRecord[] {
  return prepareSalaryData(getFallbackSalaryRecords());
}

function sanitizeSalaryRecord(record: Partial<SalaryRecord>, index: number): SalaryRecord | null {
  const position = typeof record.position === 'string' ? normalizePosition(record.position) : '';
  const yachtSize = typeof record.yacht_size === 'string' ? normalizeYachtSize(record.yacht_size) : '';
  const source = typeof record.source === 'string' ? record.source : '';
  const minSalary = Number(record.min_salary);
  const maxSalary = Number(record.max_salary);

  if (!position || !yachtSize || !source || !Number.isFinite(minSalary) || !Number.isFinite(maxSalary)) {
    return null;
  }

  return {
    id: String(record.id ?? `record-${index}`),
    position,
    yacht_size: yachtSize,
    min_salary: minSalary,
    max_salary: maxSalary,
    currency: typeof record.currency === 'string' ? record.currency : 'EUR',
    source,
    department:
      normalizeDepartment(record.department) ?? POSITION_TO_DEPARTMENT[position] ?? 'Deck',
    created_at: typeof record.created_at === 'string' ? record.created_at : undefined,
  };
}

function dedupeSalaryRecords(records: SalaryRecord[]): SalaryRecord[] {
  const seen = new Set<string>();

  return records.filter((record) => {
    const key = [
      record.position,
      record.yacht_size,
      record.source,
      record.min_salary,
      record.max_salary,
      record.currency,
    ].join('|');

    if (seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
}

export function normalizePosition(position: string): string {
  return POSITION_ALIASES[position] ?? position;
}

export function normalizeYachtSize(size: string): string {
  return YACHT_SIZE_ALIASES[size] ?? size;
}

function getComparisonBandRange(size: (typeof COMPARISON_YACHT_BANDS)[number]): { lower: number; upper: number } {
  switch (size) {
    case 'Below 30m':
      return { lower: 0, upper: 30 };
    case '100m+':
      return { lower: 100, upper: Number.MAX_SAFE_INTEGER };
    default:
      return parseYachtSize(size);
  }
}

function rangesOverlap(
  left: { lower: number; upper: number },
  right: { lower: number; upper: number }
): boolean {
  return left.lower < right.upper && right.lower < left.upper;
}

export function getComparisonYachtBands(size: string): string[] {
  const normalized = normalizeYachtSize(size);
  const normalizedRange = parseYachtSize(normalized);

  return COMPARISON_YACHT_BANDS.filter((band) =>
    rangesOverlap(normalizedRange, getComparisonBandRange(band))
  );
}

export function getPrimaryComparisonYachtBand(size: string): string {
  return getComparisonYachtBands(size)[0] ?? normalizeYachtSize(size);
}

function parseYachtSize(size: string): { lower: number; upper: number } {
  if (size === 'Below 30m') {
    return { lower: 0, upper: 30 };
  }

  const match = size.match(/^(\d+)(?:-(\d+))?m?\+?$/);
  if (!match) {
    const rangeMatch = size.match(/^(\d+)-(\d+)m$/);
    if (rangeMatch) {
      return { lower: Number(rangeMatch[1]), upper: Number(rangeMatch[2]) };
    }
    const plusMatch = size.match(/^(\d+)m\+$/);
    if (plusMatch) {
      return { lower: Number(plusMatch[1]), upper: Number.MAX_SAFE_INTEGER };
    }
    return { lower: Number.MAX_SAFE_INTEGER, upper: Number.MAX_SAFE_INTEGER };
  }

  const lower = Number(match[1]);
  const upper = match[2] ? Number(match[2]) : size.includes('+') ? Number.MAX_SAFE_INTEGER : lower;
  return { lower, upper };
}

export function orderByList(value: string, list: string[]): number {
  const index = list.indexOf(value);
  return index === -1 ? Number.MAX_SAFE_INTEGER : index;
}

export function compareYachtSizes(a: string, b: string): number {
  const first = parseYachtSize(a);
  const second = parseYachtSize(b);

  if (first.lower !== second.lower) {
    return first.lower - second.lower;
  }

  if (first.upper !== second.upper) {
    return first.upper - second.upper;
  }

  return a.localeCompare(b);
}

export function compareSalaryRecords(a: SalaryRecord, b: SalaryRecord): number {
  const positionDelta = orderByList(a.position, POSITION_ORDER) - orderByList(b.position, POSITION_ORDER);
  if (positionDelta !== 0) return positionDelta;
  if (orderByList(a.position, POSITION_ORDER) === Number.MAX_SAFE_INTEGER) {
    const alphaDelta = a.position.localeCompare(b.position);
    if (alphaDelta !== 0) return alphaDelta;
  }

  const sizeDelta = compareYachtSizes(a.yacht_size, b.yacht_size);
  if (sizeDelta !== 0) return sizeDelta;

  return a.source.localeCompare(b.source);
}

export function prepareSalaryData(records: Partial<SalaryRecord>[]): SalaryRecord[] {
  return dedupeSalaryRecords(
    records
      .map((record, index) => sanitizeSalaryRecord(record, index))
      .filter((record): record is SalaryRecord => record !== null)
  ).sort(compareSalaryRecords);
}

export async function loadSalaryData(): Promise<SalaryLoadResult> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const fallbackData = getBundledSalaryData();

  if (!supabaseUrl || !supabaseKey) {
    return {
      data: fallbackData,
      source: 'fallback',
      error: null,
    };
  }

  try {
    const response = await fetch(
      `${supabaseUrl}/rest/v1/salary_benchmarks?select=*&order=position.asc,yacht_size.asc,source.asc`,
      {
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = prepareSalaryData(await response.json());

    if (data.length === 0) {
      throw new Error('The live salary dataset returned no rows.');
    }

    return {
      data,
      source: 'live',
      error: null,
    };
  } catch {
    return {
      data: fallbackData,
      source: 'fallback',
      error: null,
    };
  }
}

export function getAverageSalary(data: SalaryRecord[]): { min: number; max: number; avg: number; count: number } {
  if (data.length === 0) return { min: 0, max: 0, avg: 0, count: 0 };

  const minAverage = data.reduce((sum, record) => sum + record.min_salary, 0) / data.length;
  const maxAverage = data.reduce((sum, record) => sum + record.max_salary, 0) / data.length;

  return {
    min: Math.round(minAverage),
    max: Math.round(maxAverage),
    avg: Math.round((minAverage + maxAverage) / 2),
    count: data.length,
  };
}

export function getUniquePositions(data: SalaryRecord[]): string[] {
  return [...new Set(data.map((record) => record.position))].sort(
    (a, b) => {
      const orderDelta = orderByList(a, POSITION_ORDER) - orderByList(b, POSITION_ORDER);
      return orderDelta !== 0 ? orderDelta : a.localeCompare(b);
    }
  );
}

export function getUniqueYachtSizes(data: SalaryRecord[]): string[] {
  return [...new Set(data.map((record) => record.yacht_size))].sort(compareYachtSizes);
}

export function getUniqueComparisonYachtBands(data: SalaryRecord[]): string[] {
  return [...new Set(data.flatMap((record) => getComparisonYachtBands(record.yacht_size)))].sort(compareYachtSizes);
}

export function getUniqueSources(data: SalaryRecord[]): string[] {
  return [...new Set(data.map((record) => record.source))].sort((a, b) => a.localeCompare(b));
}

export function getCategoryForPosition(data: SalaryRecord[], position: string): SalaryDepartment {
  return data.find((record) => record.position === position)?.department ?? POSITION_TO_DEPARTMENT[position] ?? 'Deck';
}
