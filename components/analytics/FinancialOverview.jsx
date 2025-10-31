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

  useEffect(() => {
    fetchFinancialData();
  }, [dateRange]);

  const fetchFinancialData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (dateRange?.startDate) params.append('startDate', dateRange.startDate);
      if (dateRange?.endDate) params.append('endDate', dateRange.endDate);

      const response = await fetch(`/api/analytics/financial?${params}`);
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error('Error fetching financial data:', error);
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

  if (!data) return null;

  // Prepare chart data
  const revenueTrendsData = {
    labels: data.revenueTrends.map(d => new Date(d.date).toLocaleDateString('en-MY', { month: 'short', day: 'numeric' })),
    datasets: [
      {
        label: 'Donations',
        data: data.revenueTrends.map(d => d.amount),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        tension: 0.4,
      },
      {
        label: 'Platform Tips',
        data: data.revenueTrends.map(d => d.tips),
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
        data.donationDistribution.small,
        data.donationDistribution.medium,
        data.donationDistribution.large,
        data.donationDistribution.major
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
        data.recurringVsOneTime.oneTime,
        data.recurringVsOneTime.recurring
      ],
      backgroundColor: [
        'rgba(156, 163, 175, 0.8)',
        'rgba(59, 130, 246, 0.8)',
      ],
      borderWidth: 0,
    }]
  };

  const topCampaignsData = {
    labels: data.topCampaigns.map(c => c.title.length > 30 ? c.title.substring(0, 30) + '...' : c.title),
    datasets: [
      {
        label: 'Raised',
        data: data.topCampaigns.map(c => c.raised),
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
      },
      {
        label: 'Goal',
        data: data.topCampaigns.map(c => c.goal),
        backgroundColor: 'rgba(229, 231, 235, 0.8)',
      }
    ]
  };

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Total Revenue"
          value={data.summary.totalRevenue.toFixed(2)}
          prefix="RM "
          subtitle={`${data.summary.donationCount} donations`}
          icon={DollarSign}
        />
        <KPICard
          title="Total Donations"
          value={data.summary.totalDonations.toFixed(2)}
          prefix="RM "
          subtitle="Funds for campaigns"
          icon={Target}
        />
        <KPICard
          title="Platform Tips"
          value={data.summary.totalTips.toFixed(2)}
          prefix="RM "
          subtitle="Support for platform"
          icon={CreditCard}
        />
        <KPICard
          title="Avg Donation"
          value={data.summary.avgDonation.toFixed(2)}
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
