export const ESTIMATOR_DEPARTMENTS = ['Deck', 'Engineering', 'Interior', 'Galley'] as const;
export const ESTIMATOR_YACHT_SIZES = [
  'Below 27m',
  '27-30m',
  '31-40m',
  '41-50m',
  '51-60m',
  '61-70m',
  '70-90m',
  '90-100m',
  '100m+',
] as const;
export const ESTIMATOR_YACHT_TYPES = ['Private', 'Charter'] as const;
export const ESTIMATOR_CHARTER_LOADS = [
  'Light (up to 6 weeks per season)',
  'Medium (6-10 weeks per season)',
  'Heavy (10-12 weeks)',
  'Hectic Charter Pig (12-16 weeks)',
] as const;
export const ESTIMATOR_TIP_RATES = [0.1, 0.15, 0.2, 0.25] as const;

export type EstimatorDepartment = (typeof ESTIMATOR_DEPARTMENTS)[number];
export type EstimatorYachtSize = (typeof ESTIMATOR_YACHT_SIZES)[number];
export type EstimatorYachtType = (typeof ESTIMATOR_YACHT_TYPES)[number];
export type EstimatorCharterLoad = (typeof ESTIMATOR_CHARTER_LOADS)[number];
export type EstimatorTipRate = (typeof ESTIMATOR_TIP_RATES)[number];

type MoneyRange = {
  low: number;
  high: number;
};

type CrewRange = {
  low: number;
  high: number;
};

type EstimatorSalaryRow = {
  department: EstimatorDepartment;
  position: string;
  bands: Partial<Record<EstimatorYachtSize, MoneyRange>>;
};

export type CompensationEstimate = {
  department: EstimatorDepartment;
  position: string;
  yachtSize: EstimatorYachtSize;
  yachtType: EstimatorYachtType;
  charterLoad: EstimatorCharterLoad;
  tipRate: EstimatorTipRate;
  dualSeason: boolean;
  monthlySalary: MoneyRange;
  annualBaseSalary: MoneyRange;
  weeklyTips: MoneyRange;
  seasonalTips: MoneyRange;
  annualTips: MoneyRange;
  annualTotal: MoneyRange;
  charterPriceRange: MoneyRange | null;
  crewCountRange: CrewRange | null;
  charterWeeksRange: CrewRange | null;
};

