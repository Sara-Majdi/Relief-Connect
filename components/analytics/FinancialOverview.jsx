'use client';

import { useEffect, useState } from 'react';
import KPICard from './KPICard';
import LineChart from './LineChart';
import DoughnutChart from './DoughnutChart';
import BarChart from './BarChart';
import { DollarSign, TrendingUp, CreditCard, Target } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function FinancialOverview({ dateRange }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchFinancialData();
  }, [dateRange]);

  const fetchFinancialData = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams();
      if (dateRange?.startDate) params.append('startDate', dateRange.startDate);
      if (dateRange?.endDate) params.append('endDate', dateRange.endDate);

      const response = await fetch(`/api/analytics/financial?${params}`);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `API Error: ${response.status}`);
      }
      
      const result = await response.json();
      
      // Validate data structure
      if (!result || !result.revenueTrends || !Array.isArray(result.revenueTrends)) {
        throw new Error('Invalid data structure received from API');
      }
      
      setData(result);
    } catch (error) {
      console.error('Error fetching financial data:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-600 font-semibold mb-2">Error loading financial data</p>
          <p className="text-gray-600 text-sm mb-4">{error}</p>
          <button 
            onClick={fetchFinancialData}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center text-gray-500">
          <p className="font-semibold mb-2">No data available</p>
          <p className="text-sm">Try adjusting your date range</p>
        </div>
      </div>
    );
  }

  // Check if we have data to display
  const hasData = data.revenueTrends?.length > 0;

  if (!hasData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center text-gray-500">
          <p className="font-semibold mb-2">No financial data available</p>
          <p className="text-sm">Try adjusting your date range</p>
        </div>
      </div>
    );
  }

  // Prepare chart data with safe fallbacks
  const revenueTrendsData = {
    labels: (data.revenueTrends || []).map(d => new Date(d.date).toLocaleDateString('en-MY', { month: 'short', day: 'numeric' })),
    datasets: [
      {
        label: 'Donations',
        data: (data.revenueTrends || []).map(d => d.amount || 0),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        tension: 0.4,
      },
      {
        label: 'Platform Tips',
        data: (data.revenueTrends || []).map(d => d.tips || 0),
        borderColor: 'rgb(16, 185, 129)',
        backgroundColor: 'rgba(16, 185, 129, 0.5)',
        tension: 0.4,
      }
    ]
  };

  const donationDistributionData = {
    labels: ['Small (<RM 50)', 'Medium (RM 50-500)', 'Large (RM 500-2K)', 'Major (>RM 2K)'],
    datasets: [{
      data: [
        data.donationDistribution?.small || 0,
        data.donationDistribution?.medium || 0,
        data.donationDistribution?.large || 0,
        data.donationDistribution?.major || 0
      ],
      backgroundColor: [
        'rgba(59, 130, 246, 0.8)',
        'rgba(16, 185, 129, 0.8)',
        'rgba(245, 158, 11, 0.8)',
        'rgba(239, 68, 68, 0.8)',
      ],
      borderWidth: 0,
    }]
  };

  const recurringVsOneTimeData = {
    labels: ['One-Time', 'Recurring'],
    datasets: [{
      data: [
        data.recurringVsOneTime?.oneTime || 0,
        data.recurringVsOneTime?.recurring || 0
      ],
      backgroundColor: [
        'rgba(156, 163, 175, 0.8)',
        'rgba(59, 130, 246, 0.8)',
      ],
      borderWidth: 0,
    }]
  };

  const topCampaignsData = {
    labels: (data.topCampaigns || []).map(c => c.title?.length > 30 ? c.title.substring(0, 30) + '...' : c.title || 'Untitled'),
    datasets: [
      {
        label: 'Raised',
        data: (data.topCampaigns || []).map(c => c.raised || 0),
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
      },
      {
        label: 'Goal',
        data: (data.topCampaigns || []).map(c => c.goal || 0),
        backgroundColor: 'rgba(229, 231, 235, 0.8)',
      }
    ]
  };

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Collection Trend"
          value={(data.summary?.totalRevenue || 0).toFixed(2)}
          prefix="RM "
          subtitle={`${data.summary?.donationCount || 0} donations`}
          icon={DollarSign}
        />
        <KPICard
          title="Total Donations"
          value={(data.summary?.totalDonations || 0).toFixed(2)}
          prefix="RM "
          subtitle="Funds for campaigns"
          icon={Target}
        />
        <KPICard
          title="Platform Tips"
          value={(data.summary?.totalTips || 0).toFixed(2)}
          prefix="RM "
          subtitle="Support for platform"
          icon={CreditCard}
        />
        <KPICard
          title="Avg Donation"
          value={(data.summary?.avgDonation || 0).toFixed(2)}
          prefix="RM "
          subtitle="Per transaction"
          icon={TrendingUp}
        />
      </div>

      {/* Revenue Trends */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <LineChart data={revenueTrendsData} height={350} />
        </CardContent>
      </Card>

      {/* Two columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Donation Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Donation Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <DoughnutChart data={donationDistributionData} height={300} />
          </CardContent>
        </Card>

        {/* Recurring vs One-Time */}
        <Card>
          <CardHeader>
            <CardTitle>Recurring vs One-Time</CardTitle>
          </CardHeader>
          <CardContent>
            <DoughnutChart data={recurringVsOneTimeData} height={300} />
          </CardContent>
        </Card>
      </div>

      {/* Top Campaigns */}
      <Card>
        <CardHeader>
          <CardTitle>Top 10 Performing Campaigns</CardTitle>
        </CardHeader>
        <CardContent>
          <BarChart data={topCampaignsData} height={400} horizontal={true} />
        </CardContent>
      </Card>
    </div>
  );
}