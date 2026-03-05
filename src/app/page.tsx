'use client';

import { useState, useEffect, useMemo } from 'react';
import { 
  Anchor, 
  Wrench, 
  Sparkles, 
  ChefHat,
  DollarSign,
  Building2,
  Scale,
  Loader2
} from 'lucide-react';

interface SalaryRecord {
  id: string;
  position: string;
  yacht_size: string;
  min_salary: number;
  max_salary: number;
  currency: string;
  source: string;
  department: string;
}

const categoryIcons: Record<string, any> = {
  Deck: Anchor,
  Engineering: Wrench,
  Interior: Sparkles,
  Culinary: ChefHat,
};

const categoryColors: Record<string, any> = {
  Deck: { bg: 'bg-blue-500/10', border: 'border-blue-500/20', text: 'text-blue-400' },
  Engineering: { bg: 'bg-orange-500/10', border: 'border-orange-500/20', text: 'text-orange-400' },
  Interior: { bg: 'bg-purple-500/10', border: 'border-purple-500/20', text: 'text-purple-400' },
  Culinary: { bg: 'bg-red-500/10', border: 'border-red-500/20', text: 'text-red-400' },
};

const sourceColors: Record<string, string> = {
  'Flying Fish Online': 'border-emerald-500/30 bg-emerald-500/10',
  'Lighthouse Careers': 'border-blue-500/30 bg-blue-500/10',
  'YPI CREW': 'border-purple-500/30 bg-purple-500/10',
  'Morgan & Mallet': 'border-amber-500/30 bg-amber-500/10',
  'Dockwalk': 'border-cyan-500/30 bg-cyan-500/10',
  'Quay Group': 'border-pink-500/30 bg-pink-500/10',
  'Luxury Yacht Group': 'border-rose-500/30 bg-rose-500/10',
  'Camper & Nicholsons (2024)': 'border-teal-500/30 bg-teal-500/10',
  'McGregor Financial Services (2025-26)': 'border-indigo-500/30 bg-indigo-500/10',
  'LuxYachts Salary Guidelines (2021)': 'border-lime-500/30 bg-lime-500/10',
  'Dockwalk Salary Survey (2021)': 'border-sky-500/30 bg-sky-500/10',
};

const allSources = [
  'Flying Fish Online', 
  'Lighthouse Careers', 
  'YPI CREW', 
  'Morgan & Mallet', 
  'Dockwalk', 
  'Quay Group', 
  'Luxury Yacht Group',
  'Camper & Nicholsons (2024)',
  'McGregor Financial Services (2025-26)',
  'LuxYachts Salary Guidelines (2021)',
  'Dockwalk Salary Survey (2021)'
];

// Supabase config
const SUPABASE_URL = 'https://zmiikssbwzkukfqqxjew.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InptaWlrc3Nid3prdWtmcXF4amV3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI3NjM3NjEsImV4cCI6MjA3ODMzOTc2MX0.Um5exonLMHubipMm0pvELDE5_aAoO4ZcoQcLX077VoQ';