const SALARY_MATRIX: EstimatorSalaryRow[] = [
  {
    department: 'Deck',
    position: 'Junior Deckhand',
    bands: Object.fromEntries(
      ESTIMATOR_YACHT_SIZES.map((size) => [size, { low: 2800, high: 3500 }])
    ) as Record<EstimatorYachtSize, MoneyRange>,
  },
  {
    department: 'Deck',
    position: 'Deckhand',
    bands: {
      'Below 27m': { low: 3000, high: 3500 },
      '27-30m': { low: 3000, high: 3500 },
      '31-40m': { low: 3000, high: 3500 },
      '41-50m': { low: 3000, high: 3500 },
      '51-60m': { low: 3000, high: 4000 },
      '61-70m': { low: 3000, high: 4000 },
      '70-90m': { low: 3000, high: 4000 },
      '90-100m': { low: 3000, high: 4000 },
      '100m+': { low: 3000, high: 4000 },
    },
  },
  {
    department: 'Deck',
    position: 'Senior Deckhand',
    bands: {
      '51-60m': { low: 3250, high: 4000 },
      '61-70m': { low: 3250, high: 4000 },
      '70-90m': { low: 3250, high: 4000 },
      '90-100m': { low: 3250, high: 4000 },
      '100m+': { low: 3250, high: 4000 },
    },
  },
  {
    department: 'Deck',
    position: 'Lead Deckhand',
    bands: {
      '61-70m': { low: 3500, high: 4000 },
      '70-90m': { low: 3500, high: 4000 },
      '90-100m': { low: 3500, high: 4000 },
      '100m+': { low: 3500, high: 4000 },
    },
  },
  {
    department: 'Deck',
    position: 'Bosun',
    bands: {
      '41-50m': { low: 3800, high: 5000 },
      '51-60m': { low: 4000, high: 5500 },
      '61-70m': { low: 4000, high: 6000 },
      '70-90m': { low: 4000, high: 6000 },
      '90-100m': { low: 4000, high: 6000 },
      '100m+': { low: 4000, high: 6000 },
    },
  },
  {
    department: 'Deck',
    position: 'Second Officer',
    bands: {
      '51-60m': { low: 5500, high: 8000 },
      '61-70m': { low: 6000, high: 9000 },
      '70-90m': { low: 6000, high: 9000 },
      '90-100m': { low: 6000, high: 9000 },
      '100m+': { low: 6000, high: 9000 },
    },
  },
  {
    department: 'Deck',
    position: 'First Officer / Mate',
    bands: {
      '31-40m': { low: 4500, high: 7000 },
      '41-50m': { low: 5500, high: 8000 },
      '51-60m': { low: 6000, high: 10000 },
      '61-70m': { low: 7000, high: 12000 },
      '70-90m': { low: 7000, high: 12000 },
      '90-100m': { low: 7000, high: 12000 },
      '100m+': { low: 7000, high: 12000 },
    },
  },
  {
    department: 'Deck',
    position: 'Captain',
    bands: {
      'Below 27m': { low: 6000, high: 12000 },
      '27-30m': { low: 8000, high: 15000 },
      '31-40m': { low: 8000, high: 15000 },
      '41-50m': { low: 10000, high: 16000 },
      '51-60m': { low: 10000, high: 20000 },
      '61-70m': { low: 12000, high: 20000 },
      '70-90m': { low: 15000, high: 25000 },
      '90-100m': { low: 15000, high: 30000 },
      '100m+': { low: 15000, high: 30000 },
    },
  },
  {
    department: 'Deck',
    position: 'Deck / Engineer',
    bands: {
      '31-40m': { low: 3000, high: 4000 },
      '41-50m': { low: 3000, high: 4000 },
      '51-60m': { low: 3000, high: 4000 },
      '61-70m': { low: 3000, high: 4000 },
    },
  },
  {
    department: 'Engineering',
    position: 'Junior Engineer',
    bands: {
      '70-90m': { low: 2800, high: 4000 },
      '90-100m': { low: 2800, high: 4000 },
      '100m+': { low: 2800, high: 4000 },
    },
  },
  {
    department: 'Engineering',
    position: 'Third Engineer',
    bands: {
      '61-70m': { low: 3500, high: 5000 },
      '70-90m': { low: 3500, high: 6000 },
      '90-100m': { low: 4500, high: 6500 },
      '100m+': { low: 4500, high: 6000 },
    },
  },
  {
    department: 'Engineering',
    position: 'Second Engineer',
    bands: {
      '51-60m': { low: 4500, high: 6000 },
      '61-70m': { low: 5000, high: 7000 },
      '70-90m': { low: 6500, high: 8500 },
      '90-100m': { low: 6500, high: 9000 },
      '100m+': { low: 6500, high: 10000 },
    },
  },
  {
    department: 'Engineering',
    position: 'ETO / AV-IT',
    bands: {
      '70-90m': { low: 6000, high: 8000 },
      '90-100m': { low: 6500, high: 8500 },
      '100m+': { low: 7000, high: 9000 },
    },
  },
  {
    department: 'Engineering',
    position: 'Engineer',
    bands: {
      '31-40m': { low: 5000, high: 8000 },
    },
  },
  {
    department: 'Engineering',
    position: 'Chief Engineer',
    bands: {
      '41-50m': { low: 6500, high: 10000 },
      '51-60m': { low: 8000, high: 10000 },
      '61-70m': { low: 8500, high: 11000 },
      '70-90m': { low: 10000, high: 15000 },
      '90-100m': { low: 10000, high: 18000 },
      '100m+': { low: 12000, high: 20000 },
    },
  },
  {
    department: 'Interior',
    position: 'Deck / Stew',
    bands: {
      'Below 27m': { low: 3000, high: 3750 },
      '27-30m': { low: 3000, high: 3750 },
      '31-40m': { low: 3000, high: 3750 },
      '41-50m': { low: 3000, high: 3750 },
      '51-60m': { low: 3000, high: 3750 },
    },
  },
  {
    department: 'Interior',
    position: 'Junior Stew',
    bands: Object.fromEntries(
      ESTIMATOR_YACHT_SIZES.map((size) => [size, { low: 2800, high: 3500 }])
    ) as Record<EstimatorYachtSize, MoneyRange>,
  },
  {
    department: 'Interior',
    position: 'Stew',
    bands: {
      'Below 27m': { low: 2800, high: 4000 },
      '27-30m': { low: 2800, high: 4000 },
      '31-40m': { low: 3000, high: 3500 },
      '51-60m': { low: 3000, high: 3500 },
      '61-70m': { low: 3000, high: 3500 },
      '70-90m': { low: 3000, high: 3500 },
      '90-100m': { low: 3000, high: 3500 },
      '100m+': { low: 3000, high: 3500 },
    },
  },
  {
    department: 'Interior',
    position: 'Third Stew',
    bands: {
      '41-50m': { low: 3000, high: 3500 },
      '51-60m': { low: 3000, high: 3500 },
      '61-70m': { low: 3200, high: 4000 },
      '70-90m': { low: 3000, high: 4000 },
      '90-100m': { low: 3500, high: 5000 },
      '100m+': { low: 3000, high: 4000 },
    },
  },
  {
    department: 'Interior',
    position: 'Second Stew / HOH / HOS',
    bands: {
      '31-40m': { low: 3000, high: 3500 },
      '41-50m': { low: 3200, high: 4000 },
      '51-60m': { low: 3500, high: 5000 },
      '61-70m': { low: 4500, high: 6000 },
      '70-90m': { low: 4500, high: 7000 },
      '90-100m': { low: 4500, high: 7000 },
      '100m+': { low: 4500, high: 7000 },
    },
  },
  {
    department: 'Interior',
    position: 'Chief Stew',
    bands: {
      '31-40m': { low: 3500, high: 5000 },
      '41-50m': { low: 4500, high: 7000 },
      '51-60m': { low: 5500, high: 8500 },
      '61-70m': { low: 6000, high: 9000 },
      '70-90m': { low: 6500, high: 9000 },
      '90-100m': { low: 7000, high: 10000 },
      '100m+': { low: 7000, high: 10000 },
    },
  },
  {
    department: 'Interior',
    position: 'Purser',
    bands: {
      '61-70m': { low: 5500, high: 8000 },
      '70-90m': { low: 7000, high: 9000 },
      '90-100m': { low: 7000, high: 9500 },
      '100m+': { low: 6500, high: 9500 },
    },
  },
  {
    department: 'Galley',
    position: 'Stew Cook',
    bands: {
      '27-30m': { low: 3000, high: 4500 },
      '31-40m': { low: 3000, high: 4500 },
      '41-50m': { low: 3000, high: 4500 },
    },
  },
  {
    department: 'Galley',
    position: 'Sous Chef',
    bands: {
      '51-60m': { low: 5000, high: 7000 },
      '61-70m': { low: 4500, high: 7000 },
      '70-90m': { low: 4500, high: 8000 },
      '90-100m': { low: 5000, high: 8000 },
      '100m+': { low: 5500, high: 8000 },
    },
  },
  {
    department: 'Galley',
    position: 'Head Chef',
    bands: {
      '31-40m': { low: 4500, high: 9000 },
      '41-50m': { low: 6000, high: 9000 },
      '51-60m': { low: 6500, high: 10000 },
      '61-70m': { low: 7000, high: 10000 },
      '70-90m': { low: 8000, high: 12000 },
      '90-100m': { low: 9000, high: 12000 },
      '100m+': { low: 8000, high: 15000 },
    },
  },
];

