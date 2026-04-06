'use client';

import { useEffect, useMemo, useState } from 'react';
import type { LucideIcon } from 'lucide-react';
import {
  Anchor,
  ArrowRightLeft,
  Calculator,
  ChefHat,
  Database,
  DollarSign,
  Loader2,
  Radar,
  Sparkles,
  TableProperties,
  Wrench,
} from 'lucide-react';

import {
  compareYachtSizes,
  type SalaryDepartment,
  type SalaryRecord,
  getBundledSalaryData,
  getComparisonYachtBands,
  getCategoryForPosition,
  getUniquePositions,
  getUniqueComparisonYachtBands,
  getUniqueSources,
  loadSalaryData,
} from '@/lib/supabase';
import {
  ESTIMATOR_CHARTER_LOADS,
  ESTIMATOR_DEPARTMENTS,
  ESTIMATOR_TIP_RATES,
  ESTIMATOR_YACHT_TYPES,
  type CompensationEstimate,
  type EstimatorCharterLoad,
  type EstimatorDepartment,
  type EstimatorTipRate,
  type EstimatorYachtSize,
  type EstimatorYachtType,
  calculateCompensationEstimate,
  getEstimatorAvailableSizes,
  getEstimatorPositions,
} from '@/lib/compensation-estimator';

type ViewMode = 'selector' | 'table' | 'estimate';
type DisplayCurrency = 'EUR' | 'USD';

type SourceAccent = {
  card: string;
  pill: string;
  line: string;
  value: string;
};

type ComparisonGuideRecord = SalaryRecord & {
  rawBands: string[];
  matchCount: number;
};

const DISPLAY_EXCHANGE_RATES: Record<DisplayCurrency, Record<DisplayCurrency, number>> = {
  EUR: {
    EUR: 1,
    USD: 1.1,
  },
  USD: {
    EUR: 1 / 1.1,
    USD: 1,
  },
};

const CATEGORY_META: Record<
  SalaryDepartment,
  {
    icon: LucideIcon;
    badge: string;
    panel: string;
    iconWrap: string;
    iconColor: string;
    statRing: string;
  }
> = {
  Deck: {
    icon: Anchor,
    badge: 'border-amber-400/20 bg-amber-500/10 text-amber-100',
    panel: 'border-amber-500/25 bg-gradient-to-br from-amber-500/10 via-white/[0.03] to-transparent',
    iconWrap: 'border-amber-400/20 bg-amber-500/[0.12]',
    iconColor: 'text-amber-200',
    statRing: 'border-amber-400/20',
  },
  Engineering: {
    icon: Wrench,
    badge: 'border-orange-400/20 bg-orange-500/10 text-orange-100',
    panel: 'border-orange-500/25 bg-gradient-to-br from-orange-500/10 via-white/[0.03] to-transparent',
    iconWrap: 'border-orange-400/20 bg-orange-500/[0.12]',
    iconColor: 'text-orange-200',
    statRing: 'border-orange-400/20',
  },
  Interior: {
    icon: Sparkles,
    badge: 'border-rose-400/20 bg-rose-500/10 text-rose-100',
    panel: 'border-rose-500/25 bg-gradient-to-br from-rose-500/10 via-white/[0.03] to-transparent',
    iconWrap: 'border-rose-400/20 bg-rose-500/[0.12]',
    iconColor: 'text-rose-200',
    statRing: 'border-rose-400/20',
  },
  Culinary: {
    icon: ChefHat,
    badge: 'border-sky-400/20 bg-sky-500/10 text-sky-100',
    panel: 'border-sky-500/25 bg-gradient-to-br from-sky-500/10 via-white/[0.03] to-transparent',
    iconWrap: 'border-sky-400/20 bg-sky-500/[0.12]',
    iconColor: 'text-sky-200',
    statRing: 'border-sky-400/20',
  },
};

const SOURCE_ACCENTS: SourceAccent[] = [
  {
    card: 'border-amber-500/20 bg-gradient-to-br from-amber-500/10 via-white/[0.03] to-transparent',
    pill: 'border-amber-400/20 bg-amber-500/10 text-amber-100',
    line: 'from-amber-300 via-orange-400 to-transparent',
    value: 'text-amber-100',
  },
  {
    card: 'border-orange-500/20 bg-gradient-to-br from-orange-500/10 via-white/[0.03] to-transparent',
    pill: 'border-orange-400/20 bg-orange-500/10 text-orange-100',
    line: 'from-orange-300 via-orange-500 to-transparent',
    value: 'text-orange-100',
  },
  {
    card: 'border-cyan-500/20 bg-gradient-to-br from-cyan-500/10 via-white/[0.03] to-transparent',
    pill: 'border-cyan-400/20 bg-cyan-500/10 text-cyan-100',
    line: 'from-cyan-300 via-sky-400 to-transparent',
    value: 'text-cyan-100',
  },
  {
    card: 'border-indigo-500/20 bg-gradient-to-br from-indigo-500/10 via-white/[0.03] to-transparent',
    pill: 'border-indigo-400/20 bg-indigo-500/10 text-indigo-100',
    line: 'from-indigo-300 via-blue-400 to-transparent',
    value: 'text-indigo-100',
  },
  {
    card: 'border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 via-white/[0.03] to-transparent',
    pill: 'border-emerald-400/20 bg-emerald-500/10 text-emerald-100',
    line: 'from-emerald-300 via-teal-400 to-transparent',
    value: 'text-emerald-100',
  },
  {
    card: 'border-rose-500/20 bg-gradient-to-br from-rose-500/10 via-white/[0.03] to-transparent',
    pill: 'border-rose-400/20 bg-rose-500/10 text-rose-100',
    line: 'from-rose-300 via-pink-400 to-transparent',
    value: 'text-rose-100',
  },
];

const VIEW_MODE_META: Record<
  ViewMode,
  {
    buttonLabel: string;
    eyebrow: string;
    title: string;
    description: string;
  }
> = {
  selector: {
    buttonLabel: 'Benchmark',
    eyebrow: 'Published Benchmark',
    title: 'See the market first',
    description:
      'Start with the blended market benchmark from matching salary guides, standardized into cleaner comparison bands.',
  },
  table: {
    buttonLabel: 'Sources',
    eyebrow: 'Source Evidence',
    title: 'Inspect the source rows',
    description:
      'Move from the headline range to the exact guide rows, original yacht bands, and attributed source names underneath.',
  },
  estimate: {
    buttonLabel: 'Estimate',
    eyebrow: 'Tailored Estimate',
    title: 'Model a more personal package',
    description:
      "Apply yacht program assumptions from Hugo's original calculator to turn the market picture into a more tailored package range.",
  },
};

