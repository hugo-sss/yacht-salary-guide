'use client';

import { useState, useMemo } from 'react';
import { salaryData, yachtSizes, getUniquePositions, type SalaryRange } from '@/lib/salary-data';

// Only show positions that have data
const availablePositions = getUniquePositions();
import { 
  Anchor, 
  Wrench, 
  Sparkles, 
  ChefHat,
  DollarSign,
  Building2,
  Scale,
  ArrowRight
} from 'lucide-react';

const categoryIcons = {
  Deck: Anchor,
  Engineering: Wrench,
  Interior: Sparkles,
  Culinary: ChefHat,
};

const categoryColors = {
  Deck: { bg: 'bg-blue-500/10', border: 'border-blue-500/20', text: 'text-blue-400', accent: 'bg-blue-500' },
  Engineering: { bg: 'bg-orange-500/10', border: 'border-orange-500/20', text: 'text-orange-400', accent: 'bg-orange-500' },
  Interior: { bg: 'bg-purple-500/10', border: 'border-purple-500/20', text: 'text-purple-400', accent: 'bg-purple-500' },
  Culinary: { bg: 'bg-red-500/10', border: 'border-red-500/20', text: 'text-red-400', accent: 'bg-red-500' },
};

const sourceColors: Record<string, string> = {
  'Flying Fish Online': 'border-emerald-500/30 bg-emerald-500/10',
  'Lighthouse Careers': 'border-blue-500/30 bg-blue-500/10',
  'YPI CREW': 'border-purple-500/30 bg-purple-500/10',
  'Morgan & Mallet': 'border-amber-500/30 bg-amber-500/10',
  'Dockwalk': 'border-cyan-500/30 bg-cyan-500/10',
  'Quay Group': 'border-pink-500/30 bg-pink-500/10',
  'Luxury Yacht Group': 'border-rose-500/30 bg-rose-500/10',
};

