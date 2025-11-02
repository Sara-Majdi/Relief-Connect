'use client';

import { useState, useEffect } from 'react';
import { X, Heart, Package, TrendingUp, AlertCircle, CheckCircle2, Info } from 'lucide-react';

const PRESET_AMOUNTS = [50, 100, 200, 500, 1000];
const TIP_PERCENTAGES = [0, 5, 10, 15, 20];

export default function ItemDonationModal({
  isOpen,
  onClose,
  campaign,
  selectedItem = null, // If null, it's a general campaign donation
  onSubmit
}) {
  const [donationType, setDonationType] = useState(selectedItem ? 'item' : 'general');
  const [selectedItemId, setSelectedItemId] = useState(selectedItem?.id || null);
  const [amount, setAmount] = useState('');
  const [customAmount, setCustomAmount] = useState('');
  const [tipPercentage, setTipPercentage] = useState(10);
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringInterval, setRecurringInterval] = useState('monthly');
  const [isProcessing, setIsProcessing] = useState(false);

  // Reset form when modal opens/closes or item changes
  useEffect(() => {
    if (isOpen) {
      setDonationType(selectedItem ? 'item' : 'general');
      setSelectedItemId(selectedItem?.id || null);
      setAmount('');
      setCustomAmount('');
    }
  }, [isOpen, selectedItem]);

  // Calculate amounts
  const donationAmount = parseFloat(customAmount || amount || 0);
  const tipAmount = (donationAmount * tipPercentage) / 100;
  const totalAmount = donationAmount + tipAmount;

  // Get current item details
  const currentItem = selectedItem || (selectedItemId && campaign?.items?.find(i => i.id === selectedItemId));

  // Validate donation amount
  const validateAmount = () => {
    if (donationAmount <= 0) {
      return { valid: false, message: 'Please enter a valid donation amount' };
    }

    if (donationAmount < 10) {
      return { valid: false, message: 'Minimum donation amount is RM 10' };
    }

    // Check if donating to a fully funded item
    if (currentItem && currentItem.current_amount >= currentItem.target_amount) {
      return { valid: false, message: 'This item is already fully funded' };
    }

    // Warn if donation exceeds item's remaining need
    if (currentItem) {
      const remaining = currentItem.target_amount - currentItem.current_amount;
      if (donationAmount > remaining) {
        return {
          valid: true,
          warning: `This item only needs RM ${remaining.toFixed(2)} more. Your donation will help fund this item and the excess will support other campaign needs.`
        };
      }
    }

    return { valid: true };
  };

  const validation = validateAmount();

  // Handle form submission
  const handleSubmit = async () => {
    if (!validation.valid) return;

    setIsProcessing(true);

    try {
      await onSubmit({
        campaign_id: campaign.id,
        amount: donationAmount,
        tip_amount: tipAmount,
        total_amount: totalAmount,
        allocation_type: donationType,
        item_id: donationType === 'item' ? selectedItemId : null,
        is_recurring: isRecurring,
        recurring_interval: isRecurring ? recurringInterval : null
      });
    } catch (error) {
      console.error('Donation error:', error);
      alert('Failed to process donation. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">Make a Donation</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Campaign Info */}
          <div className="bg-gradient-to-r from-blue-50 to-green-50 p-4 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-gray-900 mb-1">{campaign.title}</h3>
            <p className="text-sm text-gray-600">
              RM {parseFloat(campaign.raised || 0).toLocaleString()} raised of RM {parseFloat(campaign.goal).toLocaleString()} goal
            </p>
          </div>

          {/* Donation Type Selection */}
          {!selectedItem && campaign.items && campaign.items.length > 0 && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                How would you like to donate?
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setDonationType('general');
                    setSelectedItemId(null);
                  }}
                  className={`p-4 rounded-lg border-2 transition-all text-left ${
                    donationType === 'general'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <Heart className={`w-5 h-5 ${donationType === 'general' ? 'text-blue-600' : 'text-gray-400'}`} />
                    <span className="font-semibold text-gray-900">General Campaign</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Support the entire campaign. Funds will be distributed to items that need it most.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setDonationType('item')}
                  className={`p-4 rounded-lg border-2 transition-all text-left ${
                    donationType === 'item'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <Package className={`w-5 h-5 ${donationType === 'item' ? 'text-blue-600' : 'text-gray-400'}`} />
                    <span className="font-semibold text-gray-900">Specific Item</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Choose a specific item to fund from this campaign.
                  </p>
                </button>
              </div>
            </div>
          )}

          {/* Item Selection (if item donation type) */}
          {donationType === 'item' && !selectedItem && campaign.items && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Select an Item
              </label>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {campaign.items
                  .filter(item => item.current_amount < item.target_amount) // Only show non-fully-funded items
                  .map(item => {
                    const progressPercentage = item.target_amount > 0
                      ? Math.round((item.current_amount / item.target_amount) * 100)
                      : 0;
                    const remaining = item.target_amount - item.current_amount;

                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setSelectedItemId(item.id)}
                        className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                          selectedItemId === item.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-semibold text-gray-900">{item.name}</h4>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            item.priority === 'critical' ? 'bg-red-100 text-red-800' :
                            item.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {item.priority}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600 mb-2">
                          RM {item.current_amount.toLocaleString()} / RM {item.target_amount.toLocaleString()} ({progressPercentage}%)
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-500 h-2 rounded-full transition-all"
                            style={{ width: `${progressPercentage}%` }}
                          />
                        </div>
                        <div className="text-sm text-blue-600 font-medium mt-2">
                          RM {remaining.toFixed(2)} still needed
                        </div>
                      </button>
                    );
                  })}
              </div>
            </div>
          )}

          {/* Selected Item Info */}
          {currentItem && (
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="flex items-start gap-3">
                <TrendingUp className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Donating to: {currentItem.name}</h4>
                  <p className="text-sm text-gray-700 mb-2">{currentItem.description}</p>
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">Target:</span> RM {currentItem.target_amount.toLocaleString()} |
                    <span className="font-medium ml-2">Raised:</span> RM {currentItem.current_amount.toLocaleString()} |
                    <span className="font-medium ml-2 text-blue-600">Needed:</span> RM {(currentItem.target_amount - currentItem.current_amount).toFixed(2)}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* General Donation Info */}
          {donationType === 'general' && campaign.items && campaign.items.length > 0 && (
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">How Your Donation Helps</h4>
                  <p className="text-sm text-gray-700">
                    Your general donation will be automatically distributed to the items that need funding most,
                    prioritizing critical and high-priority items with the greatest need.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Amount Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Donation Amount (RM)
            </label>

            {/* Preset Amounts */}
            <div className="grid grid-cols-3 md:grid-cols-5 gap-3 mb-4">
              {PRESET_AMOUNTS.map(preset => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => {
                    setAmount(preset.toString());
                    setCustomAmount('');
                  }}
                  className={`py-3 px-4 rounded-lg border-2 font-semibold transition-all ${
                    amount === preset.toString() && !customAmount
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300 text-gray-700'
                  }`}
                >
                  RM {preset}
                </button>
              ))}
            </div>

            {/* Custom Amount */}
            <div>
              <label className="block text-sm text-gray-600 mb-2">Or enter custom amount:</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
                  RM
                </span>
                <input
                  type="number"
                  value={customAmount}
                  onChange={(e) => {
                    setCustomAmount(e.target.value);
                    setAmount('');
                  }}
                  placeholder="0.00"
                  min="10"
                  step="0.01"
                  className="w-full pl-14 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-lg font-semibold"
                />
              </div>
            </div>
          </div>

          {/* Platform Tip */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Support Relief Connect ({tipPercentage}%)
            </label>
            <p className="text-sm text-gray-600 mb-3">
              Optional tip to help us keep the platform running and support more campaigns.
            </p>
            <div className="grid grid-cols-5 gap-2">
              {TIP_PERCENTAGES.map(tip => (
                <button
                  key={tip}
                  type="button"
                  onClick={() => setTipPercentage(tip)}
                  className={`py-2 rounded-lg border-2 font-medium transition-all ${
                    tipPercentage === tip
                      ? 'border-green-500 bg-green-50 text-green-700'
                      : 'border-gray-200 hover:border-gray-300 text-gray-700'
                  }`}
                >
                  {tip}%
                </button>
              ))}
            </div>
          </div>

          {/* Recurring Donation */}
          <div className="border-t border-gray-200 pt-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={isRecurring}
                onChange={(e) => setIsRecurring(e.target.checked)}
                className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm font-semibold text-gray-700">
                Make this a recurring donation
              </span>
            </label>

            {isRecurring && (
              <div className="mt-3 ml-8">
                <select
                  value={recurringInterval}
                  onChange={(e) => setRecurringInterval(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>
            )}
          </div>

          {/* Validation Messages */}
          {!validation.valid && donationAmount > 0 && (
            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-red-700">{validation.message}</p>
            </div>
          )}

          {validation.warning && (
            <div className="flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-yellow-700">{validation.warning}</p>
            </div>
          )}

          {/* Summary */}
          {donationAmount > 0 && (
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <h4 className="font-semibold text-gray-900 mb-3">Donation Summary</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Donation Amount:</span>
                  <span className="font-semibold text-gray-900">RM {donationAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Platform Tip ({tipPercentage}%):</span>
                  <span className="font-semibold text-gray-900">RM {tipAmount.toFixed(2)}</span>
                </div>
                <div className="border-t border-gray-300 pt-2 flex justify-between">
                  <span className="font-semibold text-gray-900">Total:</span>
                  <span className="font-bold text-blue-600 text-lg">RM {totalAmount.toFixed(2)}</span>
                </div>
                {isRecurring && (
                  <div className="pt-2 border-t border-gray-300">
                    <p className="text-gray-600">
                      Recurring {recurringInterval} starting today
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={!validation.valid || donationAmount === 0 || isProcessing}
            className={`w-full py-4 rounded-lg font-bold text-lg transition-all ${
              !validation.valid || donationAmount === 0 || isProcessing
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg'
            }`}
          >
            {isProcessing ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Processing...
              </span>
            ) : (
              `Donate RM ${totalAmount.toFixed(2)}`
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