function BackgroundLayer() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-[#020617]">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(15,23,42,0.7),rgba(2,6,23,1)_65%)]" />
      <div className="absolute left-[-8%] top-[-12%] h-[28rem] w-[28rem] rounded-full bg-orange-500/[0.12] blur-[140px]" />
      <div className="absolute right-[-10%] top-[12%] h-[30rem] w-[30rem] rounded-full bg-amber-500/10 blur-[140px]" />
      <div className="absolute bottom-[-15%] left-[18%] h-[26rem] w-[26rem] rounded-full bg-cyan-500/[0.08] blur-[150px]" />
      <div className="hero-grid absolute inset-0 opacity-35 [mask-image:linear-gradient(180deg,rgba(255,255,255,0.55),transparent)]" />
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  helper,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  helper: string;
}) {
  return (
    <div className="glass-card rounded-3xl border border-white/10 p-5">
      <div className="flex items-center justify-between">
        <span className="text-sm text-slate-300">{label}</span>
        <span className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-orange-200">
          <Icon className="h-5 w-5" />
        </span>
      </div>
      <p className="mt-4 text-3xl font-semibold tracking-tight text-white">{value}</p>
      <p className="mt-2 text-sm text-slate-400">{helper}</p>
    </div>
  );
}

function formatMoney(value: number, currency = 'EUR'): string {
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(value);
  } catch {
    return `${currency} ${Math.round(value).toLocaleString()}`;
  }
}

function formatMoneyRange(range: { low: number; high: number }, currency = 'EUR'): string {
  return `${formatMoney(range.low, currency)} to ${formatMoney(range.high, currency)}`;
}

function getRangeMidpoint(range: { low: number; high: number }): number {
  return Math.round((range.low + range.high) / 2);
}

function convertMoneyRange(
  range: { low: number; high: number },
  fromCurrency: string,
  toCurrency: DisplayCurrency
): { low: number; high: number } {
  return {
    low: Math.round(convertMoney(range.low, fromCurrency, toCurrency)),
    high: Math.round(convertMoney(range.high, fromCurrency, toCurrency)),
  };
}

function convertMoney(value: number, fromCurrency: string, toCurrency: DisplayCurrency): number {
  if (fromCurrency !== 'EUR' && fromCurrency !== 'USD') {
    return value;
  }

  return value * DISPLAY_EXCHANGE_RATES[fromCurrency][toCurrency];
}

function getDisplayAverage(record: SalaryRecord, displayCurrency: DisplayCurrency): number {
  return Math.round(
    (convertMoney(record.min_salary, record.currency, displayCurrency) +
      convertMoney(record.max_salary, record.currency, displayCurrency)) /
      2
  );
}

function getDisplayStats(
  data: SalaryRecord[],
  displayCurrency: DisplayCurrency
): { min: number; max: number; avg: number; count: number } {
  if (data.length === 0) return { min: 0, max: 0, avg: 0, count: 0 };

  const minAverage =
    data.reduce((sum, record) => sum + convertMoney(record.min_salary, record.currency, displayCurrency), 0) /
    data.length;
  const maxAverage =
    data.reduce((sum, record) => sum + convertMoney(record.max_salary, record.currency, displayCurrency), 0) /
    data.length;

  return {
    min: Math.round(minAverage),
    max: Math.round(maxAverage),
    avg: Math.round((minAverage + maxAverage) / 2),
    count: data.length,
  };
}