export default function SalaryGuide() {
  const [selectedPosition, setSelectedPosition] = useState<string>('');
  const [selectedYachtSize, setSelectedYachtSize] = useState<string>('');
  const [viewMode, setViewMode] = useState<'selector' | 'table'>('selector');

  // Get comparison data when both filters are selected
  const comparisonData = useMemo(() => {
    if (!selectedPosition || !selectedYachtSize) return [];
    return salaryData.filter(d => 
      d.position === selectedPosition && d.yachtSize === selectedYachtSize
    );
  }, [selectedPosition, selectedYachtSize]);

  // Calculate average from all sources
  const averageSalary = useMemo(() => {
    if (comparisonData.length === 0) return null;
    const allMins = comparisonData.map(d => d.minSalary);
    const allMaxs = comparisonData.map(d => d.maxSalary);
    return {
      min: Math.round(allMins.reduce((a, b) => a + b, 0) / allMins.length),
      max: Math.round(allMaxs.reduce((a, b) => a + b, 0) / allMaxs.length),
      avg: Math.round((allMins.reduce((a, b) => a + b, 0) + allMaxs.reduce((a, b) => a + b, 0)) / (allMins.length + allMaxs.length)),
      count: comparisonData.length,
    };
  }, [comparisonData]);

  // Get category for selected position
  const selectedCategory = useMemo(() => {
    if (!selectedPosition) return null;
    const match = salaryData.find(d => d.position === selectedPosition);
    return match?.category || 'Deck';
  }, [selectedPosition]);

  const CategoryIcon = selectedCategory ? categoryIcons[selectedCategory] : DollarSign;
  const colors = selectedCategory ? categoryColors[selectedCategory] : categoryColors.Deck;

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
                  Compare salaries across {new Set(salaryData.map(d => d.source)).size} industry sources
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('selector')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  viewMode === 'selector' 
                    ? 'bg-white/10 text-white border border-white/20' 
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                Compare Mode
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  viewMode === 'table' 
                    ? 'bg-white/10 text-white border border-white/20' 
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                Full Table
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
            <div className="glass-card rounded-2xl p-6 border border-white/5 bg-white/[0.03] backdrop-blur-sm">
              <h2 className="text-lg font-semibold text-white/80 mb-4 flex items-center gap-2">
                <Scale className="w-5 h-5" />
                Select Position & Yacht Size to Compare
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm text-white/60 flex items-center gap-2">
                    <Anchor className="w-4 h-4" />
                    Position
                  </label>
                  <select
                    value={selectedPosition}
                    onChange={(e) => setSelectedPosition(e.target.value)}
                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500/50 appearance-none cursor-pointer hover:bg-black/30 transition-colors"
                  >
                    <option value="" className="bg-slate-900">Select position...</option>
                    {availablePositions.map(pos => (
                      <option key={pos} value={pos} className="bg-slate-900">{pos}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-white/60 flex items-center gap-2">
                    <Building2 className="w-4 h-4" />
                    Yacht Size
                  </label>
                  <select
                    value={selectedYachtSize}
                    onChange={(e) => setSelectedYachtSize(e.target.value)}
                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500/50 appearance-none cursor-pointer hover:bg-black/30 transition-colors"
                  >
                    <option value="" className="bg-slate-900">Select yacht size...</option>
                    {yachtSizes.map(size => (
                      <option key={size} value={size} className="bg-slate-900">{size}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Results */}
            {selectedPosition && selectedYachtSize && averageSalary && (
              <div className="space-y-6">
                {/* Average Card */}
                <div className={`glass-card rounded-2xl p-6 border ${colors.border} ${colors.bg} backdrop-blur-sm`}>
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-xl ${colors.bg} border ${colors.border}`}>
                      <CategoryIcon className={`w-6 h-6 ${colors.text}`} />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-white">{selectedPosition}</h3>
                      <p className="text-white/60">{selectedYachtSize} • {comparisonData.length} sources</p>
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-bold text-white">€{averageSalary.avg.toLocaleString()}</p>
                      <p className="text-white/60 text-sm">Average/month</p>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between">
                    <span className="text-white/60">Range:</span>
                    <span className="text-lg font-semibold text-white">
                      €{averageSalary.min.toLocaleString()} - €{averageSalary.max.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Source Comparison */}
                <h3 className="text-lg font-semibold text-white/80 flex items-center gap-2">
                  <Scale className="w-5 h-5" />
                  Source Comparison — All Salaries
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {comparisonData.map((item, idx) => (
                    <div 
                      key={idx} 
                      className={`glass-card rounded-xl p-6 border-2 backdrop-blur-sm ${sourceColors[item.source] || 'border-white/10 bg-white/[0.03]'}`}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-sm font-bold text-white">{item.source}</span>
                        <span className="text-xs px-2 py-1 rounded-full bg-white/10 text-white/60">
                          {item.currency}
                        </span>
                      </div>
                      
                      {/* Big Salary Display */}
                      <div className="text-center py-4 border-y border-white/10 my-4">
                        <p className="text-xs text-white/50 uppercase tracking-wide mb-1">Average</p>
                        <p className="text-3xl font-bold text-emerald-400">
                          €{Math.round((item.minSalary + item.maxSalary) / 2).toLocaleString()}
                        </p>
                        <p className="text-sm text-white/40 mt-1">per month</p>
                      </div>
                      
                      {/* Range */}
                      <div className="space-y-3 pt-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-white/50">Min</span>
                          <span className="text-lg font-semibold text-white">€{item.minSalary.toLocaleString()}</span>
                        </div>
                        <div className="w-full bg-white/10 rounded-full h-2">
                          <div className="bg-emerald-500 h-2 rounded-full" style={{width: '100%'}}></div>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-white/50">Max</span>
                          <span className="text-lg font-semibold text-white">€{item.maxSalary.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Empty State */}
            {(!selectedPosition || !selectedYachtSize) && (
              <div className="glass-card rounded-2xl p-12 text-center border border-white/5 bg-white/[0.02]">
                <DollarSign className="w-16 h-16 text-white/10 mx-auto mb-4" />
                <p className="text-white/60 text-lg">Select a position and yacht size to compare salaries</p>
                <p className="text-white/40 text-sm mt-2">Data from {new Set(salaryData.map(d => d.source)).size} industry sources</p>
              </div>
            )}
          </div>
        )}

        {/* Table Mode */}
        {viewMode === 'table' && (
          <div className="glass-card rounded-2xl border border-white/5 bg-white/[0.03] backdrop-blur-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10 bg-white/[0.05]">
                    <th className="text-left px-6 py-4 text-sm font-medium text-white/60">Position</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-white/60">Yacht Size</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-white/60">Min Salary</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-white/60">Max Salary</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-white/60">Source</th>
                  </tr>
                </thead>
                <tbody>
                  {salaryData.map((item, idx) => (
                    <tr key={idx} className="border-b border-white/5 hover:bg-white/[0.05] transition-colors">
                      <td className="px-6 py-4 text-white font-medium">{item.position}</td>
                      <td className="px-6 py-4 text-white/70">{item.yachtSize}</td>
                      <td className="px-6 py-4 text-emerald-400 font-semibold">€{item.minSalary.toLocaleString()}</td>
                      <td className="px-6 py-4 text-emerald-400 font-semibold">€{item.maxSalary.toLocaleString()}</td>
                      <td className="px-6 py-4">
                        <span className={`text-xs px-2 py-1 rounded-full border ${sourceColors[item.source] || 'border-white/10 bg-white/10 text-white/60'}`}>
                          {item.source}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="p-4 text-center text-white/40 text-sm border-t border-white/5">
              Showing all {salaryData.length} salary entries from {new Set(salaryData.map(d => d.source)).size} sources
            </div>
          </div>
        )}

        {/* Footer - Dynamic Sources */}
        <div className="mt-8 md:mt-12 glass-card rounded-2xl p-4 md:p-6 border border-white/5 bg-white/[0.02] backdrop-blur-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
            <h3 className="text-base md:text-lg font-semibold text-white">
              {selectedPosition && selectedYachtSize 
                ? `Active Sources for ${selectedPosition} — ${selectedYachtSize}`
                : 'All Data Sources'
              }
            </h3>
            <span className="text-sm text-white/60">
              {selectedPosition && selectedYachtSize 
                ? `${comparisonData.length} of 7 sources have data`
                : `${new Set(salaryData.map(d => d.source)).size} sources compiled`
              }
            </span>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2 md:gap-3">
            {['Flying Fish Online', 'Lighthouse Careers', 'YPI CREW', 'Morgan & Mallet', 'Dockwalk', 'Quay Group', 'Luxury Yacht Group'].map(source => {
              const isActive = selectedPosition && selectedYachtSize 
                ? comparisonData.some(d => d.source === source)
                : true;
              const hasDataGlobally = salaryData.some(d => d.source === source);
              
              return (
                <div 
                  key={source} 
                  className={`px-2 md:px-3 py-2 md:py-3 rounded-lg text-[10px] md:text-xs text-center border backdrop-blur-sm transition-all ${
                    isActive && hasDataGlobally
                      ? sourceColors[source] || 'border-white/10 bg-white/5 text-white'
                      : 'border-white/5 bg-white/[0.02] text-white/30 opacity-50'
                  }`}
                >
                  <div className="font-medium truncate">{source}</div>
                  {selectedPosition && selectedYachtSize && (
                    <div className="text-[8px] md:text-[10px] mt-1 opacity-70">
                      {isActive ? '✓ Active' : '— No data'}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          
          {selectedPosition && selectedYachtSize && comparisonData.length < 7 && (
            <p className="text-xs text-white/40 mt-4 text-center">
              {7 - comparisonData.length} sources don&apos;t have data for this specific position/size combination
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
