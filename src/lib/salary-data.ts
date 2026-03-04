export interface SalaryRange {
  position: string;
  category: 'Deck' | 'Engineering' | 'Interior' | 'Culinary';
  yachtSize: string;
  minSalary: number;
  maxSalary: number;
  currency: string;
  period: 'month' | 'year';
  source: string;
  leaveDays?: string;
  rotation?: string;
}

export const yachtSizes = [
  'Below 30m',
  '30-40m',
  '40-50m',
  '50-60m',
  '60-80m',
  '80-100m',
  '100m+',
];

export const positions = [
  'Captain',
  'Chief Officer / First Mate',
  'First Officer',
  'Second Officer',
  'Third Officer',
  'Bosun',
  'Lead Deckhand',
  'Deckhand',
  'Junior Deckhand',
  'Chief Engineer',
  'Second Engineer',
  'Third Engineer',
  'Motorman',
  'ETO / AV-IT',
  'Chief Stewardess',
  'Second Stewardess',
  'Stewardess',
  'Junior Stewardess',
  'Solo Stewardess',
  'Purser',
  'Head Chef',
  'Sous Chef',
  'Crew Chef',
  'Chef/Stew',
];

export const salaryData: SalaryRange[] = [
  // Flying Fish Data (EUR/month)
  { position: 'Captain', category: 'Deck', yachtSize: '20-40m', minSalary: 4000, maxSalary: 7000, currency: 'EUR', period: 'month', source: 'Flying Fish Online' },
  { position: 'Captain', category: 'Deck', yachtSize: '40-60m', minSalary: 7000, maxSalary: 14000, currency: 'EUR', period: 'month', source: 'Flying Fish Online' },
  { position: 'Captain', category: 'Deck', yachtSize: '60-80m', minSalary: 14000, maxSalary: 16000, currency: 'EUR', period: 'month', source: 'Flying Fish Online' },
  { position: 'Captain', category: 'Deck', yachtSize: '80m+', minSalary: 16000, maxSalary: 25000, currency: 'EUR', period: 'month', source: 'Flying Fish Online' },
  
  { position: 'First Officer', category: 'Deck', yachtSize: '20-40m', minSalary: 3000, maxSalary: 5000, currency: 'EUR', period: 'month', source: 'Flying Fish Online' },
  { position: 'First Officer', category: 'Deck', yachtSize: '40-60m', minSalary: 4300, maxSalary: 5700, currency: 'EUR', period: 'month', source: 'Flying Fish Online' },
  { position: 'First Officer', category: 'Deck', yachtSize: '60-80m', minSalary: 6000, maxSalary: 8000, currency: 'EUR', period: 'month', source: 'Flying Fish Online' },
  { position: 'First Officer', category: 'Deck', yachtSize: '80m+', minSalary: 7000, maxSalary: 10000, currency: 'EUR', period: 'month', source: 'Flying Fish Online' },
  
  { position: 'Bosun', category: 'Deck', yachtSize: '20-40m', minSalary: 3200, maxSalary: 4500, currency: 'EUR', period: 'month', source: 'Flying Fish Online' },
  { position: 'Bosun', category: 'Deck', yachtSize: '40-60m', minSalary: 4000, maxSalary: 5000, currency: 'EUR', period: 'month', source: 'Flying Fish Online' },
  { position: 'Bosun', category: 'Deck', yachtSize: '60m+', minSalary: 5000, maxSalary: 8000, currency: 'EUR', period: 'month', source: 'Flying Fish Online' },
  
  { position: 'Deckhand', category: 'Deck', yachtSize: '20-40m', minSalary: 2800, maxSalary: 3500, currency: 'EUR', period: 'month', source: 'Flying Fish Online' },
  { position: 'Deckhand', category: 'Deck', yachtSize: '40-60m', minSalary: 2800, maxSalary: 4000, currency: 'EUR', period: 'month', source: 'Flying Fish Online' },
  { position: 'Deckhand', category: 'Deck', yachtSize: '60-80m', minSalary: 3500, maxSalary: 4500, currency: 'EUR', period: 'month', source: 'Flying Fish Online' },
  { position: 'Deckhand', category: 'Deck', yachtSize: '80m+', minSalary: 4500, maxSalary: 6000, currency: 'EUR', period: 'month', source: 'Flying Fish Online' },
  
  { position: 'Junior Deckhand', category: 'Deck', yachtSize: '20-40m', minSalary: 2000, maxSalary: 3000, currency: 'EUR', period: 'month', source: 'Flying Fish Online' },
  { position: 'Junior Deckhand', category: 'Deck', yachtSize: '40m+', minSalary: 2000, maxSalary: 3000, currency: 'EUR', period: 'month', source: 'Flying Fish Online' },
  
  // Interior
  { position: 'Chief Stewardess', category: 'Interior', yachtSize: '20-40m', minSalary: 3000, maxSalary: 4500, currency: 'EUR', period: 'month', source: 'Flying Fish Online' },
  { position: 'Chief Stewardess', category: 'Interior', yachtSize: '40-60m', minSalary: 4000, maxSalary: 6000, currency: 'EUR', period: 'month', source: 'Flying Fish Online' },
  { position: 'Chief Stewardess', category: 'Interior', yachtSize: '60-80m', minSalary: 6000, maxSalary: 7000, currency: 'EUR', period: 'month', source: 'Flying Fish Online' },
  { position: 'Chief Stewardess', category: 'Interior', yachtSize: '80m+', minSalary: 7000, maxSalary: 12000, currency: 'EUR', period: 'month', source: 'Flying Fish Online' },
  
  { position: 'Stewardess', category: 'Interior', yachtSize: '20-40m', minSalary: 2800, maxSalary: 3000, currency: 'EUR', period: 'month', source: 'Flying Fish Online' },
  { position: 'Stewardess', category: 'Interior', yachtSize: '40-60m', minSalary: 2800, maxSalary: 3500, currency: 'EUR', period: 'month', source: 'Flying Fish Online' },
  { position: 'Stewardess', category: 'Interior', yachtSize: '60-80m', minSalary: 3500, maxSalary: 4500, currency: 'EUR', period: 'month', source: 'Flying Fish Online' },
  { position: 'Stewardess', category: 'Interior', yachtSize: '80m+', minSalary: 4500, maxSalary: 6000, currency: 'EUR', period: 'month', source: 'Flying Fish Online' },
  
  { position: 'Junior Stewardess', category: 'Interior', yachtSize: '20-40m', minSalary: 2000, maxSalary: 3000, currency: 'EUR', period: 'month', source: 'Flying Fish Online' },
  { position: 'Junior Stewardess', category: 'Interior', yachtSize: '40m+', minSalary: 3000, maxSalary: 3500, currency: 'EUR', period: 'month', source: 'Flying Fish Online' },
  
  // Culinary
  { position: 'Head Chef', category: 'Culinary', yachtSize: '20-40m', minSalary: 3000, maxSalary: 4500, currency: 'EUR', period: 'month', source: 'Flying Fish Online' },
  { position: 'Head Chef', category: 'Culinary', yachtSize: '40-60m', minSalary: 4000, maxSalary: 7000, currency: 'EUR', period: 'month', source: 'Flying Fish Online' },
  { position: 'Head Chef', category: 'Culinary', yachtSize: '60-80m', minSalary: 6000, maxSalary: 7500, currency: 'EUR', period: 'month', source: 'Flying Fish Online' },
  { position: 'Head Chef', category: 'Culinary', yachtSize: '80m+', minSalary: 7500, maxSalary: 14000, currency: 'EUR', period: 'month', source: 'Flying Fish Online' },
  
  // Lighthouse Careers Data
  { position: 'Captain', category: 'Deck', yachtSize: '30-40m', minSalary: 7500, maxSalary: 12000, currency: 'EUR', period: 'month', source: 'Lighthouse Careers' },
  { position: 'Captain', category: 'Deck', yachtSize: '40-50m', minSalary: 9000, maxSalary: 14000, currency: 'EUR', period: 'month', source: 'Lighthouse Careers' },
  { position: 'Captain', category: 'Deck', yachtSize: '50-60m', minSalary: 12000, maxSalary: 18000, currency: 'EUR', period: 'month', source: 'Lighthouse Careers' },
  { position: 'Captain', category: 'Deck', yachtSize: '60-80m', minSalary: 14000, maxSalary: 20000, currency: 'EUR', period: 'month', source: 'Lighthouse Careers' },
  { position: 'Captain', category: 'Deck', yachtSize: '80-100m', minSalary: 16000, maxSalary: 24000, currency: 'EUR', period: 'month', source: 'Lighthouse Careers' },
  { position: 'Captain', category: 'Deck', yachtSize: '100m+', minSalary: 20000, maxSalary: 30000, currency: 'EUR', period: 'month', source: 'Lighthouse Careers' },
  
  { position: 'Chief Officer / First Mate', category: 'Deck', yachtSize: '30-40m', minSalary: 4200, maxSalary: 6500, currency: 'EUR', period: 'month', source: 'Lighthouse Careers' },
  { position: 'Chief Officer / First Mate', category: 'Deck', yachtSize: '40-50m', minSalary: 5000, maxSalary: 7500, currency: 'EUR', period: 'month', source: 'Lighthouse Careers' },
  { position: 'Chief Officer / First Mate', category: 'Deck', yachtSize: '50-60m', minSalary: 6000, maxSalary: 9000, currency: 'EUR', period: 'month', source: 'Lighthouse Careers' },
  { position: 'Chief Officer / First Mate', category: 'Deck', yachtSize: '60-80m', minSalary: 7000, maxSalary: 10000, currency: 'EUR', period: 'month', source: 'Lighthouse Careers' },
  { position: 'Chief Officer / First Mate', category: 'Deck', yachtSize: '80-100m', minSalary: 8000, maxSalary: 12000, currency: 'EUR', period: 'month', source: 'Lighthouse Careers' },
  { position: 'Chief Officer / First Mate', category: 'Deck', yachtSize: '100m+', minSalary: 10000, maxSalary: 14000, currency: 'EUR', period: 'month', source: 'Lighthouse Careers' },
  
  { position: 'Chief Engineer', category: 'Engineering', yachtSize: '30-40m', minSalary: 5500, maxSalary: 8000, currency: 'EUR', period: 'month', source: 'Lighthouse Careers' },
  { position: 'Chief Engineer', category: 'Engineering', yachtSize: '40-50m', minSalary: 6000, maxSalary: 9500, currency: 'EUR', period: 'month', source: 'Lighthouse Careers' },
  { position: 'Chief Engineer', category: 'Engineering', yachtSize: '50-70m', minSalary: 7000, maxSalary: 11000, currency: 'EUR', period: 'month', source: 'Lighthouse Careers' },
  { position: 'Chief Engineer', category: 'Engineering', yachtSize: '70-80m', minSalary: 8000, maxSalary: 12000, currency: 'EUR', period: 'month', source: 'Lighthouse Careers' },
  { position: 'Chief Engineer', category: 'Engineering', yachtSize: '80-100m', minSalary: 9000, maxSalary: 14000, currency: 'EUR', period: 'month', source: 'Lighthouse Careers' },
  { position: 'Chief Engineer', category: 'Engineering', yachtSize: '100m+', minSalary: 10000, maxSalary: 16000, currency: 'EUR', period: 'month', source: 'Lighthouse Careers' },
  
  { position: 'Chief Stewardess', category: 'Interior', yachtSize: '30-40m', minSalary: 3800, maxSalary: 5500, currency: 'EUR', period: 'month', source: 'Lighthouse Careers' },
  { position: 'Chief Stewardess', category: 'Interior', yachtSize: '40-50m', minSalary: 4500, maxSalary: 6500, currency: 'EUR', period: 'month', source: 'Lighthouse Careers' },
  { position: 'Chief Stewardess', category: 'Interior', yachtSize: '50-70m', minSalary: 5500, maxSalary: 8000, currency: 'EUR', period: 'month', source: 'Lighthouse Careers' },
  { position: 'Chief Stewardess', category: 'Interior', yachtSize: '70-80m', minSalary: 6500, maxSalary: 9500, currency: 'EUR', period: 'month', source: 'Lighthouse Careers' },
  { position: 'Chief Stewardess', category: 'Interior', yachtSize: '80-100m', minSalary: 7000, maxSalary: 10500, currency: 'EUR', period: 'month', source: 'Lighthouse Careers' },
  { position: 'Chief Stewardess', category: 'Interior', yachtSize: '100m+', minSalary: 8000, maxSalary: 12000, currency: 'EUR', period: 'month', source: 'Lighthouse Careers' },
  
  { position: 'Head Chef', category: 'Culinary', yachtSize: '30-40m', minSalary: 4500, maxSalary: 6500, currency: 'EUR', period: 'month', source: 'Lighthouse Careers' },
  { position: 'Head Chef', category: 'Culinary', yachtSize: '40-50m', minSalary: 6000, maxSalary: 7500, currency: 'EUR', period: 'month', source: 'Lighthouse Careers' },
  { position: 'Head Chef', category: 'Culinary', yachtSize: '50-70m', minSalary: 7500, maxSalary: 10000, currency: 'EUR', period: 'month', source: 'Lighthouse Careers' },
  { position: 'Head Chef', category: 'Culinary', yachtSize: '70-80m', minSalary: 8500, maxSalary: 11500, currency: 'EUR', period: 'month', source: 'Lighthouse Careers' },
  { position: 'Head Chef', category: 'Culinary', yachtSize: '80-100m', minSalary: 9000, maxSalary: 12000, currency: 'EUR', period: 'month', source: 'Lighthouse Careers' },
  { position: 'Head Chef', category: 'Culinary', yachtSize: '100m+', minSalary: 10000, maxSalary: 14000, currency: 'EUR', period: 'month', source: 'Lighthouse Careers' },
];

export function getUniquePositions(): string[] {
  return [...new Set(salaryData.map(d => d.position))];
}

export function getUniqueYachtSizes(): string[] {
  return [...new Set(salaryData.map(d => d.yachtSize))];
}

export function getSalaryForPositionAndSize(position: string, yachtSize: string): SalaryRange[] {
  return salaryData.filter(d => d.position === position && d.yachtSize === yachtSize);
}

export function getAverageSalary(position: string, yachtSize: string): { min: number; max: number; avg: number } {
  const matches = getSalaryForPositionAndSize(position, yachtSize);
  if (matches.length === 0) return { min: 0, max: 0, avg: 0 };
  
  const minAvg = matches.reduce((sum, m) => sum + m.minSalary, 0) / matches.length;
  const maxAvg = matches.reduce((sum, m) => sum + m.maxSalary, 0) / matches.length;
  
  return {
    min: Math.round(minAvg),
    max: Math.round(maxAvg),
    avg: Math.round((minAvg + maxAvg) / 2),
  };
}
