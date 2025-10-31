'use client';

import { useEffect, useState } from 'react';
import KPICard from './KPICard';
import DoughnutChart from './DoughnutChart';
import BarChart from './BarChart';
import { Zap, CheckCircle, Clock, Target } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export default function CampaignAnalytics({ dateRange }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCampaignData();
  }, [dateRange]);

  const fetchCampaignData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (dateRange?.startDate) params.append('startDate', dateRange.startDate);
      if (dateRange?.endDate) params.append('endDate', dateRange.endDate);

      const response = await fetch(`/api/analytics/campaigns?${params}`);
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error('Error fetching campaign data:', error);
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
  const disasterTypesData = {
    labels: Object.keys(data.disasterTypes),
    datasets: [{
      data: Object.values(data.disasterTypes).map(d => d.count),
      backgroundColor: [
        'rgba(59, 130, 246, 0.8)',
        'rgba(16, 185, 129, 0.8)',
        'rgba(245, 158, 11, 0.8)',
        'rgba(239, 68, 68, 0.8)',
        'rgba(139, 92, 246, 0.8)',
        'rgba(236, 72, 153, 0.8)',
      ],
      borderWidth: 0,
    }]
  };

  const urgencyData = {
    labels: Object.keys(data.urgencyDistribution).map(u => u.charAt(0).toUpperCase() + u.slice(1)),
    datasets: [
      {
        label: 'Raised',
        data: Object.values(data.urgencyDistribution).map(d => d.raised),
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
      },
      {
        label: 'Goal',
        data: Object.values(data.urgencyDistribution).map(d => d.goal),
        backgroundColor: 'rgba(229, 231, 235, 0.8)',
      }
    ]
  };

  const geographicData = {
    labels: Object.keys(data.geographicDistribution),
    datasets: [{
      label: 'Campaigns',
      data: Object.values(data.geographicDistribution).map(d => d.count),
      backgroundColor: 'rgba(59, 130, 246, 0.8)',
    }]
  };

  const geographicFundsData = {
    labels: Object.keys(data.geographicDistribution),
    datasets: [{
      label: 'Funds Raised (RM)',
      data: Object.values(data.geographicDistribution).map(d => d.raised),
      backgroundColor: 'rgba(16, 185, 129, 0.8)',
    }]
  };

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Total Campaigns"
          value={data.summary.totalCampaigns}
          subtitle={`${data.summary.activeCampaigns} active`}
          icon={Target}
        />
        <KPICard
          title="Active Campaigns"
          value={data.summary.activeCampaigns}
          subtitle="Currently running"
          icon={Zap}
        />
        <KPICard
          title="Completed"
          value={data.summary.completedCampaigns}
          subtitle="Reached goal or ended"
          icon={CheckCircle}
        />
        <KPICard
          title="Avg Duration"
          value={data.summary.avgDuration}
          suffix=" days"
          subtitle="Campaign length"
          icon={Clock}
        />
      </div>

      {/* Two columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Disaster Types */}
        <Card>
          <CardHeader>
            <CardTitle>Disaster Type Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <DoughnutChart data={disasterTypesData} height={300} />
            <div className="mt-4 space-y-2">
              {Object.entries(data.disasterTypes).map(([type, info]) => (
                <div key={type} className="flex justify-between text-sm">
                  <span className="text-gray-600 capitalize">{type}</span>
                  <span className="font-medium">RM {info.raised.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Campaign Urgency */}
        <Card>
          <CardHeader>
            <CardTitle>Campaign Urgency Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <BarChart data={urgencyData} height={300} />
          </CardContent>
        </Card>
      </div>

      {/* Geographic Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Campaigns by State</CardTitle>
          </CardHeader>
          <CardContent>
            <BarChart data={geographicData} height={350} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Funds Raised by State</CardTitle>
          </CardHeader>
          <CardContent>
            <BarChart data={geographicFundsData} height={350} />
          </CardContent>
        </Card>
      </div>

      {/* Progress Funnel */}
      <Card>
        <CardHeader>
          <CardTitle>Campaign Progress Funnel</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Total Created</span>
                <span className="text-sm font-bold">{data.progressStages.created}</span>
              </div>
              <Progress value={100} className="h-3" />
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">With Donations</span>
                <span className="text-sm font-bold">
                  {data.progressStages.withDonations} ({Math.round((data.progressStages.withDonations / data.progressStages.created) * 100)}%)
                </span>
              </div>
              <Progress
                value={(data.progressStages.withDonations / data.progressStages.created) * 100}
                className="h-3"
              />
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">50% Funded</span>
                <span className="text-sm font-bold">
                  {data.progressStages.halfFunded} ({Math.round((data.progressStages.halfFunded / data.progressStages.created) * 100)}%)
                </span>
              </div>
              <Progress
                value={(data.progressStages.halfFunded / data.progressStages.created) * 100}
                className="h-3"
              />
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Fully Funded</span>
                <span className="text-sm font-bold">
                  {data.progressStages.fullyFunded} ({Math.round((data.progressStages.fullyFunded / data.progressStages.created) * 100)}%)
                </span>
              </div>
              <Progress
                value={(data.progressStages.fullyFunded / data.progressStages.created) * 100}
                className="h-3"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Top Needed Items */}
      <Card>
        <CardHeader>
          <CardTitle>Top 10 Needed Items Across Campaigns</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.topNeededItems.map((item, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">{item.item}</span>
                  <span className="text-sm text-gray-600">
                    {item.received}/{item.needed} ({item.fulfillmentRate.toFixed(1)}%)
                  </span>
                </div>
                <Progress value={item.fulfillmentRate} className="h-2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
