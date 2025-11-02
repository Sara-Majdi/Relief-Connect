'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2, Upload, AlertCircle, CheckCircle2 } from 'lucide-react';

const PRIORITY_OPTIONS = [
  { value: 'critical', label: 'Critical', color: 'red' },
  { value: 'high', label: 'High', color: 'orange' },
  { value: 'medium', label: 'Medium', color: 'yellow' },
  { value: 'low', label: 'Low', color: 'gray' }
];

const CATEGORY_OPTIONS = [
  'Emergency Supplies',
  'Food & Water',
  'Medical Supplies',
  'Shelter Materials',
  'Clothing & Blankets',
  'Hygiene Products',
  'Education Materials',
  'Other'
];

export default function ItemAllocationForm({ campaignGoal, items = [], onChange }) {
  // Create empty item template - moved before state to avoid circular dependency
  const createEmptyItem = (currentLength = 0) => {
    return {
      id: `temp-${Date.now()}-${Math.random()}`,
      name: '',
      description: '',
      target_amount: '',
      quantity: '',
      unit_cost: '',
      priority: 'medium',
      category: '',
      image_url: '',
      display_order: currentLength
    };
  };

  const [itemsList, setItemsList] = useState(items.length > 0 ? items : [createEmptyItem(0)]);
  const [totalAllocated, setTotalAllocated] = useState(0);
  const [errors, setErrors] = useState({});

  // Calculate total allocated whenever items change
  useEffect(() => {
    const total = itemsList.reduce((sum, item) => {
      const amount = parseFloat(item.target_amount) || 0;
      return sum + amount;
    }, 0);
    setTotalAllocated(total);
  }, [itemsList]);

  // Notify parent component of changes
  useEffect(() => {
    if (onChange) {
      onChange(itemsList);
    }
  }, [itemsList, onChange]);

  // Add new item
  const handleAddItem = () => {
    setItemsList([...itemsList, createEmptyItem(itemsList.length)]);
  };

  // Remove item
  const handleRemoveItem = (index) => {
    const newItems = itemsList.filter((_, i) => i !== index);
    setItemsList(newItems);
  };

  // Update item field
  const handleItemChange = (index, field, value) => {
    const newItems = [...itemsList];
    newItems[index] = {
      ...newItems[index],
      [field]: value
    };

    // Auto-calculate target_amount if quantity and unit_cost are provided
    if (field === 'quantity' || field === 'unit_cost') {
      const quantity = parseFloat(field === 'quantity' ? value : newItems[index].quantity);
      const unitCost = parseFloat(field === 'unit_cost' ? value : newItems[index].unit_cost);

      if (!isNaN(quantity) && !isNaN(unitCost) && quantity > 0 && unitCost > 0) {
        newItems[index].target_amount = (quantity * unitCost).toFixed(2);
      }
    }

    setItemsList(newItems);

    // Clear error for this field
    const newErrors = { ...errors };
    delete newErrors[`${index}-${field}`];
    setErrors(newErrors);
  };

  // Image upload handler (placeholder - integrate with your image upload service)
  const handleImageUpload = async (index, file) => {
    // TODO: Implement Supabase storage upload
    // For now, create a temporary URL
    const tempUrl = URL.createObjectURL(file);
    handleItemChange(index, 'image_url', tempUrl);
  };

  // Validate form
  const validateItems = () => {
    const newErrors = {};
    let isValid = true;

    itemsList.forEach((item, index) => {
      if (!item.name || item.name.trim() === '') {
        newErrors[`${index}-name`] = 'Name is required';
        isValid = false;
      }

      const targetAmount = parseFloat(item.target_amount);
      if (!targetAmount || targetAmount <= 0) {
        newErrors[`${index}-target_amount`] = 'Target amount must be greater than 0';
        isValid = false;
      }

      if (item.quantity && parseFloat(item.quantity) <= 0) {
        newErrors[`${index}-quantity`] = 'Quantity must be greater than 0';
        isValid = false;
      }

      if (item.unit_cost && parseFloat(item.unit_cost) <= 0) {
        newErrors[`${index}-unit_cost`] = 'Unit cost must be greater than 0';
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  // Calculate remaining allocation
  const remainingAllocation = Math.max(0, campaignGoal - totalAllocated);
  const allocationPercentage = campaignGoal > 0 ? (totalAllocated / campaignGoal) * 100 : 0;
  const isOverAllocated = totalAllocated > campaignGoal;

  return (
    <div className="space-y-6">
      {/* Allocation Summary */}
      <div className="bg-gradient-to-r from-blue-50 to-green-50 p-6 rounded-lg border border-blue-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Allocation Summary</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <p className="text-sm text-gray-600">Campaign Goal</p>
            <p className="text-2xl font-bold text-gray-900">RM {campaignGoal.toLocaleString()}</p>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm">
            <p className="text-sm text-gray-600">Total Allocated</p>
            <p className={`text-2xl font-bold ${isOverAllocated ? 'text-red-600' : 'text-blue-600'}`}>
              RM {totalAllocated.toLocaleString()}
            </p>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm">
            <p className="text-sm text-gray-600">Remaining</p>
            <p className={`text-2xl font-bold ${isOverAllocated ? 'text-red-600' : 'text-green-600'}`}>
              RM {remainingAllocation.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Allocation Progress</span>
            <span className={isOverAllocated ? 'text-red-600 font-semibold' : ''}>
              {allocationPercentage.toFixed(1)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                isOverAllocated
                  ? 'bg-red-500'
                  : allocationPercentage >= 90
                  ? 'bg-green-500'
                  : allocationPercentage >= 50
                  ? 'bg-blue-500'
                  : 'bg-yellow-500'
              }`}
              style={{ width: `${Math.min(allocationPercentage, 100)}%` }}
            />
          </div>
        </div>

        {isOverAllocated && (
          <div className="mt-4 flex items-start gap-2 text-red-700 bg-red-50 p-3 rounded-lg border border-red-200">
            <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold">Allocation exceeds campaign goal</p>
              <p className="text-sm">Please reduce item allocations by RM {(totalAllocated - campaignGoal).toLocaleString()}</p>
            </div>
          </div>
        )}
      </div>

      {/* Items List */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-800">Fundraising Items</h3>
          <button
            type="button"
            onClick={handleAddItem}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Item
          </button>
        </div>

        {itemsList.map((item, index) => (
          <div key={item.id} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <h4 className="text-md font-semibold text-gray-700">Item {index + 1}</h4>
              {itemsList.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemoveItem(index)}
                  className="text-red-600 hover:text-red-800 p-1"
                  title="Remove item"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Item Name */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Item Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={item.name}
                  onChange={(e) => handleItemChange(index, 'name', e.target.value)}
                  placeholder="e.g., Water Bottles, Blankets, Medical Kits"
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors[`${index}-name`] ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors[`${index}-name`] && (
                  <p className="text-red-500 text-sm mt-1">{errors[`${index}-name`]}</p>
                )}
              </div>

              {/* Description */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={item.description}
                  onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                  placeholder="Brief description of this item and its purpose"
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Quantity */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quantity
                </label>
                <input
                  type="number"
                  value={item.quantity}
                  onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                  placeholder="e.g., 1000"
                  min="0"
                  step="1"
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors[`${index}-quantity`] ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors[`${index}-quantity`] && (
                  <p className="text-red-500 text-sm mt-1">{errors[`${index}-quantity`]}</p>
                )}
              </div>

              {/* Unit Cost */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Unit Cost (RM)
                </label>
                <input
                  type="number"
                  value={item.unit_cost}
                  onChange={(e) => handleItemChange(index, 'unit_cost', e.target.value)}
                  placeholder="e.g., 2.50"
                  min="0"
                  step="0.01"
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors[`${index}-unit_cost`] ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors[`${index}-unit_cost`] && (
                  <p className="text-red-500 text-sm mt-1">{errors[`${index}-unit_cost`]}</p>
                )}
              </div>

              {/* Target Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Target Amount (RM) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={item.target_amount}
                  onChange={(e) => handleItemChange(index, 'target_amount', e.target.value)}
                  placeholder="e.g., 2500"
                  min="0"
                  step="0.01"
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors[`${index}-target_amount`] ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors[`${index}-target_amount`] && (
                  <p className="text-red-500 text-sm mt-1">{errors[`${index}-target_amount`]}</p>
                )}
                {item.quantity && item.unit_cost && (
                  <p className="text-xs text-gray-500 mt-1">
                    Auto-calculated: {item.quantity} × RM {item.unit_cost}
                  </p>
                )}
              </div>

              {/* Priority */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Priority
                </label>
                <select
                  value={item.priority}
                  onChange={(e) => handleItemChange(index, 'priority', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {PRIORITY_OPTIONS.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Category */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  value={item.category}
                  onChange={(e) => handleItemChange(index, 'category', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select a category</option>
                  {CATEGORY_OPTIONS.map(category => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              {/* Image Upload */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Item Image
                </label>
                <div className="flex items-center gap-4">
                  {item.image_url && (
                    <img
                      src={item.image_url}
                      alt={item.name}
                      className="w-20 h-20 object-cover rounded-lg border border-gray-300"
                    />
                  )}
                  <label className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                    <Upload className="w-4 h-4" />
                    <span className="text-sm">Upload Image</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleImageUpload(index, file);
                      }}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Help Text */}
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
        <div className="flex items-start gap-2">
          <CheckCircle2 className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-blue-900">
            <p className="font-semibold mb-1">Tips for Item Allocation:</p>
            <ul className="list-disc list-inside space-y-1 text-blue-800">
              <li>Break down your campaign goal into specific, measurable items</li>
              <li>Set realistic target amounts for each item</li>
              <li>Prioritize critical items so donors know what's most urgent</li>
              <li>You don't need to allocate 100% - unallocated funds create a general pool</li>
              <li>Add clear descriptions to help donors understand each item's purpose</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
