'use client';

import { useEffect, useState } from 'react';
import KPICard from './KPICard';
import AreaChart from './AreaChart';
import DoughnutChart from './DoughnutChart';
import LineChart from './LineChart';
import { Users, UserCheck, TrendingUp, Award } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default function DonorInsights({ dateRange }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDonorData();
  }, [dateRange]);

  const fetchDonorData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (dateRange?.startDate) params.append('startDate', dateRange.startDate);
      if (dateRange?.endDate) params.append('endDate', dateRange.endDate);

      const response = await fetch(`/api/analytics/donors?${params}`);
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error('Error fetching donor data:', error);
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
  const donorGrowthData = {
    labels: data.donorGrowth.map(d => new Date(d.date).toLocaleDateString('en-MY', { month: 'short', day: 'numeric' })),
    datasets: [
      {
        label: 'New Donors',
        data: data.donorGrowth.map(d => d.newDonors),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.3)',
        fill: true,
      },
      {
        label: 'Cumulative Donors',
        data: data.donorGrowth.map(d => d.cumulativeDonors),
        borderColor: 'rgb(16, 185, 129)',
        backgroundColor: 'rgba(16, 185, 129, 0.3)',
        fill: true,
      }
    ]
  };

  const segmentsData = {
    labels: ['Platinum (>RM 5K)', 'Gold (RM 2-5K)', 'Silver (RM 1-2K)', 'Bronze (RM 0.5-1K)', 'Supporter (<RM 0.5K)'],
    datasets: [{
      data: [
        data.segments.platinum,
        data.segments.gold,
        data.segments.silver,
        data.segments.bronze,
        data.segments.supporter
      ],
      backgroundColor: [
        'rgba(147, 197, 253, 0.8)',
        'rgba(251, 191, 36, 0.8)',
        'rgba(156, 163, 175, 0.8)',
        'rgba(217, 119, 6, 0.8)',
        'rgba(59, 130, 246, 0.8)',
      ],
      borderWidth: 0,
    }]
  };

  const retentionData = {
    labels: ['New Donors', 'Returning Donors'],
    datasets: [{
      data: [
        data.retention.new,
        data.retention.returning
      ],
      backgroundColor: [
        'rgba(156, 163, 175, 0.8)',
        'rgba(16, 185, 129, 0.8)',
      ],
      borderWidth: 0,
    }]
  };

  const getSegmentBadge = (segment) => {
    const colors = {
      'Platinum': 'bg-blue-100 text-blue-800',
      'Gold': 'bg-yellow-100 text-yellow-800',
      'Silver': 'bg-gray-100 text-gray-800',
      'Bronze': 'bg-orange-100 text-orange-800',
      'Supporter': 'bg-green-100 text-green-800',
    };
    return colors[segment] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Total Donors"
          value={data.summary.totalDonors}
          subtitle={`${data.summary.newDonors} new`}
          icon={Users}
        />
        <KPICard
          title="Returning Donors"
          value={data.summary.returningDonors}
          subtitle={`${data.summary.retentionRate}% retention`}
          icon={UserCheck}
        />
        <KPICard
          title="Avg Lifetime Value"
          value={data.summary.avgLifetimeValue.toFixed(2)}
          prefix="RM "
          subtitle="Per donor"
          icon={TrendingUp}
        />
        <KPICard
          title="Avg Days Between"
          value={data.summary.avgDaysBetweenDonations}
          suffix=" days"
          subtitle="For returning donors"
          icon={Award}
        />
      </div>

      {/* Donor Growth */}
      <Card>
        <CardHeader>
          <CardTitle>Donor Growth Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <AreaChart data={donorGrowthData} height={350} />
        </CardContent>
      </Card>

      {/* Two columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Donor Segments */}
        <Card>
          <CardHeader>
            <CardTitle>Donor Segments</CardTitle>
          </CardHeader>
          <CardContent>
            <DoughnutChart data={segmentsData} height={300} />
            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Platinum (&gt;RM 5K)</span>
                <span className="font-medium">{data.segments.platinum}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Gold (RM 2-5K)</span>
                <span className="font-medium">{data.segments.gold}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Silver (RM 1-2K)</span>
                <span className="font-medium">{data.segments.silver}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Bronze (RM 0.5-1K)</span>
                <span className="font-medium">{data.segments.bronze}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Supporter (&lt;RM 0.5K)</span>
                <span className="font-medium">{data.segments.supporter}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Donor Retention */}
        <Card>
          <CardHeader>
            <CardTitle>Donor Retention</CardTitle>
          </CardHeader>
          <CardContent>
            <DoughnutChart data={retentionData} height={300} />
            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Retention Rate</span>
                <span className="font-bold text-green-600">{data.summary.retentionRate.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Returning Donors</span>
                <span className="font-medium">{data.retention.returning}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">New Donors</span>
                <span className="font-medium">{data.retention.new}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Donors Table */}
      <Card>
        <CardHeader>
          <CardTitle>Top 20 Donors</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">Rank</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead className="text-right">Total Donated</TableHead>
                  <TableHead className="text-center">Donations</TableHead>
                  <TableHead className="text-center">Segment</TableHead>
                  <TableHead>Last Donation</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.topDonors.map((donor) => (
                  <TableRow key={donor.rank}>
                    <TableCell className="font-medium">{donor.rank}</TableCell>
                    <TableCell>{donor.name}</TableCell>
                    <TableCell className="text-sm text-gray-600">{donor.email}</TableCell>
                    <TableCell className="text-right font-semibold">
                      RM {donor.totalDonated.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-center">{donor.donationCount}</TableCell>
                    <TableCell className="text-center">
                      <Badge className={getSegmentBadge(donor.segment)}>
                        {donor.segment}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">
                      {new Date(donor.lastDonation).toLocaleDateString('en-MY')}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
