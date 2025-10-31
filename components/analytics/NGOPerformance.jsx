'use client';

import { useEffect, useState } from 'react';
import KPICard from './KPICard';
import BarChart from './BarChart';
import DoughnutChart from './DoughnutChart';
import { Building2, CheckCircle, Clock, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function NGOPerformance({ dateRange }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchNGOData();
  }, [dateRange]);

  const fetchNGOData = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams();
      if (dateRange?.startDate) params.append('startDate', dateRange.startDate);
      if (dateRange?.endDate) params.append('endDate', dateRange.endDate);

      const response = await fetch(`/api/analytics/ngos?${params}`);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `API Error: ${response.status}`);
      }
      
      const result = await response.json();
      
      // Validate data structure
      if (!result || !result.applicationPipeline) {
        throw new Error('Invalid data structure received from API');
      }
      
      setData(result);
    } catch (error) {
      console.error('Error fetching NGO data:', error);
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
          <p className="text-red-600 font-semibold mb-2">Error loading NGO data</p>
          <p className="text-gray-600 text-sm mb-4">{error}</p>
          <button 
            onClick={fetchNGOData}
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

  // Prepare chart data with safe fallbacks
  const applicationPipelineData = {
    labels: ['Pending', 'Under Review', 'Approved', 'Rejected'],
    datasets: [{
      label: 'Applications',
      data: [
        data.applicationPipeline?.pending || 0,
        data.applicationPipeline?.underReview || 0,
        data.applicationPipeline?.approved || 0,
        data.applicationPipeline?.rejected || 0
      ],
      backgroundColor: [
        'rgba(245, 158, 11, 0.8)',
        'rgba(59, 130, 246, 0.8)',
        'rgba(16, 185, 129, 0.8)',
        'rgba(239, 68, 68, 0.8)',
      ],
      borderWidth: 0,
    }]
  };

  const orgTypesData = {
    labels: Object.keys(data.orgTypes || {}),
    datasets: [{
      data: Object.values(data.orgTypes || {}),
      backgroundColor: [
        'rgba(59, 130, 246, 0.8)',
        'rgba(16, 185, 129, 0.8)',
        'rgba(245, 158, 11, 0.8)',
        'rgba(139, 92, 246, 0.8)',
      ],
      borderWidth: 0,
    }]
  };

  const focusAreasChartData = {
    labels: Object.keys(data.focusAreas || {}),
    datasets: [
      {
        label: 'NGO Count',
        data: Object.values(data.focusAreas || {}).map(d => d?.count || 0),
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
      },
    ]
  };

  const topNgosByFundsData = {
    labels: (data.topNgosByFunds || []).map(n => n.name?.length > 25 ? n.name.substring(0, 25) + '...' : n.name || 'Unknown'),
    datasets: [{
      label: 'Funds Raised (RM)',
      data: (data.topNgosByFunds || []).map(n => n.raised || 0),
      backgroundColor: 'rgba(16, 185, 129, 0.8)',
    }]
  };

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Total NGOs"
          value={data.summary?.totalNgos || 0}
          subtitle={`${data.summary?.approvedNgos || 0} approved`}
          icon={Building2}
        />
        <KPICard
          title="Approval Rate"
          value={data.summary?.approvalRate || 0}
          suffix="%"
          subtitle="Of reviewed applications"
          icon={CheckCircle}
        />
        <KPICard
          title="Avg Review Time"
          value={data.summary?.avgReviewTime || 0}
          suffix=" days"
          subtitle="Application processing"
          icon={Clock}
        />
        <KPICard
          title="Avg Funds per NGO"
          value={(data.summary?.avgFundsPerNgo || 0).toFixed(0)}
          prefix="RM "
          subtitle={`${(data.summary?.avgCampaignsPerNgo || 0).toFixed(1)} campaigns/NGO`}
          icon={TrendingUp}
        />
      </div>

      {/* Application Pipeline */}
      <Card>
        <CardHeader>
          <CardTitle>NGO Application Pipeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <BarChart data={applicationPipelineData} height={300} />
            </div>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium text-yellow-600">Pending</span>
                  <span className="text-sm font-bold">{data.applicationPipeline?.pending || 0}</span>
                </div>
                <Progress value={100} className="h-3 bg-yellow-100" />
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium text-blue-600">Under Review</span>
                  <span className="text-sm font-bold">{data.applicationPipeline?.underReview || 0}</span>
                </div>
                <Progress value={100} className="h-3 bg-blue-100" />
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium text-green-600">Approved</span>
                  <span className="text-sm font-bold">
                    {data.applicationPipeline?.approved || 0} ({data.summary?.approvalRate || 0}%)
                  </span>
                </div>
                <Progress value={100} className="h-3 bg-green-100" />
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium text-red-600">Rejected</span>
                  <span className="text-sm font-bold">{data.applicationPipeline?.rejected || 0}</span>
                </div>
                <Progress value={100} className="h-3 bg-red-100" />
              </div>
              <div className="pt-4 border-t">
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Document Submission Rate</span>
                  <span className="text-sm font-bold">{data.documentSubmission?.rate || 0}%</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {data.documentSubmission?.withAllDocs || 0} NGOs submitted all required documents
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Two columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Organization Types */}
        <Card>
          <CardHeader>
            <CardTitle>NGO by Organization Type</CardTitle>
          </CardHeader>
          <CardContent>
            <DoughnutChart data={orgTypesData} height={300} />
            <div className="mt-4 space-y-2">
              {Object.entries(data.orgTypes || {}).map(([type, count]) => (
                <div key={type} className="flex justify-between text-sm">
                  <span className="text-gray-600">{type}</span>
                  <span className="font-medium">{count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Focus Areas */}
        <Card>
          <CardHeader>
            <CardTitle>NGO by Focus Area</CardTitle>
          </CardHeader>
          <CardContent>
            <BarChart data={focusAreasChartData} height={300} />
            <div className="mt-4 space-y-2">
              {Object.entries(data.focusAreas || {}).map(([area, info]) => (
                <div key={area} className="flex justify-between text-sm">
                  <span className="text-gray-600">{area}</span>
                  <span className="font-medium">RM {(info?.raised || 0).toLocaleString()}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top NGOs by Funds */}
      <Card>
        <CardHeader>
          <CardTitle>Top 10 NGOs by Funds Raised</CardTitle>
        </CardHeader>
        <CardContent>
          <BarChart data={topNgosByFundsData} height={400} horizontal={true} />
        </CardContent>
      </Card>

      {/* Top NGOs Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* By Funds */}
        <Card>
          <CardHeader>
            <CardTitle>Top NGOs by Total Funds</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">Rank</TableHead>
                    <TableHead>NGO</TableHead>
                    <TableHead className="text-right">Raised</TableHead>
                    <TableHead className="text-center">Campaigns</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(data.topNgosByFunds || []).map((ngo) => (
                    <TableRow key={ngo.rank}>
                      <TableCell className="font-medium">{ngo.rank}</TableCell>
                      <TableCell className="text-sm">{ngo.name || 'Unknown'}</TableCell>
                      <TableCell className="text-right font-semibold">
                        RM {(ngo.raised || 0).toLocaleString()}
                      </TableCell>
                      <TableCell className="text-center">{ngo.campaigns || 0}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* By Campaign Count */}
        <Card>
          <CardHeader>
            <CardTitle>Top NGOs by Campaign Count</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">Rank</TableHead>
                    <TableHead>NGO</TableHead>
                    <TableHead className="text-center">Campaigns</TableHead>
                    <TableHead className="text-right">Raised</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(data.topNgosByCampaigns || []).map((ngo) => (
                    <TableRow key={ngo.rank}>
                      <TableCell className="font-medium">{ngo.rank}</TableCell>
                      <TableCell className="text-sm">{ngo.name || 'Unknown'}</TableCell>
                      <TableCell className="text-center">{ngo.campaigns || 0}</TableCell>
                      <TableCell className="text-right font-semibold">
                        RM {(ngo.raised || 0).toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Success Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Campaign Success Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
              <p className="text-sm font-medium text-gray-600 mb-2">Campaign Success Rate</p>
              <p className="text-4xl font-bold text-blue-600">{data.summary?.successRate || 0}%</p>
              <p className="text-xs text-gray-500 mt-2">Campaigns that met their goal</p>
            </div>
            <div className="text-center p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
              <p className="text-sm font-medium text-gray-600 mb-2">Avg Campaigns per NGO</p>
              <p className="text-4xl font-bold text-green-600">{data.summary?.avgCampaignsPerNgo || 0}</p>
              <p className="text-xs text-gray-500 mt-2">Active campaigns per organization</p>
            </div>
            <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
              <p className="text-sm font-medium text-gray-600 mb-2">Avg Funds per NGO</p>
              <p className="text-4xl font-bold text-purple-600">RM {(data.summary?.avgFundsPerNgo || 0).toLocaleString()}</p>
              <p className="text-xs text-gray-500 mt-2">Total raised per organization</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}