export default function SalaryGuide() {
  const [salaryData, setSalaryData] = useState<SalaryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedPosition, setSelectedPosition] = useState<string>('');
  const [selectedYachtSize, setSelectedYachtSize] = useState<string>('');
  const [viewMode, setViewMode] = useState<'selector' | 'table'>('selector');

  // Fetch data on mount using direct fetch
  useEffect(() => {
    async function loadData() {
      try {
        const response = await fetch(
          `${SUPABASE_URL}/rest/v1/salary_benchmarks?select=*&order=position`,
          {
            headers: {
              'apikey': SUPABASE_ANON_KEY,
              'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
            }
          }
        );
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        setSalaryData(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const normalizePosition = (pos: string) => {
    if (pos === 'Chief Officer / First Mate') return 'First Officer';
    return pos;
  };

  const normalizedData = useMemo(() => (
    salaryData.map(d => ({ ...d, position: normalizePosition(d.position) }))
  ), [salaryData]);

  const positionOrder = [
    'Captain',
    'Chief Engineer',
    'First Officer',
    'Second Officer',
    'Mate',
    'Bosun',
    'Deckhand',
    'Junior Deckhand',
    'Chief Stewardess',
    'Second Stewardess',
    'Stewardess',
    'Junior Stewardess',
    'Purser',
    'ETO / AV-IT',
    'Second Engineer',
    'Head Chef',
    'Sous Chef',
    'Cook'
  ];

  const sizeOrder = [
    '30-40m',
    '40-50m',
    '50-60m',
    '60-80m',
    '70-80m',
    '80-100m',
    '100m+'
  ];

  const orderByList = (value: string, list: string[]) => {
    const idx = list.indexOf(value);
    return idx === -1 ? Number.MAX_SAFE_INTEGER : idx;
  };

  const availablePositions = useMemo(() => 
    [...new Set(normalizedData.map(d => d.position))]
      .sort((a, b) => orderByList(a, positionOrder) - orderByList(b, positionOrder)), 
    [normalizedData]
  );
  
  const availableYachtSizes = useMemo(() => 
    [...new Set(normalizedData.map(d => d.yacht_size))]
      .sort((a, b) => orderByList(a, sizeOrder) - orderByList(b, sizeOrder)), 
    [normalizedData]
  );

  const availableSizesForPosition = useMemo(() => {
    if (!selectedPosition) return availableYachtSizes;
    return [...new Set(
      normalizedData
        .filter(d => d.position === selectedPosition)
        .map(d => d.yacht_size)
    )].sort((a, b) => orderByList(a, sizeOrder) - orderByList(b, sizeOrder));
  }, [normalizedData, selectedPosition, availableYachtSizes]);

  const comparisonData = useMemo(() => {
    if (!selectedPosition || !selectedYachtSize) return [];
    return normalizedData.filter(d => 
      d.position === selectedPosition && d.yacht_size === selectedYachtSize
    );
  }, [normalizedData, selectedPosition, selectedYachtSize]);

  const averageSalary = useMemo(() => {
    if (comparisonData.length === 0) return { min: 0, max: 0, avg: 0, count: 0 };
    const mins = comparisonData.map(d => d.min_salary);
    const maxs = comparisonData.map(d => d.max_salary);
    const minAvg = mins.reduce((a, b) => a + b, 0) / mins.length;
    const maxAvg = maxs.reduce((a, b) => a + b, 0) / maxs.length;
    return {
      min: Math.round(minAvg),
      max: Math.round(maxAvg),
      avg: Math.round((minAvg + maxAvg) / 2),
      count: comparisonData.length,
    };
  }, [comparisonData]);

  const selectedCategory = useMemo(() => {
    if (!selectedPosition || comparisonData.length === 0) return 'Deck';
    return comparisonData[0]?.department || 'Deck';
  }, [selectedPosition, comparisonData]);

  const CategoryIcon = categoryIcons[selectedCategory] || DollarSign;
  const colors = categoryColors[selectedCategory] || categoryColors.Deck;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0d1117] text-white flex items-center justify-center">
        <div className="flex items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-400" />
          <span className="text-lg">Loading salary data...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0d1117] text-white flex items-center justify-center p-4">
        <div className="max-w-md w-full p-6 bg-red-500/10 border border-red-500/30 rounded-xl">
          <h2 className="text-xl font-bold text-red-400 mb-2">Error Loading Data</h2>
          <p className="text-white/80 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="w-full px-4 py-2 bg-emerald-500/20 text-emerald-400 rounded-lg hover:bg-emerald-500/30 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d1117] text-white">
      {/* Header */}
      <div className="border-b border-white/5 bg-white/[0.02] backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                <DollarSign className="w-8 h-8 text-emerald-400" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
                  Yacht Crew Salary Guide 2026
                </h1>
                <p className="text-white/50 text-sm mt-1">
                  {salaryData.length} salary records from {new Set(salaryData.map(d => d.source)).size} sources
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('selector')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  viewMode === 'selector' ? 'bg-white/10 text-white border border-white/20' : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                Compare
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  viewMode === 'table' ? 'bg-white/10 text-white border border-white/20' : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                Table
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Selector Mode */}
        {viewMode === 'selector' && (
          <div className="space-y-8">
            {/* Filters */}
            <div className="glass-card rounded-2xl p-6 border border-white/5 bg-white/[0.03]">
              <h2 className="text-lg font-semibold text-white/80 mb-4">Select Position & Yacht Size</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <select
                  value={selectedPosition}
                  onChange={(e) => setSelectedPosition(e.target.value)}
                  className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-emerald-500/50"
                >
                  <option value="">Select position...</option>
                  {availablePositions.map(pos => (
                    <option key={pos} value={pos}>{pos}</option>
                  ))}
                </select>
                <select
                  value={selectedYachtSize}
                  onChange={(e) => setSelectedYachtSize(e.target.value)}
                  className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-emerald-500/50"
                >
                  <option value="">Select yacht size...</option>
                  {availableSizesForPosition.map(size => (
                    <option key={size} value={size}>{size}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Results */}
            {selectedPosition && selectedYachtSize && averageSalary.count > 0 && (
              <>
                {/* Average Card */}
                <div className={`glass-card rounded-2xl p-6 border ${colors.border} ${colors.bg}`}>
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-xl ${colors.bg} border ${colors.border}`}>
                      <CategoryIcon className={`w-6 h-6 ${colors.text}`} />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold">{selectedPosition}</h3>
                      <p className="text-white/60">{selectedYachtSize} • {comparisonData.length} sources</p>
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-bold">€{averageSalary.avg.toLocaleString()}</p>
                      <p className="text-white/60 text-sm">Average/month</p>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-white/10 flex justify-between">
                    <span className="text-white/60">Range:</span>
                    <span className="text-lg font-semibold">€{averageSalary.min.toLocaleString()} - €{averageSalary.max.toLocaleString()}</span>
                  </div>
                </div>

                {/* Source Cards */}
                <h3 className="text-lg font-semibold text-white/80">Source Comparison</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {comparisonData.map((item, idx) => (
                    <div key={idx} className={`glass-card rounded-xl p-5 border-2 ${sourceColors[item.source] || 'border-white/10'}`}>
                      <div className="flex justify-between mb-3">
                        <span className="text-sm font-bold">{item.source}</span>
                        <span className="text-xs px-2 py-1 rounded-full bg-white/10">{item.currency}</span>
                      </div>
                      <div className="text-center py-3 border-y border-white/10 my-3">
                        <p className="text-xs text-white/50 uppercase">Average</p>
                        <p className="text-2xl font-bold text-emerald-400">
                          €{Math.round((item.min_salary + item.max_salary) / 2).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-white/50">€{item.min_salary.toLocaleString()}</span>
                        <span>€{item.max_salary.toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {selectedPosition && selectedYachtSize && averageSalary.count === 0 && (
              <div className="glass-card rounded-2xl p-6 border border-white/5 bg-white/[0.03]">
                <h3 className="text-lg font-semibold text-white mb-2">No salary data for this combination</h3>
                <p className="text-white/60">Try a different yacht size for {selectedPosition}.</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {availableSizesForPosition.map(size => (
                    <button
                      key={size}
                      onClick={() => setSelectedYachtSize(size)}
                      className="px-3 py-1 text-xs rounded-full bg-white/10 hover:bg-white/20 text-white/80"
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Table Mode */}
        {viewMode === 'table' && (
          <div className="glass-card rounded-2xl border border-white/5 overflow-hidden">
            <table className="w-full">
              <thead className="border-b border-white/10 bg-white/[0.05]">
                <tr>
                  <th className="text-left px-6 py-4 text-sm font-medium text-white/60">Position</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-white/60">Size</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-white/60">Min</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-white/60">Max</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-white/60">Source</th>
                </tr>
              </thead>
              <tbody>
                {salaryData.map((item, idx) => (
                  <tr key={idx} className="border-b border-white/5 hover:bg-white/[0.05]">
                    <td className="px-6 py-4 font-medium">{item.position}</td>
                    <td className="px-6 py-4 text-white/70">{item.yacht_size}</td>
                    <td className="px-6 py-4 text-emerald-400 font-semibold">€{item.min_salary.toLocaleString()}</td>
                    <td className="px-6 py-4 text-emerald-400 font-semibold">€{item.max_salary.toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <span className={`text-xs px-2 py-1 rounded-full border ${sourceColors[item.source] || 'border-white/10'}`}>
                        {item.source}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="p-4 text-center text-white/40 text-sm border-t border-white/5">
              {salaryData.length} records from {new Set(salaryData.map(d => d.source)).size} sources
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-12 glass-card rounded-2xl p-6 border border-white/5">
          <div className="flex flex-col md:flex-row justify-between gap-4 mb-4">
            <h3 className="text-lg font-semibold">Data Sources</h3>
            <span className="text-white/60">
              {selectedPosition && selectedYachtSize
                ? `${comparisonData.length} sources for this combo`
                : `${new Set(salaryData.map(d => d.source)).size} sources total`}
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
            {allSources.map(source => {
              const hasData = selectedPosition && selectedYachtSize
                ? comparisonData.some(d => d.source === source)
                : salaryData.some(d => d.source === source);
              return (
                <div key={source} className={`px-3 py-2 rounded-lg text-xs text-center border ${hasData ? sourceColors[source] : 'border-white/5 text-white/30'}`}>
                  {source}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
