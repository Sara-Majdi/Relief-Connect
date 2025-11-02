'use client';

import { useState, useMemo } from 'react';
import { AlertTriangle, Package, TrendingUp, Filter, CheckCircle } from 'lucide-react';

const PRIORITY_CONFIG = {
  critical: { label: 'Critical', color: 'bg-red-100 text-red-800 border-red-300', icon: AlertTriangle },
  high: { label: 'High', color: 'bg-orange-100 text-orange-800 border-orange-300', icon: TrendingUp },
  medium: { label: 'Medium', color: 'bg-yellow-100 text-yellow-800 border-yellow-300', icon: Package },
  low: { label: 'Low', color: 'bg-gray-100 text-gray-800 border-gray-300', icon: Package }
};

const PROGRESS_COLORS = {
  0: 'bg-gray-200',
  25: 'bg-red-500',
  50: 'bg-orange-500',
  75: 'bg-yellow-500',
  90: 'bg-green-500',
  100: 'bg-blue-500'
};

function getProgressColor(percentage) {
  if (percentage >= 100) return PROGRESS_COLORS[100];
  if (percentage >= 90) return PROGRESS_COLORS[90];
  if (percentage >= 75) return PROGRESS_COLORS[75];
  if (percentage >= 50) return PROGRESS_COLORS[50];
  if (percentage >= 25) return PROGRESS_COLORS[25];
  return PROGRESS_COLORS[0];
}

