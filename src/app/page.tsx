'use client';

import { useState } from 'react';
import { 
  salaryData, 
  getUniquePositions, 
  getUniqueYachtSizes, 
  getAverageSalary,
  SalaryRange,
  yachtSizes,
  positions 
} from '@/lib/salary-data';
import { 
  Anchor, 
  Wrench, 
  Sparkles, 
  ChefHat, 
  DollarSign,
  TrendingUp,
  Building2,
  Info
} from 'lucide-react';

const categoryIcons = {
  Deck: Anchor,
  Engineering: Wrench,
  Interior: Sparkles,
  Culinary: ChefHat,
};

const categoryColors = {
  Deck: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  Engineering: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  Interior: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  Culinary: 'bg-red-500/10 text-red-400 border-red-500/20',
};

export default function SalaryGuide() {
  const [selectedPosition, setSelectedPosition] = useState<string>('');
  const [selectedYachtSize, setSelectedYachtSize] = useState<string>('');

  const filteredData = salaryData.filter(d => {
    if (selectedPosition && d.position !== selectedPosition) return false;
    if (selectedYachtSize && d.yachtSize !== selectedYachtSize) return false;
    return true;
  });

  const groupedByPosition = filteredData.reduce((acc, item) => {
    if (!acc[item.position]) {
      acc[item.position] = [];
    }
    acc[item.position].push(item);
    return acc;
  }, {} as Record<string, SalaryRange[]>);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Header */}
      <div className="border-b border-white/5 bg-white/[0.02]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
              <DollarSign className="w-8 h-8 text-emerald-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Yacht Crew Salary Guide 2026</h1>
              <p className="text-white/60 mt-1">Compare salaries across positions and yacht sizes from industry-leading sources</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div className="space-y-2">
            <label className="text-sm font-medium text-white/80 flex items-center gap-2">
              <Anchor className="w-4 h-4" />
              Position
            </label>
            <select
              value={selectedPosition}
              onChange={(e) => setSelectedPosition(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500/50"
            >
              <option value="" className="bg-slate-900">All Positions</option>
              {positions.map(pos => (
                <option key={pos} value={pos} className="bg-slate-900">{pos}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-white/80 flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              Yacht Size
            </label>
            <select
              value={selectedYachtSize}
              onChange={(e) => setSelectedYachtSize(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500/50"
            >
              <option value="" className="bg-slate-900">All Sizes</option>
              {yachtSizes.map(size => (
                <option key={size} value={size} className="bg-slate-900">{size}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Stats Cards */}
        {selectedPosition && selectedYachtSize && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {(() => {
              const avg = getAverageSalary(selectedPosition, selectedYachtSize);
              return (
                <>
                  <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-2">
                      <TrendingUp className="w-5 h-5 text-emerald-400" />
                      <span className="text-white/60 text-sm">Average Salary</span>
                    </div>
                    <p className="text-2xl font-bold text-white">€{avg.avg.toLocaleString()}</p>
                    <p className="text-white/40 text-sm">per month</p>
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-2">
                      <DollarSign className="w-5 h-5 text-blue-400" />
                      <span className="text-white/60 text-sm">Range (Min - Max)</span>
                    </div>
                    <p className="text-2xl font-bold text-white">€{avg.min.toLocaleString()} - €{avg.max.toLocaleString()}</p>
                    <p className="text-white/40 text-sm">per month</p>
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-2">
                      <Info className="w-5 h-5 text-purple-400" />
                      <span className="text-white/60 text-sm">Data Sources</span>
                    </div>
                    <p className="text-lg font-bold text-white">{getAverageSalary(selectedPosition, selectedYachtSize).avg > 0 ? '3 sources' : 'N/A'}</p>
                    <p className="text-white/40 text-sm">Flying Fish, Lighthouse, YPI</p>
                  </div>
                </>
              );
            })()}
          </div>
        )}

        {/* Results */}
        <div className="space-y-6">
          {Object.entries(groupedByPosition).map(([position, items]) => {
            const category = items[0]?.category || 'Deck';
            const Icon = categoryIcons[category];
            const colorClass = categoryColors[category];
            
            return (
              <div key={position} className="bg-white/[0.03] border border-white/10 rounded-2xl overflow-hidden">
                <div className="p-6 border-b border-white/5">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl border ${colorClass}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">{position}</h3>
                      <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border ${colorClass}`}>
                        {category} Department
                      </span>
                    </div>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/5">
                        <th className="text-left px-6 py-4 text-sm font-medium text-white/60">Yacht Size</th>
                        <th className="text-left px-6 py-4 text-sm font-medium text-white/60">Min Salary</th>
                        <th className="text-left px-6 py-4 text-sm font-medium text-white/60">Max Salary</th>
                        <th className="text-left px-6 py-4 text-sm font-medium text-white/60">Average</th>
                        <th className="text-left px-6 py-4 text-sm font-medium text-white/60">Source</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items
                        .sort((a, b) => {
                          const sizeOrder = yachtSizes.indexOf(a.yachtSize) - yachtSizes.indexOf(b.yachtSize);
                          return sizeOrder;
                        })
                        .map((item, idx) => (
                        <tr key={idx} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02]">
                          <td className="px-6 py-4 text-white font-medium">{item.yachtSize}</td>
                          <td className="px-6 py-4 text-white/80">€{item.minSalary.toLocaleString()}</td>
                          <td className="px-6 py-4 text-white/80">€{item.maxSalary.toLocaleString()}</td>
                          <td className="px-6 py-4">
                            <span className="text-emerald-400 font-medium">
                              €{Math.round((item.minSalary + item.maxSalary) / 2).toLocaleString()}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-xs px-2 py-1 rounded bg-white/5 text-white/60">
                              {item.source}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>

        {filteredData.length === 0 && (
          <div className="text-center py-20">
            <DollarSign className="w-16 h-16 text-white/20 mx-auto mb-4" />
            <p className="text-white/60 text-lg">No salary data found for the selected filters.</p>
            <p className="text-white/40 text-sm mt-2">Try adjusting your position or yacht size selection.</p>
          </div>
        )}

        {/* Sources */}
        <div className="mt-12 p-6 bg-white/[0.02] border border-white/10 rounded-2xl">
          <h3 className="text-lg font-bold text-white mb-4">Data Sources</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="space-y-2">
              <p className="font-medium text-white">Flying Fish Online</p>
              <p className="text-white/60">Industry training provider with comprehensive salary benchmarks for entry to senior positions.</p>
            </div>
            <div className="space-y-2">
              <p className="font-medium text-white">Lighthouse Careers</p>
              <p className="text-white/60">Premier recruitment agency with 20+ years experience and 300+ real placements annually.</p>
            </div>
            <div className="space-y-2">
              <p className="font-medium text-white">YPI CREW</p>
              <p className="text-white/60">Leading yacht crew recruitment with live market data from active placements.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