const SIZE_MODEL: Record<
  EstimatorYachtSize,
  {
    charterPrice: MoneyRange;
    crewCount: CrewRange;
  }
> = {
  'Below 27m': {
    charterPrice: { low: 30000, high: 60000 },
    crewCount: { low: 2, high: 3 },
  },
  '27-30m': {
    charterPrice: { low: 40000, high: 80000 },
    crewCount: { low: 5, high: 5 },
  },
  '31-40m': {
    charterPrice: { low: 90000, high: 160000 },
    crewCount: { low: 6, high: 7 },
  },
  '41-50m': {
    charterPrice: { low: 150000, high: 350000 },
    crewCount: { low: 7, high: 9 },
  },
  '51-60m': {
    charterPrice: { low: 200000, high: 450000 },
    crewCount: { low: 10, high: 12 },
  },
  '61-70m': {
    charterPrice: { low: 300000, high: 600000 },
    crewCount: { low: 13, high: 17 },
  },
  '70-90m': {
    charterPrice: { low: 500000, high: 1100000 },
    crewCount: { low: 22, high: 30 },
  },
  '90-100m': {
    charterPrice: { low: 800000, high: 1500000 },
    crewCount: { low: 30, high: 40 },
  },
  '100m+': {
    charterPrice: { low: 2000000, high: 4000000 },
    crewCount: { low: 45, high: 50 },
  },
};