export default function ItemProgressCards({ items = [], onDonateToItem, showFilters = true }) {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedPriority, setSelectedPriority] = useState('all');
  const [sortBy, setSortBy] = useState('display_order'); // display_order, progress, priority, name

  // Extract unique categories
  const categories = useMemo(() => {
    const cats = new Set(items.filter(item => item.category).map(item => item.category));
    return ['all', ...Array.from(cats)];
  }, [items]);

  // Filter and sort items
  const filteredItems = useMemo(() => {
    let filtered = [...items];

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }

    // Filter by priority
    if (selectedPriority !== 'all') {
      filtered = filtered.filter(item => item.priority === selectedPriority);
    }

    // Sort items
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'progress':
          return (b.current_amount / b.target_amount) - (a.current_amount / a.target_amount);
        case 'priority':
          const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
          return priorityOrder[a.priority] - priorityOrder[b.priority];
        case 'name':
          return a.name.localeCompare(b.name);
        case 'display_order':
        default:
          return (a.display_order || 0) - (b.display_order || 0);
      }
    });

    return filtered;
  }, [items, selectedCategory, selectedPriority, sortBy]);

  // Calculate summary stats
  const stats = useMemo(() => {
    const total = items.length;
    const fullyFunded = items.filter(item => item.current_amount >= item.target_amount).length;
    const inProgress = items.filter(item => item.current_amount > 0 && item.current_amount < item.target_amount).length;
    const notStarted = items.filter(item => item.current_amount === 0).length;

    return { total, fullyFunded, inProgress, notStarted };
  }, [items]);

  if (items.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
        <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600 text-lg font-medium">No items allocated yet</p>
        <p className="text-gray-500 text-sm mt-2">This campaign hasn't set up specific funding items.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <p className="text-sm text-gray-600 mb-1">Total Items</p>
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg border border-green-200 shadow-sm">
          <p className="text-sm text-green-700 mb-1">Fully Funded</p>
          <p className="text-2xl font-bold text-green-900">{stats.fullyFunded}</p>
        </div>
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 shadow-sm">
          <p className="text-sm text-blue-700 mb-1">In Progress</p>
          <p className="text-2xl font-bold text-blue-900">{stats.inProgress}</p>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 shadow-sm">
          <p className="text-sm text-gray-600 mb-1">Not Started</p>
          <p className="text-2xl font-bold text-gray-900">{stats.notStarted}</p>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <Filter className="w-5 h-5 text-gray-600" />
            <h3 className="font-semibold text-gray-800">Filter & Sort</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>
                    {cat === 'all' ? 'All Categories' : cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Priority Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
              <select
                value={selectedPriority}
                onChange={(e) => setSelectedPriority(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Priorities</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>

            {/* Sort By */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="display_order">Default Order</option>
                <option value="priority">Priority (High to Low)</option>
                <option value="progress">Progress (High to Low)</option>
                <option value="name">Name (A-Z)</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map((item) => {
          const progressPercentage = item.target_amount > 0
            ? Math.min(100, Math.round((item.current_amount / item.target_amount) * 100))
            : 0;
          const isFullyFunded = item.current_amount >= item.target_amount;
          const priorityConfig = PRIORITY_CONFIG[item.priority] || PRIORITY_CONFIG.medium;
          const PriorityIcon = priorityConfig.icon;

          return (
            <div
              key={item.id}
              className={`bg-white rounded-lg shadow-md overflow-hidden border-2 transition-all hover:shadow-lg ${
                isFullyFunded ? 'border-green-300' : 'border-gray-200'
              }`}
            >
              {/* Image */}
              {item.image_url ? (
                <div className="relative h-48 bg-gray-200">
                  <img
                    src={item.image_url}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                  {isFullyFunded && (
                    <div className="absolute top-2 right-2 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1 shadow-lg">
                      <CheckCircle className="w-4 h-4" />
                      Funded!
                    </div>
                  )}
                </div>
              ) : (
                <div className="relative h-48 bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                  <Package className="w-16 h-16 text-blue-400" />
                  {isFullyFunded && (
                    <div className="absolute top-2 right-2 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1 shadow-lg">
                      <CheckCircle className="w-4 h-4" />
                      Funded!
                    </div>
                  )}
                </div>
              )}

              {/* Content */}
              <div className="p-5">
                {/* Priority Badge */}
                <div className="flex items-center justify-between mb-3">
                  <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border ${priorityConfig.color}`}>
                    <PriorityIcon className="w-3 h-3" />
                    {priorityConfig.label}
                  </span>
                  {item.category && (
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                      {item.category}
                    </span>
                  )}
                </div>

                {/* Item Name */}
                <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-1">
                  {item.name}
                </h3>

                {/* Description */}
                {item.description && (
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {item.description}
                  </p>
                )}

                {/* Quantity Info */}
                {item.quantity && (
                  <div className="text-sm text-gray-700 mb-3">
                    <span className="font-medium">Target:</span> {item.quantity.toLocaleString()} units
                    {item.unit_cost && (
                      <span className="text-gray-500"> @ RM {parseFloat(item.unit_cost).toFixed(2)}/unit</span>
                    )}
                  </div>
                )}

                {/* Progress */}
                <div className="mb-4">
                  <div className="flex justify-between items-baseline mb-2">
                    <span className="text-sm font-medium text-gray-700">Progress</span>
                    <span className={`text-sm font-bold ${
                      isFullyFunded ? 'text-green-600' : 'text-gray-900'
                    }`}>
                      {progressPercentage}%
                    </span>
                  </div>

                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${getProgressColor(progressPercentage)}`}
                      style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                    />
                  </div>

                  <div className="flex justify-between items-baseline mt-2">
                    <span className="text-sm font-semibold text-gray-900">
                      RM {parseFloat(item.current_amount).toLocaleString()}
                    </span>
                    <span className="text-sm text-gray-600">
                      of RM {parseFloat(item.target_amount).toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Remaining Amount */}
                {!isFullyFunded && (
                  <div className="text-sm text-gray-600 mb-4 bg-gray-50 p-2 rounded">
                    <span className="font-medium">Still needed:</span>{' '}
                    <span className="text-blue-600 font-bold">
                      RM {(item.target_amount - item.current_amount).toLocaleString()}
                    </span>
                  </div>
                )}

                {/* Donate Button */}
                <button
                  onClick={() => onDonateToItem && onDonateToItem(item)}
                  disabled={isFullyFunded}
                  className={`w-full py-3 rounded-lg font-semibold transition-all ${
                    isFullyFunded
                      ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg'
                  }`}
                >
                  {isFullyFunded ? 'Fully Funded' : 'Donate to This Item'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* No Results */}
      {filteredItems.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
          <Filter className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 text-lg font-medium">No items match your filters</p>
          <button
            onClick={() => {
              setSelectedCategory('all');
              setSelectedPriority('all');
            }}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
}
