'use client';

import { useMemo } from 'react';
import { PieChart, TrendingUp, Package, DollarSign, AlertCircle } from 'lucide-react';

const PRIORITY_COLORS = {
  critical: { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-300', chart: '#ef4444' },
  high: { bg: 'bg-orange-100', text: 'text-orange-800', border: 'border-orange-300', chart: '#f97316' },
  medium: { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-300', chart: '#eab308' },
  low: { bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-300', chart: '#6b7280' }
};

const CATEGORY_COLORS = [
  '#3b82f6', // blue
  '#10b981', // green
  '#f59e0b', // amber
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#14b8a6', // teal
  '#f97316', // orange
  '#6366f1'  // indigo
];

export default function AllocationBreakdown({ campaign, items = [], summary = null }) {
  // Calculate metrics
  const metrics = useMemo(() => {
    const totalItems = items.length;
    const totalAllocated = items.reduce((sum, item) => sum + parseFloat(item.target_amount), 0);
    const totalItemsRaised = items.reduce((sum, item) => sum + parseFloat(item.current_amount), 0);
    const campaignGoal = parseFloat(campaign?.goal || 0);
    const campaignRaised = parseFloat(campaign?.raised || 0);
    const unallocatedTarget = Math.max(0, campaignGoal - totalAllocated);
    const unallocatedRaised = Math.max(0, campaignRaised - totalItemsRaised);

    const fullyFunded = items.filter(item => item.current_amount >= item.target_amount).length;
    const partiallyFunded = items.filter(item => item.current_amount > 0 && item.current_amount < item.target_amount).length;
    const unfunded = items.filter(item => item.current_amount === 0).length;

    // Group by category
    const byCategory = items.reduce((acc, item) => {
      const cat = item.category || 'Other';
      if (!acc[cat]) {
        acc[cat] = { count: 0, allocated: 0, raised: 0 };
      }
      acc[cat].count += 1;
      acc[cat].allocated += parseFloat(item.target_amount);
      acc[cat].raised += parseFloat(item.current_amount);
      return acc;
    }, {});

    // Group by priority
    const byPriority = items.reduce((acc, item) => {
      const pri = item.priority || 'medium';
      if (!acc[pri]) {
        acc[pri] = { count: 0, allocated: 0, raised: 0, needed: 0 };
      }
      acc[pri].count += 1;
      acc[pri].allocated += parseFloat(item.target_amount);
      acc[pri].raised += parseFloat(item.current_amount);
      acc[pri].needed += Math.max(0, item.target_amount - item.current_amount);
      return acc;
    }, {});

    return {
      totalItems,
      totalAllocated,
      totalItemsRaised,
      campaignGoal,
      campaignRaised,
      unallocatedTarget,
      unallocatedRaised,
      fullyFunded,
      partiallyFunded,
      unfunded,
      byCategory,
      byPriority,
      allocationPercentage: campaignGoal > 0 ? (totalAllocated / campaignGoal) * 100 : 0,
      itemsFundingPercentage: totalAllocated > 0 ? (totalItemsRaised / totalAllocated) * 100 : 0
    };
  }, [campaign, items]);

  // Prepare pie chart data (simple CSS-based pie chart)
  const categoryChartData = useMemo(() => {
    const data = Object.entries(metrics.byCategory).map(([category, stats], index) => ({
      category,
      ...stats,
      color: CATEGORY_COLORS[index % CATEGORY_COLORS.length],
      percentage: metrics.totalAllocated > 0 ? (stats.allocated / metrics.totalAllocated) * 100 : 0
    }));

    // Add unallocated if exists
    if (metrics.unallocatedTarget > 0) {
      data.push({
        category: 'Unallocated Fund',
        allocated: metrics.unallocatedTarget,
        raised: metrics.unallocatedRaised,
        color: '#e5e7eb',
        percentage: metrics.campaignGoal > 0 ? (metrics.unallocatedTarget / metrics.campaignGoal) * 100 : 0
      });
    }

    return data;
  }, [metrics]);

  if (items.length === 0) {
    return (
      <div className="bg-gray-50 p-8 rounded-lg border border-gray-200 text-center">
        <Package className="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <p className="text-gray-600 font-medium">No item allocations set up</p>
        <p className="text-gray-500 text-sm mt-1">This campaign uses traditional fundraising without item breakdowns.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <PieChart className="w-6 h-6 text-blue-600" />
        <h2 className="text-2xl font-bold text-gray-900">Allocation Breakdown</h2>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 p-5 rounded-lg border border-blue-200">
          <div className="flex items-center gap-2 mb-2">
            <Package className="w-5 h-5 text-blue-600" />
            <p className="text-sm font-medium text-blue-900">Total Items</p>
          </div>
          <p className="text-3xl font-bold text-blue-900">{metrics.totalItems}</p>
        </div>

        <div className="bg-green-50 p-5 rounded-lg border border-green-200">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-green-600" />
            <p className="text-sm font-medium text-green-900">Allocated</p>
          </div>
          <p className="text-3xl font-bold text-green-900">RM {metrics.totalAllocated.toLocaleString()}</p>
          <p className="text-xs text-green-700 mt-1">{metrics.allocationPercentage.toFixed(1)}% of goal</p>
        </div>

        <div className="bg-purple-50 p-5 rounded-lg border border-purple-200">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-5 h-5 text-purple-600" />
            <p className="text-sm font-medium text-purple-900">Items Raised</p>
          </div>
          <p className="text-3xl font-bold text-purple-900">RM {metrics.totalItemsRaised.toLocaleString()}</p>
          <p className="text-xs text-purple-700 mt-1">{metrics.itemsFundingPercentage.toFixed(1)}% funded</p>
        </div>

        <div className="bg-amber-50 p-5 rounded-lg border border-amber-200">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="w-5 h-5 text-amber-600" />
            <p className="text-sm font-medium text-amber-900">Unallocated</p>
          </div>
          <p className="text-3xl font-bold text-amber-900">RM {metrics.unallocatedTarget.toLocaleString()}</p>
          <p className="text-xs text-amber-700 mt-1">General fund pool</p>
        </div>
      </div>

      {/* Funding Status */}
      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Funding Status</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
            <p className="text-3xl font-bold text-green-600">{metrics.fullyFunded}</p>
            <p className="text-sm text-green-800 mt-1">Fully Funded</p>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-3xl font-bold text-blue-600">{metrics.partiallyFunded}</p>
            <p className="text-sm text-blue-800 mt-1">In Progress</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-3xl font-bold text-gray-600">{metrics.unfunded}</p>
            <p className="text-sm text-gray-800 mt-1">Not Started</p>
          </div>
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Breakdown by Category</h3>

        {/* Legend and Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Simple Donut Chart Visualization */}
          <div className="flex items-center justify-center">
            <div className="relative w-64 h-64">
              {/* Simple stacked progress ring */}
              <svg viewBox="0 0 100 100" className="transform -rotate-90">
                {categoryChartData.map((item, index) => {
                  const prevPercentage = categoryChartData
                    .slice(0, index)
                    .reduce((sum, i) => sum + i.percentage, 0);
                  const circumference = 2 * Math.PI * 40;
                  const strokeDasharray = `${(item.percentage / 100) * circumference} ${circumference}`;
                  const strokeDashoffset = -((prevPercentage / 100) * circumference);

                  return (
                    <circle
                      key={item.category}
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      stroke={item.color}
                      strokeWidth="20"
                      strokeDasharray={strokeDasharray}
                      strokeDashoffset={strokeDashoffset}
                      className="transition-all duration-300"
                    />
                  );
                })}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <p className="text-sm text-gray-600">Total Goal</p>
                <p className="text-xl font-bold text-gray-900">RM {metrics.campaignGoal.toLocaleString()}</p>
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="space-y-2">
            {categoryChartData.map((item) => (
              <div key={item.category} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div
                    className="w-4 h-4 rounded-full flex-shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{item.category}</p>
                    {item.count && <p className="text-xs text-gray-600">{item.count} items</p>}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">RM {item.allocated.toLocaleString()}</p>
                  <p className="text-xs text-gray-600">{item.percentage.toFixed(1)}%</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Priority Breakdown */}
      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Breakdown by Priority</h3>
        <div className="space-y-3">
          {['critical', 'high', 'medium', 'low'].map((priority) => {
            const data = metrics.byPriority[priority];
            if (!data || data.count === 0) return null;

            const config = PRIORITY_COLORS[priority];
            const progressPercentage = data.allocated > 0 ? (data.raised / data.allocated) * 100 : 0;

            return (
              <div key={priority} className={`p-4 rounded-lg border ${config.border} ${config.bg}`}>
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className={`font-semibold ${config.text} capitalize`}>{priority} Priority</p>
                    <p className="text-sm text-gray-600">{data.count} items</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-lg font-bold ${config.text}`}>RM {data.raised.toLocaleString()}</p>
                    <p className="text-xs text-gray-600">of RM {data.allocated.toLocaleString()}</p>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-white bg-opacity-50 rounded-full h-2 mt-2">
                  <div
                    className="h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${Math.min(progressPercentage, 100)}%`,
                      backgroundColor: config.chart
                    }}
                  />
                </div>

                <div className="flex justify-between text-xs mt-1">
                  <span className="text-gray-600">{progressPercentage.toFixed(1)}% funded</span>
                  {data.needed > 0 && (
                    <span className={`font-semibold ${config.text}`}>
                      RM {data.needed.toLocaleString()} needed
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Detailed Table */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">All Items</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Item
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Priority
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Target
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Raised
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Progress
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {items.map((item) => {
                const progress = item.target_amount > 0
                  ? Math.min(100, (item.current_amount / item.target_amount) * 100)
                  : 0;
                const config = PRIORITY_COLORS[item.priority] || PRIORITY_COLORS.medium;

                return (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-gray-900">{item.name}</p>
                      {item.description && (
                        <p className="text-xs text-gray-500 line-clamp-1">{item.description}</p>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {item.category || '-'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${config.bg} ${config.text}`}>
                        {item.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 text-right font-medium">
                      RM {parseFloat(item.target_amount).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 text-right font-medium">
                      RM {parseFloat(item.current_amount).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              progress >= 100 ? 'bg-green-500' :
                              progress >= 75 ? 'bg-blue-500' :
                              progress >= 50 ? 'bg-yellow-500' :
                              progress >= 25 ? 'bg-orange-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium text-gray-700 w-12">
                          {progress.toFixed(0)}%
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