const CHARTER_WEEKS: Record<EstimatorCharterLoad, CrewRange> = {
  'Light (up to 6 weeks per season)': { low: 3, high: 6 },
  'Medium (6-10 weeks per season)': { low: 6, high: 10 },
  'Heavy (10-12 weeks)': { low: 10, high: 12 },
  'Hectic Charter Pig (12-16 weeks)': { low: 12, high: 16 },
};

function emptyRange(): MoneyRange {
  return { low: 0, high: 0 };
}

export function getEstimatorAvailableSizes(department: EstimatorDepartment): EstimatorYachtSize[] {
  return ESTIMATOR_YACHT_SIZES.filter((size) =>
    SALARY_MATRIX.some((row) => row.department === department && row.bands[size])
  );
}

export function getEstimatorPositions(
  department: EstimatorDepartment,
  yachtSize: EstimatorYachtSize
): string[] {
  return SALARY_MATRIX.filter((row) => row.department === department && row.bands[yachtSize])
    .map((row) => row.position)
    .sort((left, right) => left.localeCompare(right));
}

function getSalaryBand(
  department: EstimatorDepartment,
  position: string,
  yachtSize: EstimatorYachtSize
): MoneyRange | null {
  return (
    SALARY_MATRIX.find((row) => row.department === department && row.position === position)?.bands[
      yachtSize
    ] ?? null
  );
}

export function calculateCompensationEstimate(input: {
  department: EstimatorDepartment;
  position: string;
  yachtSize: EstimatorYachtSize;
  yachtType: EstimatorYachtType;
  charterLoad: EstimatorCharterLoad;
  tipRate: EstimatorTipRate;
  dualSeason: boolean;
}): CompensationEstimate | null {
  const monthlySalary = getSalaryBand(input.department, input.position, input.yachtSize);

  if (!monthlySalary) {
    return null;
  }

  const annualBaseSalary = {
    low: monthlySalary.low * 12,
    high: monthlySalary.high * 12,
  };

  const sizeModel = SIZE_MODEL[input.yachtSize];
  const charterWeeks = CHARTER_WEEKS[input.charterLoad];
  const charterEnabled = input.yachtType === 'Charter';

  const weeklyTips = charterEnabled
    ? {
        low: (sizeModel.charterPrice.low * input.tipRate) / sizeModel.crewCount.high,
        high: (sizeModel.charterPrice.high * input.tipRate) / sizeModel.crewCount.low,
      }
    : emptyRange();

  const seasonalTips = charterEnabled
    ? {
        low: weeklyTips.low * charterWeeks.low,
        high: weeklyTips.high * charterWeeks.high,
      }
    : emptyRange();

  const annualTips = charterEnabled
    ? {
        low: seasonalTips.low * (input.dualSeason ? 2 : 1),
        high: seasonalTips.high * (input.dualSeason ? 2 : 1),
      }
    : emptyRange();

  const annualTotal = {
    low: annualBaseSalary.low + annualTips.low,
    high: annualBaseSalary.high + annualTips.high,
  };

  return {
    department: input.department,
    position: input.position,
    yachtSize: input.yachtSize,
    yachtType: input.yachtType,
    charterLoad: input.charterLoad,
    tipRate: input.tipRate,
    dualSeason: input.dualSeason,
    monthlySalary,
    annualBaseSalary,
    weeklyTips,
    seasonalTips,
    annualTips,
    annualTotal,
    charterPriceRange: charterEnabled ? sizeModel.charterPrice : null,
    crewCountRange: charterEnabled ? sizeModel.crewCount : null,
    charterWeeksRange: charterEnabled ? charterWeeks : null,
  };
}