export default function SalaryGuide() {
  const [salaryData, setSalaryData] = useState<SalaryRecord[]>(() => getBundledSalaryData());
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [displayCurrency, setDisplayCurrency] = useState<DisplayCurrency>('EUR');
  const [selectedPosition, setSelectedPosition] = useState('');
  const [selectedYachtSize, setSelectedYachtSize] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('selector');
  const [estimatorDepartment, setEstimatorDepartment] = useState<EstimatorDepartment>('Deck');
  const [estimatorYachtSize, setEstimatorYachtSize] = useState<EstimatorYachtSize>('31-40m');
  const [estimatorPosition, setEstimatorPosition] = useState('Junior Deckhand');
  const [estimatorYachtType, setEstimatorYachtType] = useState<EstimatorYachtType>('Charter');
  const [estimatorCharterLoad, setEstimatorCharterLoad] = useState<EstimatorCharterLoad>(
    'Heavy (10-12 weeks)'
  );
  const [estimatorTipRate, setEstimatorTipRate] = useState<EstimatorTipRate>(0.1);
  const [estimatorDualSeason, setEstimatorDualSeason] = useState(false);

  useEffect(() => {
    let isCancelled = false;

    async function loadBenchmarks() {
      const result = await loadSalaryData();

      if (isCancelled) {
        return;
      }

      setSalaryData(result.data);
      setLoadError(result.error);
      setLoading(false);
    }

    void loadBenchmarks();

    return () => {
      isCancelled = true;
    };
  }, []);

  const availablePositions = useMemo(() => getUniquePositions(salaryData), [salaryData]);
  const availableYachtSizes = useMemo(() => getUniqueComparisonYachtBands(salaryData), [salaryData]);
  const availableSources = useMemo(() => getUniqueSources(salaryData), [salaryData]);
  const estimatorAvailableSizes = useMemo(
    () => getEstimatorAvailableSizes(estimatorDepartment),
    [estimatorDepartment]
  );
  const estimatorAvailablePositions = useMemo(
    () => getEstimatorPositions(estimatorDepartment, estimatorYachtSize),
    [estimatorDepartment, estimatorYachtSize]
  );

  const sourceAccents = useMemo<Record<string, SourceAccent>>(
    () =>
      Object.fromEntries(
        availableSources.map((source, index) => [source, SOURCE_ACCENTS[index % SOURCE_ACCENTS.length]])
      ),
    [availableSources]
  );

  const sourceCounts = useMemo(
    () =>
      salaryData.reduce<Record<string, number>>((lookup, record) => {
        lookup[record.source] = (lookup[record.source] ?? 0) + 1;
        return lookup;
      }, {}),
    [salaryData]
  );

  const availableSizesForPosition = useMemo(() => {
    if (!selectedPosition) {
      return availableYachtSizes;
    }

    return getUniqueComparisonYachtBands(
      salaryData.filter((record) => record.position === selectedPosition)
    );
  }, [availableYachtSizes, salaryData, selectedPosition]);

  const comparisonData = useMemo(() => {
    if (!selectedPosition || !selectedYachtSize) {
      return [];
    }

    const matchingRows = salaryData.filter(
      (record) =>
        record.position === selectedPosition &&
        getComparisonYachtBands(record.yacht_size).includes(selectedYachtSize)
    );

    const groupedBySource = new Map<string, ComparisonGuideRecord>();

    for (const record of matchingRows) {
      const existing = groupedBySource.get(record.source);

      if (!existing) {
        groupedBySource.set(record.source, {
          ...record,
          yacht_size: selectedYachtSize,
          rawBands: [record.yacht_size],
          matchCount: 1,
        });
        continue;
      }

      existing.min_salary = Math.round(
        (existing.min_salary * existing.matchCount + record.min_salary) / (existing.matchCount + 1)
      );
      existing.max_salary = Math.round(
        (existing.max_salary * existing.matchCount + record.max_salary) / (existing.matchCount + 1)
      );
      existing.matchCount += 1;

      if (!existing.rawBands.includes(record.yacht_size)) {
        existing.rawBands.push(record.yacht_size);
        existing.rawBands.sort(compareYachtSizes);
      }
    }

    return [...groupedBySource.values()].sort(
      (left, right) => getDisplayAverage(right, displayCurrency) - getDisplayAverage(left, displayCurrency)
    );
  }, [displayCurrency, salaryData, selectedPosition, selectedYachtSize]);

  const tableData = useMemo(
    () =>
      salaryData.filter((record) => {
        const positionMatches = selectedPosition ? record.position === selectedPosition : true;
        const sizeMatches = selectedYachtSize
          ? getComparisonYachtBands(record.yacht_size).includes(selectedYachtSize)
          : true;
        return positionMatches && sizeMatches;
      }),
    [salaryData, selectedPosition, selectedYachtSize]
  );

  const averageSalary = useMemo(
    () => getDisplayStats(comparisonData, displayCurrency),
    [comparisonData, displayCurrency]
  );
  const selectedCategory = useMemo(
    () => getCategoryForPosition(salaryData, selectedPosition),
    [salaryData, selectedPosition]
  );
  const categoryMeta = CATEGORY_META[selectedCategory];
  const CategoryIcon = categoryMeta.icon;
  const highestSource = comparisonData[0] ?? null;
  const lowestSource = comparisonData[comparisonData.length - 1] ?? null;
  const hasActiveFilters = Boolean(selectedPosition || selectedYachtSize);
  const spotlightPositions = useMemo(() => availablePositions.slice(0, 8), [availablePositions]);
  const estimatorResult = useMemo<CompensationEstimate | null>(
    () =>
      calculateCompensationEstimate({
        department: estimatorDepartment,
        position: estimatorPosition,
        yachtSize: estimatorYachtSize,
        yachtType: estimatorYachtType,
        charterLoad: estimatorCharterLoad,
        tipRate: estimatorTipRate,
        dualSeason: estimatorDualSeason,
      }),
    [
      estimatorCharterLoad,
      estimatorDepartment,
      estimatorDualSeason,
      estimatorPosition,
      estimatorTipRate,
      estimatorYachtSize,
      estimatorYachtType,
    ]
  );
  const estimatorIsCharter = estimatorYachtType === 'Charter';
  const activeViewMeta = VIEW_MODE_META[viewMode];
  const estimatorDisplayData = useMemo(() => {
    if (!estimatorResult) {
      return null;
    }

    const monthlySalary = convertMoneyRange(estimatorResult.monthlySalary, 'EUR', displayCurrency);
    const annualBaseSalary = convertMoneyRange(estimatorResult.annualBaseSalary, 'EUR', displayCurrency);
    const weeklyTips = convertMoneyRange(estimatorResult.weeklyTips, 'EUR', displayCurrency);
    const seasonalTips = convertMoneyRange(estimatorResult.seasonalTips, 'EUR', displayCurrency);
    const annualTotal = convertMoneyRange(estimatorResult.annualTotal, 'EUR', displayCurrency);

    return {
      monthlySalary,
      annualBaseSalary,
      weeklyTips,
      seasonalTips,
      annualTotal,
      charterPriceRange: estimatorResult.charterPriceRange
        ? convertMoneyRange(estimatorResult.charterPriceRange, 'EUR', displayCurrency)
        : null,
      monthlyMidpoint: getRangeMidpoint(monthlySalary),
      annualMidpoint: getRangeMidpoint(annualTotal),
    };
  }, [displayCurrency, estimatorResult]);

  const handlePositionChange = (nextPosition: string) => {
    setSelectedPosition(nextPosition);

    if (!nextPosition || !selectedYachtSize) {
      return;
    }

    const nextSizes = getUniqueComparisonYachtBands(
      salaryData.filter((record) => record.position === nextPosition)
    );

    if (!nextSizes.includes(selectedYachtSize)) {
      setSelectedYachtSize('');
    }
  };

  const handleEstimatorDepartmentChange = (nextDepartment: EstimatorDepartment) => {
    const nextSizes = getEstimatorAvailableSizes(nextDepartment);
    const nextSize = nextSizes.includes(estimatorYachtSize)
      ? estimatorYachtSize
      : (nextSizes[0] ?? '31-40m');
    const nextPositions = getEstimatorPositions(nextDepartment, nextSize);

    setEstimatorDepartment(nextDepartment);
    setEstimatorYachtSize(nextSize);

    if (!nextPositions.includes(estimatorPosition)) {
      setEstimatorPosition(nextPositions[0] ?? '');
    }
  };

  const handleEstimatorYachtSizeChange = (nextSize: EstimatorYachtSize) => {
    const nextPositions = getEstimatorPositions(estimatorDepartment, nextSize);

    setEstimatorYachtSize(nextSize);

    if (!nextPositions.includes(estimatorPosition)) {
      setEstimatorPosition(nextPositions[0] ?? '');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen text-white">
        <BackgroundLayer />
        <div className="relative flex min-h-screen items-center justify-center px-4">
          <div className="glass-card flex items-center gap-4 rounded-3xl px-6 py-5">
            <Loader2 className="h-7 w-7 animate-spin text-orange-300" />
            <div>
              <p className="text-lg font-medium">Loading salary benchmarks</p>
              <p className="text-sm text-slate-300">Syncing live yacht salary data.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white">
      <BackgroundLayer />

      <main className="relative mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
        <section className="glass-card relative overflow-hidden rounded-[2rem] p-6 sm:p-8 lg:p-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(249,115,22,0.16),transparent_35%),linear-gradient(135deg,rgba(255,255,255,0.06),transparent_60%)]" />
          <div className="absolute right-0 top-0 h-48 w-48 rounded-full bg-orange-500/10 blur-[120px]" />
          <div className="relative flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-slate-200">
                <Database className="h-3.5 w-3.5 text-orange-200" />
                Superyacht Sunday School Intelligence
              </span>
              <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
                Yacht Crew Salary Guide 2026
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
                One clear salary tool for three different questions: what the published market says,
                where the benchmark comes from, and what a more tailored next-package range might
                look like once yacht-program assumptions are applied.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-slate-200">
                  <Radar className="h-4 w-4 text-orange-200" />
                  Standardized for comparison
                </span>
                <div className="inline-flex items-center rounded-full border border-white/10 bg-white/5 p-1 text-sm text-slate-200">
                  <button
                    onClick={() => setDisplayCurrency('EUR')}
                    className={`rounded-full px-3 py-1.5 transition ${
                      displayCurrency === 'EUR'
                        ? 'bg-orange-500/20 text-white'
                        : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    EUR
                  </button>
                  <button
                    onClick={() => setDisplayCurrency('USD')}
                    className={`rounded-full px-3 py-1.5 transition ${
                      displayCurrency === 'USD'
                        ? 'bg-orange-500/20 text-white'
                        : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    USD
                  </button>
                </div>
              </div>
              <p className="mt-3 text-xs text-slate-400">
                Currency toggle is for display only and uses a fixed comparison rate of 1 EUR = 1.10 USD.
              </p>
            </div>

            <div className="glass-card w-full max-w-md rounded-[1.75rem] border border-white/10 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">How It Works</p>
              <div className="mt-3 grid grid-cols-3 gap-2 rounded-2xl bg-white/5 p-1">
                <button
                  onClick={() => setViewMode('selector')}
                  className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-medium transition ${
                    viewMode === 'selector'
                      ? 'bg-gradient-to-r from-orange-600 to-orange-500 text-white shadow-lg shadow-orange-500/20'
                      : 'text-slate-300 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <ArrowRightLeft className="h-4 w-4" />
                  {VIEW_MODE_META.selector.buttonLabel}
                </button>
                <button
                  onClick={() => setViewMode('table')}
                  className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-medium transition ${
                    viewMode === 'table'
                      ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-lg shadow-indigo-500/20'
                      : 'text-slate-300 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <TableProperties className="h-4 w-4" />
                  {VIEW_MODE_META.table.buttonLabel}
                </button>
                <button
                  onClick={() => setViewMode('estimate')}
                  className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-medium transition ${
                    viewMode === 'estimate'
                      ? 'bg-gradient-to-r from-emerald-600 to-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                      : 'text-slate-300 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <Calculator className="h-4 w-4" />
                  {VIEW_MODE_META.estimate.buttonLabel}
                </button>
              </div>
              <div className="mt-5 rounded-[1.5rem] border border-white/10 bg-slate-950/40 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  {activeViewMeta.eyebrow}
                </p>
                <h2 className="mt-2 text-lg font-semibold text-white">{activeViewMeta.title}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-300">{activeViewMeta.description}</p>
              </div>
              <div className="mt-4 space-y-2">
                {(['selector', 'table', 'estimate'] as ViewMode[]).map((mode, index) => {
                  const isActive = viewMode === mode;
                  const meta = VIEW_MODE_META[mode];

                  const colorMap = {
                    selector: {
                      active: 'border-orange-400/20 bg-orange-500/10',
                      badge: 'bg-orange-500/20 text-orange-300',
                    },
                    table: {
                      active: 'border-indigo-400/20 bg-indigo-500/10',
                      badge: 'bg-indigo-500/20 text-indigo-300',
                    },
                    estimate: {
                      active: 'border-emerald-400/20 bg-emerald-500/10',
                      badge: 'bg-emerald-500/20 text-emerald-300',
                    },
                  };

                  const colors = colorMap[mode];

                  return (
                    <button
                      key={mode}
                      onClick={() => setViewMode(mode)}
                      className={`w-full cursor-pointer rounded-2xl border px-4 py-3 text-left transition ${
                        isActive
                          ? colors.active
                          : 'border-white/8 bg-white/[0.03] hover:border-white/15 hover:bg-white/[0.06]'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <span
                          className={`mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold ${
                            isActive
                              ? colors.badge
                              : 'bg-white/5 text-slate-300'
                          }`}
                        >
                          {index + 1}
                        </span>
                        <div>
                          <p className="text-sm font-medium text-white">{meta.buttonLabel}</p>
                          <p className="mt-1 text-xs leading-5 text-slate-400">{meta.description}</p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="relative mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              icon={DollarSign}
              label="Salary records"
              value={salaryData.length.toLocaleString()}
              helper="Published ranges currently loaded into the guide."
            />
            <StatCard
              icon={Anchor}
              label="Roles"
              value={availablePositions.length.toString()}
              helper="Normalized yacht positions ready to compare."
            />
            <StatCard
              icon={Database}
              label="Sources"
              value={availableSources.length.toString()}
              helper="Industry guides and compensation surveys included."
            />
            <StatCard
              icon={Radar}
              label="Size bands"
              value={availableYachtSizes.length.toString()}
              helper="Clean comparison bands shown to the client."
            />
          </div>
        </section>

        {loadError ? (
          <div className="mt-6 rounded-3xl border border-amber-500/20 bg-amber-500/[0.08] px-5 py-4 text-sm text-amber-100 backdrop-blur-sm">
            {loadError}
          </div>
        ) : null}

        {!loading && salaryData.length === 0 ? (
          <section className="mt-8 glass-card rounded-[1.75rem] border border-red-500/20 p-8">
            <h2 className="text-2xl font-semibold text-white">No salary data available</h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
              The guide could not load salary rows from the configured data source. Once records are
              available again, the comparison and table views will populate automatically.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="mt-6 inline-flex items-center rounded-2xl border border-white/10 bg-white/[0.08] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-white/[0.12]"
            >
              Retry
            </button>
          </section>
        ) : null}

        {viewMode === 'estimate' ? (
          <section className="mt-8 grid gap-6 xl:grid-cols-[1.4fr_0.9fr]">
            <div className="glass-card rounded-[1.75rem] p-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                    Tailored Estimate
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold text-white">
                    Model your next package
                  </h2>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
                    This is the second layer after the benchmark view: same salary conversation, but
                    with yacht type, charter pace, dual-season upside, and tip assumptions added on
                    top of Hugo&apos;s original calculator logic.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setEstimatorDepartment('Deck');
                    setEstimatorYachtSize('31-40m');
                    setEstimatorPosition('Junior Deckhand');
                    setEstimatorYachtType('Charter');
                    setEstimatorCharterLoad('Heavy (10-12 weeks)');
                    setEstimatorTipRate(0.1);
                    setEstimatorDualSeason(false);
                  }}
                  className="inline-flex items-center rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-slate-200 transition hover:bg-white/10 hover:text-white"
                >
                  Reset estimator
                </button>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-slate-200">Department</span>
                  <select
                    value={estimatorDepartment}
                    onChange={(event) =>
                      handleEstimatorDepartmentChange(event.target.value as EstimatorDepartment)
                    }
                    className="w-full rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-white transition focus:border-orange-400/40 focus:ring-2 focus:ring-orange-500/20"
                  >
                    {ESTIMATOR_DEPARTMENTS.map((department) => (
                      <option key={department} value={department}>
                        {department}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-slate-200">Yacht size</span>
                  <select
                    value={estimatorYachtSize}
                    onChange={(event) =>
                      handleEstimatorYachtSizeChange(event.target.value as EstimatorYachtSize)
                    }
                    className="w-full rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-white transition focus:border-orange-400/40 focus:ring-2 focus:ring-orange-500/20"
                  >
                    {estimatorAvailableSizes.map((size) => (
                      <option key={size} value={size}>
                        {size}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-slate-200">Position</span>
                  <select
                    value={estimatorPosition}
                    onChange={(event) => setEstimatorPosition(event.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-white transition focus:border-orange-400/40 focus:ring-2 focus:ring-orange-500/20"
                  >
                    {estimatorAvailablePositions.length > 0 ? (
                      estimatorAvailablePositions.map((position) => (
                        <option key={position} value={position}>
                          {position}
                        </option>
                      ))
                    ) : (
                      <option value="">No roles available for this combination</option>
                    )}
                  </select>
                </label>

                <div className="block">
                  <span className="mb-2 block text-sm font-medium text-slate-200">Yacht type</span>
                  <div className="grid grid-cols-2 gap-2 rounded-2xl bg-white/5 p-1">
                    {ESTIMATOR_YACHT_TYPES.map((type) => (
                      <button
                        key={type}
                        onClick={() => setEstimatorYachtType(type)}
                        className={`rounded-xl px-4 py-3 text-sm font-medium transition ${
                          estimatorYachtType === type
                            ? 'bg-orange-500/20 text-white'
                            : 'text-slate-300 hover:bg-white/5 hover:text-white'
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-5 rounded-[1.5rem] border border-white/10 bg-slate-950/40 p-5">
                {estimatorIsCharter ? (
                  <div className="grid gap-4 md:grid-cols-2">
                    <label className="block">
                      <span className="mb-2 block text-sm font-medium text-slate-200">
                        Charter pace
                      </span>
                      <select
                        value={estimatorCharterLoad}
                        onChange={(event) =>
                          setEstimatorCharterLoad(event.target.value as EstimatorCharterLoad)
                        }
                        className="w-full rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-white transition focus:border-orange-400/40 focus:ring-2 focus:ring-orange-500/20"
                      >
                        {ESTIMATOR_CHARTER_LOADS.map((load) => (
                          <option key={load} value={load}>
                            {load}
                          </option>
                        ))}
                      </select>
                    </label>

                    <div className="block">
                      <span className="mb-2 block text-sm font-medium text-slate-200">
                        Dual season
                      </span>
                      <div className="grid grid-cols-2 gap-2 rounded-2xl bg-white/5 p-1">
                        {['No', 'Yes'].map((label) => {
                          const isActive = estimatorDualSeason === (label === 'Yes');

                          return (
                            <button
                              key={label}
                              onClick={() => setEstimatorDualSeason(label === 'Yes')}
                              className={`rounded-xl px-4 py-3 text-sm font-medium transition ${
                                isActive
                                  ? 'bg-orange-500/20 text-white'
                                  : 'text-slate-300 hover:bg-white/5 hover:text-white'
                              }`}
                            >
                              {label}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="md:col-span-2">
                      <span className="mb-2 block text-sm font-medium text-slate-200">
                        Tip percentage
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {ESTIMATOR_TIP_RATES.map((rate) => (
                          <button
                            key={rate}
                            onClick={() => setEstimatorTipRate(rate)}
                            className={`rounded-full border px-3 py-1.5 text-sm transition ${
                              estimatorTipRate === rate
                                ? 'border-orange-400/30 bg-orange-500/15 text-white'
                                : 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white'
                            }`}
                          >
                            {Math.round(rate * 100)}%
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm leading-6 text-slate-300">
                    Private-yacht mode keeps the estimate focused on base salary only. Charter
                    prices, seasonal tips, and dual-season upside are excluded.
                  </p>
                )}
              </div>
            </div>

            <div className="glass-card rounded-[1.75rem] p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                Estimate Snapshot
              </p>
              {estimatorResult ? (
                <div className="mt-4 space-y-4">
                  <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/40 p-5">
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-orange-500/10 text-orange-200">
                        <Calculator className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="text-lg font-semibold text-white">{estimatorResult.position}</p>
                        <p className="text-sm text-slate-300">
                          {estimatorResult.department} on a {estimatorResult.yachtSize} yacht.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl border border-orange-400/20 bg-orange-500/10 p-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                        Monthly midpoint
                      </p>
                      <p className="mt-2 text-2xl font-semibold text-white">
                        {estimatorDisplayData
                          ? formatMoney(estimatorDisplayData.monthlyMidpoint, displayCurrency)
                          : '—'}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                        Annual package midpoint
                      </p>
                      <p className="mt-2 text-2xl font-semibold text-white">
                        {estimatorDisplayData
                          ? formatMoney(estimatorDisplayData.annualMidpoint, displayCurrency)
                          : '—'}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3 text-sm leading-6 text-slate-300">
                    <p className="flex items-start gap-3">
                      <span className="mt-1 h-2.5 w-2.5 rounded-full bg-orange-300" />
                      Built from Hugo&apos;s original SSS workbook rather than the broader live
                      benchmark blend.
                    </p>
                    <p className="flex items-start gap-3">
                      <span className="mt-1 h-2.5 w-2.5 rounded-full bg-cyan-300" />
                      Position choice acts as the practical experience proxy here, because the
                      workbook does not model years of experience separately.
                    </p>
                    <p className="flex items-start gap-3">
                      <span className="mt-1 h-2.5 w-2.5 rounded-full bg-amber-300" />
                      Charter upside is based on yacht-size charter prices, estimated crew count,
                      tip percentage, and charter weeks from the workbook.
                    </p>
                  </div>
                </div>
              ) : (
                <p className="mt-4 text-sm leading-6 text-slate-300">
                  Choose a department, yacht band, and position to generate a package estimate.
                </p>
              )}
            </div>
          </section>
        ) : (
          <section className="mt-8 grid gap-6 xl:grid-cols-[1.4fr_0.9fr]">
            <div className="glass-card rounded-[1.75rem] p-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                    Published Benchmark
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold text-white">Build the market view</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-300">
                    Start with the market story first. The benchmark view groups nearby source sizes
                    into simpler client-facing bands so multiple salary guides can be read side by side.
                  </p>
                </div>
                {hasActiveFilters ? (
                  <button
                    onClick={() => {
                      setSelectedPosition('');
                      setSelectedYachtSize('');
                    }}
                    className="inline-flex items-center rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-slate-200 transition hover:bg-white/10 hover:text-white"
                  >
                    Clear filters
                  </button>
                ) : null}
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-slate-200">Position</span>
                  <select
                    value={selectedPosition}
                    onChange={(event) => handlePositionChange(event.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-white transition focus:border-orange-400/40 focus:ring-2 focus:ring-orange-500/20"
                  >
                    <option value="">All positions</option>
                    {availablePositions.map((position) => (
                      <option key={position} value={position}>
                        {position}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-slate-200">Yacht size</span>
                  <select
                    value={selectedYachtSize}
                    onChange={(event) => setSelectedYachtSize(event.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-white transition focus:border-orange-400/40 focus:ring-2 focus:ring-orange-500/20"
                  >
                    <option value="">All comparison bands</option>
                    {availableSizesForPosition.map((size) => (
                      <option key={size} value={size}>
                        {size}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="mt-5">
                {selectedPosition ? (
                  <>
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <p className="text-sm text-slate-300">
                        Comparison bands for <span className="font-medium text-white">{selectedPosition}</span>
                      </p>
                      <span
                        className={`inline-flex w-fit items-center rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${categoryMeta.badge}`}
                      >
                        {selectedCategory}
                      </span>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {availableSizesForPosition.map((size) => (
                        <button
                          key={size}
                          onClick={() => setSelectedYachtSize(size)}
                          className={`rounded-full border px-3 py-1.5 text-sm transition ${
                            selectedYachtSize === size
                              ? 'border-orange-400/30 bg-orange-500/15 text-white'
                              : 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white'
                          }`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                    <p className="mt-3 text-xs leading-5 text-slate-400">
                      Source cards below keep each guide&apos;s original published band, even when the
                      selector groups them into a cleaner comparison range.
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-sm text-slate-300">Quick-start roles</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {spotlightPositions.map((position) => (
                        <button
                          key={position}
                          onClick={() => handlePositionChange(position)}
                          className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-slate-300 transition hover:bg-white/10 hover:text-white"
                        >
                          {position}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="glass-card rounded-[1.75rem] p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                Why This View Works
              </p>
              <div className="mt-4 space-y-4 text-sm leading-6 text-slate-300">
                <p className="flex items-start gap-3">
                  <span className="mt-1 h-2.5 w-2.5 rounded-full bg-orange-300" />
                  Every salary range is monthly pay as published by the source guide, so the market
                  picture stays grounded in real benchmark rows.
                </p>
                <p className="flex items-start gap-3">
                  <span className="mt-1 h-2.5 w-2.5 rounded-full bg-cyan-300" />
                  The benchmark average is the midpoint between each source&apos;s minimum and maximum,
                  which keeps the summary simple without hiding the spread.
                </p>
                <p className="flex items-start gap-3">
                  <span className="mt-1 h-2.5 w-2.5 rounded-full bg-amber-300" />
                  The source table stays in sync and keeps the original guide band visible on every
                  row, so the headline range always has evidence behind it.
                </p>
              </div>

              <div className="mt-6 rounded-[1.5rem] border border-white/10 bg-slate-950/40 p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                  Current Focus
                </p>
                {selectedPosition && selectedYachtSize ? (
                  <div className="mt-3">
                    <div className="flex items-start gap-4">
                      <div
                        className={`flex h-12 w-12 items-center justify-center rounded-2xl border ${categoryMeta.iconWrap}`}
                      >
                        <CategoryIcon className={`h-6 w-6 ${categoryMeta.iconColor}`} />
                      </div>
                      <div>
                        <p className="text-lg font-semibold text-white">{selectedPosition}</p>
                        <p className="text-sm text-slate-300">
                          {selectedYachtSize} comparison band across {comparisonData.length} matching
                          guide{comparisonData.length === 1 ? '' : 's'}.
                        </p>
                      </div>
                    </div>
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      <div className={`rounded-2xl border ${categoryMeta.statRing} bg-white/5 p-4`}>
                        <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Published average</p>
                        <p className="mt-2 text-2xl font-semibold text-white">
                          {formatMoney(averageSalary.avg, displayCurrency)}
                        </p>
                      </div>
                      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                        <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Range spread</p>
                        <p className="mt-2 text-2xl font-semibold text-white">
                          {formatMoney(averageSalary.max - averageSalary.min, displayCurrency)}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="mt-3 text-sm leading-6 text-slate-300">
                    Pick a role and size band to surface the strongest comparison view and show the
                    exact source cards.
                  </p>
                )}
              </div>
            </div>
          </section>
        )}

        {viewMode === 'selector' ? (
          <section className="mt-8 space-y-6">
            {selectedPosition && selectedYachtSize && comparisonData.length > 0 ? (
              <>
                <div
                  className={`glass-card relative overflow-hidden rounded-[2rem] border p-6 sm:p-8 ${categoryMeta.panel}`}
                >
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.08),transparent_35%)]" />
                  <div className="relative flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                    <div className="flex items-start gap-4">
                      <div
                        className={`flex h-16 w-16 items-center justify-center rounded-[1.4rem] border ${categoryMeta.iconWrap}`}
                      >
                        <CategoryIcon className={`h-8 w-8 ${categoryMeta.iconColor}`} />
                      </div>
                      <div>
                        <span
                          className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${categoryMeta.badge}`}
                        >
                          {selectedCategory}
                        </span>
                        <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white">
                          {selectedPosition}
                        </h2>
                        <p className="mt-2 text-base text-slate-300">
                          {selectedYachtSize} comparison band with {comparisonData.length} matching
                          guide{comparisonData.length === 1 ? '' : 's'}.
                        </p>
                      </div>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-3 lg:w-[30rem]">
                      <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
                        <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                          Published average
                        </p>
                        <p className="mt-2 text-2xl font-semibold text-white">
                          {formatMoney(averageSalary.avg, displayCurrency)}
                        </p>
                      </div>
                      <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
                        <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                          Lowest source
                        </p>
                        <p className="mt-2 text-lg font-semibold text-white">
                          {lowestSource ? formatMoney(getDisplayAverage(lowestSource, displayCurrency), displayCurrency) : '—'}
                        </p>
                        <p className="mt-1 text-xs text-slate-400">{lowestSource?.source ?? 'No data'}</p>
                      </div>
                      <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
                        <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                          Highest source
                        </p>
                        <p className="mt-2 text-lg font-semibold text-white">
                          {highestSource ? formatMoney(getDisplayAverage(highestSource, displayCurrency), displayCurrency) : '—'}
                        </p>
                        <p className="mt-1 text-xs text-slate-400">{highestSource?.source ?? 'No data'}</p>
                      </div>
                    </div>
                  </div>

                  <div className="relative mt-6 grid gap-4 sm:grid-cols-2">
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Average range</p>
                      <p className="mt-2 text-lg font-semibold text-white">
                        {formatMoney(averageSalary.min, displayCurrency)} to{' '}
                        {formatMoney(averageSalary.max, displayCurrency)}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Method note</p>
                      <p className="mt-2 text-sm leading-6 text-slate-300">
                        Averages are calculated from each source&apos;s published low and high range
                        after normalizing obvious role aliases and nearby yacht-size bands for cross-source comparison.
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                        Source Comparison
                      </p>
                      <h3 className="mt-2 text-2xl font-semibold text-white">
                        Published salary cards
                      </h3>
                    </div>
                    <p className="text-sm text-slate-400">
                      Highest published average appears first for faster scanning.
                    </p>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {comparisonData.map((record) => {
                      const accent = sourceAccents[record.source] ?? SOURCE_ACCENTS[0];

                      return (
                        <div
                          key={`${record.id}-${record.source}-${record.yacht_size}`}
                          className={`glass-card glass-card-hover relative overflow-hidden rounded-[1.6rem] border p-5 ${accent.card}`}
                        >
                          <div className={`absolute inset-x-0 top-0 h-px bg-gradient-to-r ${accent.line}`} />
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <span
                                className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${accent.pill}`}
                              >
                                {record.source}
                              </span>
                              <p className="mt-3 text-sm text-slate-300">
                                Published band{record.rawBands.length === 1 ? '' : 's'}:{' '}
                                {record.rawBands.join(', ')}
                              </p>
                            </div>
                            <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-medium text-slate-200">
                              {record.currency === displayCurrency ? displayCurrency : `${record.currency} -> ${displayCurrency}`}
                            </span>
                          </div>

                          <div className="mt-6 rounded-2xl border border-white/10 bg-slate-950/45 p-4">
                            <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                              Published average
                            </p>
                            <p className={`mt-2 text-3xl font-semibold ${accent.value}`}>
                              {formatMoney(getDisplayAverage(record, displayCurrency), displayCurrency)}
                            </p>
                          </div>

                          <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-3">
                              <p className="text-xs uppercase tracking-[0.14em] text-slate-400">Low</p>
                              <p className="mt-2 font-medium text-white">
                                {formatMoney(
                                  convertMoney(record.min_salary, record.currency, displayCurrency),
                                  displayCurrency
                                )}
                              </p>
                            </div>
                            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-3">
                              <p className="text-xs uppercase tracking-[0.14em] text-slate-400">High</p>
                              <p className="mt-2 font-medium text-white">
                                {formatMoney(
                                  convertMoney(record.max_salary, record.currency, displayCurrency),
                                  displayCurrency
                                )}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            ) : (
              <div className="glass-card rounded-[1.75rem] border border-white/10 p-8 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[1.4rem] border border-white/10 bg-white/5 text-orange-200">
                  <ArrowRightLeft className="h-8 w-8" />
                </div>
                <h3 className="mt-5 text-2xl font-semibold text-white">
                  {selectedPosition
                    ? 'Choose a yacht-size band to unlock the comparison cards'
                    : 'Pick a role to start comparing salary guides'}
                </h3>
                <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-slate-300">
                  {selectedPosition
                    ? `The guide cards will appear once you choose one of the comparison bands for ${selectedPosition}.`
                    : 'Use the quick-start role chips or the dropdown filters above, then select a comparison band to review the published salary ranges.'}
                </p>
              </div>
            )}
          </section>
        ) : viewMode === 'table' ? (
          <section className="mt-8">
            <div className="glass-card overflow-hidden rounded-[2rem] border border-white/10">
              <div className="flex flex-col gap-3 border-b border-white/10 px-6 py-5 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                    Source Table
                  </p>
                  <h3 className="mt-2 text-2xl font-semibold text-white">
                    {hasActiveFilters ? 'Filtered source rows' : 'All benchmark source rows'}
                  </h3>
                </div>
                <p className="text-sm text-slate-400">
                  {tableData.length.toLocaleString()} row{tableData.length === 1 ? '' : 's'} currently shown
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-[880px] w-full text-left text-sm">
                  <thead className="bg-white/[0.04] text-slate-300">
                    <tr>
                      <th className="px-6 py-4 font-medium">Position</th>
                      <th className="px-6 py-4 font-medium">Department</th>
                      <th className="px-6 py-4 font-medium">Yacht Size</th>
                      <th className="px-6 py-4 font-medium">Min</th>
                      <th className="px-6 py-4 font-medium">Max</th>
                      <th className="px-6 py-4 font-medium">Source</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tableData.map((record) => {
                      const accent = sourceAccents[record.source] ?? SOURCE_ACCENTS[0];
                      const departmentMeta = CATEGORY_META[record.department];

                      return (
                        <tr
                          key={`${record.id}-${record.source}-${record.yacht_size}`}
                          className="border-t border-white/6 transition hover:bg-white/[0.03]"
                        >
                          <td className="px-6 py-4 font-medium text-white">{record.position}</td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${departmentMeta.badge}`}
                            >
                              {record.department}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-slate-300">{record.yacht_size}</td>
                          <td className="px-6 py-4 font-medium text-white">
                            {formatMoney(
                              convertMoney(record.min_salary, record.currency, displayCurrency),
                              displayCurrency
                            )}
                          </td>
                          <td className="px-6 py-4 font-medium text-white">
                            {formatMoney(
                              convertMoney(record.max_salary, record.currency, displayCurrency),
                              displayCurrency
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${accent.pill}`}
                            >
                              {record.source}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {tableData.length === 0 ? (
                <div className="border-t border-white/10 px-6 py-10 text-center text-slate-300">
                  No rows match the current filter combination.
                </div>
              ) : null}
            </div>
          </section>
        ) : (
          <section className="mt-8 space-y-6">
            {estimatorResult ? (
              <>
                <div className="glass-card relative overflow-hidden rounded-[2rem] border border-orange-500/20 bg-gradient-to-br from-orange-500/10 via-white/[0.03] to-transparent p-6 sm:p-8">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.08),transparent_35%)]" />
                  <div className="relative flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                    <div className="flex items-start gap-4">
                      <div className="flex h-16 w-16 items-center justify-center rounded-[1.4rem] border border-orange-400/20 bg-orange-500/[0.12]">
                        <Calculator className="h-8 w-8 text-orange-200" />
                      </div>
                      <div>
                        <span className="inline-flex items-center rounded-full border border-orange-400/20 bg-orange-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-orange-100">
                          Tailored Estimate
                        </span>
                        <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white">
                          {estimatorResult.position}
                        </h2>
                        <p className="mt-2 text-base text-slate-300">
                          {estimatorResult.yachtSize} {estimatorResult.yachtType.toLowerCase()} yacht
                          {estimatorResult.yachtType === 'Charter'
                            ? estimatorResult.dualSeason
                              ? ', dual season'
                              : ', single season'
                            : ''}
                          .
                        </p>
                      </div>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2 lg:w-[30rem]">
                      <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
                        <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                          Monthly salary
                        </p>
                        <p className="mt-2 text-xl font-semibold text-white">
                          {estimatorDisplayData
                            ? formatMoneyRange(estimatorDisplayData.monthlySalary, displayCurrency)
                            : '—'}
                        </p>
                      </div>
                      <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
                        <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                          Annual total
                        </p>
                        <p className="mt-2 text-xl font-semibold text-white">
                          {estimatorDisplayData
                            ? formatMoneyRange(estimatorDisplayData.annualTotal, displayCurrency)
                            : '—'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="relative mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Monthly base</p>
                      <p className="mt-2 text-lg font-semibold text-white">
                        {estimatorDisplayData
                          ? formatMoneyRange(estimatorDisplayData.monthlySalary, displayCurrency)
                          : '—'}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Yearly base</p>
                      <p className="mt-2 text-lg font-semibold text-white">
                        {estimatorDisplayData
                          ? formatMoneyRange(estimatorDisplayData.annualBaseSalary, displayCurrency)
                          : '—'}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                        {estimatorIsCharter ? 'Seasonal tips' : 'Charter upside'}
                      </p>
                      <p className="mt-2 text-lg font-semibold text-white">
                        {estimatorIsCharter
                          ? estimatorDisplayData
                            ? formatMoneyRange(estimatorDisplayData.seasonalTips, displayCurrency)
                            : '—'
                          : 'Not included'}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                        Total package
                      </p>
                      <p className="mt-2 text-lg font-semibold text-white">
                        {estimatorDisplayData
                          ? formatMoneyRange(estimatorDisplayData.annualTotal, displayCurrency)
                          : '—'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
                  <div className="glass-card rounded-[1.75rem] p-6">
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                      How This Estimate Works
                    </p>
                    <div className="mt-4 space-y-4 text-sm leading-6 text-slate-300">
                      <p className="flex items-start gap-3">
                        <span className="mt-1 h-2.5 w-2.5 rounded-full bg-orange-300" />
                        Base salary comes straight from the original role-and-yacht-size table in
                        Hugo&apos;s SSS calculator, so this layer starts from a defined pay baseline.
                      </p>
                      <p className="flex items-start gap-3">
                        <span className="mt-1 h-2.5 w-2.5 rounded-full bg-cyan-300" />
                        This is not trying to outguess every recruiter spreadsheet. The role itself
                        acts as the practical experience proxy because the workbook does not model
                        years separately.
                      </p>
                      <p className="flex items-start gap-3">
                        <span className="mt-1 h-2.5 w-2.5 rounded-full bg-amber-300" />
                        Charter upside is where this layer adds value: it models charter price
                        bands, estimated crew count, tip percentage, and seasonal charter weeks on
                        top of the base range.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="glass-card rounded-[1.75rem] p-6">
                      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                        Estimate Inputs
                      </p>
                      <div className="mt-4 grid gap-3 text-sm">
                        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                          <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Department</p>
                          <p className="mt-2 font-medium text-white">{estimatorResult.department}</p>
                        </div>
                        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                          <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Yacht type</p>
                          <p className="mt-2 font-medium text-white">{estimatorResult.yachtType}</p>
                        </div>
                        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                          <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Tip rate</p>
                          <p className="mt-2 font-medium text-white">
                            {Math.round(estimatorResult.tipRate * 100)}%
                          </p>
                        </div>
                        {estimatorIsCharter ? (
                          <>
                            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                              <p className="text-xs uppercase tracking-[0.16em] text-slate-400">
                                Charter price band
                              </p>
                              <p className="mt-2 font-medium text-white">
                                {estimatorDisplayData?.charterPriceRange
                                  ? formatMoneyRange(
                                      estimatorDisplayData.charterPriceRange,
                                      displayCurrency
                                    )
                                  : '—'}
                              </p>
                            </div>
                            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                              <p className="text-xs uppercase tracking-[0.16em] text-slate-400">
                                Estimated crew count
                              </p>
                              <p className="mt-2 font-medium text-white">
                                {estimatorResult.crewCountRange
                                  ? `${estimatorResult.crewCountRange.low} to ${estimatorResult.crewCountRange.high}`
                                  : '—'}
                              </p>
                            </div>
                            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                              <p className="text-xs uppercase tracking-[0.16em] text-slate-400">
                                Charter weeks
                              </p>
                              <p className="mt-2 font-medium text-white">
                                {estimatorResult.charterWeeksRange
                                  ? `${estimatorResult.charterWeeksRange.low} to ${estimatorResult.charterWeeksRange.high}`
                                  : '—'}
                              </p>
                            </div>
                            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                              <p className="text-xs uppercase tracking-[0.16em] text-slate-400">
                                Weekly tips per crew
                              </p>
                              <p className="mt-2 font-medium text-white">
                                {estimatorDisplayData
                                  ? formatMoneyRange(estimatorDisplayData.weeklyTips, displayCurrency)
                                  : '—'}
                              </p>
                            </div>
                          </>
                        ) : null}
                      </div>
                    </div>

                  </div>
                </div>
              </>
            ) : (
              <div className="glass-card rounded-[1.75rem] border border-white/10 p-8 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[1.4rem] border border-white/10 bg-white/5 text-orange-200">
                  <Calculator className="h-8 w-8" />
                </div>
                <h3 className="mt-5 text-2xl font-semibold text-white">
                  Choose a role to generate your package estimate
                </h3>
                <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-slate-300">
                  The estimator will surface once there is a valid role for the selected department
                  and yacht-size band.
                </p>
              </div>
            )}
          </section>
        )}

        {viewMode === 'estimate' ? null : (
          <section className="mt-8 glass-card rounded-[1.75rem] p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                  Data Sources
                </p>
                <h3 className="mt-2 text-2xl font-semibold text-white">Benchmark sources in the guide</h3>
              </div>
              <p className="max-w-xl text-sm leading-6 text-slate-400">
                Source cards glow when they match the currently selected role and yacht-size band.
              </p>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {availableSources.map((source) => {
                const accent = sourceAccents[source] ?? SOURCE_ACCENTS[0];
                const isHighlighted = comparisonData.some((record) => record.source === source);

                return (
                  <div
                    key={source}
                    className={`rounded-[1.4rem] border p-4 ${
                      isHighlighted
                        ? `${accent.card} border-white/10`
                        : 'border-white/10 bg-white/[0.03]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-white">{source}</p>
                        <p className="mt-1 text-sm text-slate-400">
                          {sourceCounts[source]?.toLocaleString() ?? '0'} benchmark row
                          {sourceCounts[source] === 1 ? '' : 's'}
                        </p>
                      </div>
                      <span
                        className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.16em] ${
                          isHighlighted
                            ? accent.pill
                            : 'border-white/10 bg-white/5 text-slate-300'
                        }`}
                      >
                        {isHighlighted ? 'Match' : 'Available'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
