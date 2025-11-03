'use client';

import { useEffect, useState } from 'react';
import KPICard from './KPICard';
import DoughnutChart from './DoughnutChart';
import BarChart from './BarChart';
import { Zap, CheckCircle, Clock, Target, Trophy, MapPin, Users, Building2, Search, Filter, AlertTriangle, Eye } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function CampaignAnalytics({ dateRange }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Top 10 and All Campaigns data
  const [top10Campaigns, setTop10Campaigns] = useState([]);
  const [allCampaigns, setAllCampaigns] = useState([]);
  const [filteredCampaigns, setFilteredCampaigns] = useState([]);
  const [filters, setFilters] = useState(null);

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedState, setSelectedState] = useState("all");
  const [selectedDisasterType, setSelectedDisasterType] = useState("all");
  const [selectedNGO, setSelectedNGO] = useState("all");
  const [sortBy, setSortBy] = useState("raised");

  // View mode
  const [viewMode, setViewMode] = useState("overview"); // overview, top10, search

  useEffect(() => {
    fetchCampaignData();
    fetchTop10Campaigns();
    fetchAllCampaigns();
  }, [dateRange]);

  useEffect(() => {
    fetchTop10Campaigns();
  }, [sortBy]);

  useEffect(() => {
    applyFilters();
  }, [searchTerm, selectedState, selectedDisasterType, selectedNGO, allCampaigns]);

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

  const fetchTop10Campaigns = async () => {
    try {
      const response = await fetch(`/api/admin/campaigns/top-10?sortBy=${sortBy}`);
      const result = await response.json();
      if (response.ok) {
        setTop10Campaigns(result.top10 || []);
      }
    } catch (error) {
      console.error('Error fetching top 10 campaigns:', error);
    }
  };

  const fetchAllCampaigns = async () => {
    try {
      const response = await fetch('/api/admin/campaigns/all');
      const result = await response.json();
      if (response.ok) {
        setAllCampaigns(result.campaigns || []);
        setFilteredCampaigns(result.campaigns || []);
        setFilters(result.filters);
      }
    } catch (error) {
      console.error('Error fetching all campaigns:', error);
    }
  };

  const applyFilters = () => {
    let filtered = [...allCampaigns];

    if (searchTerm) {
      const query = searchTerm.toLowerCase();
      filtered = filtered.filter(c =>
        c.title.toLowerCase().includes(query) ||
        c.description.toLowerCase().includes(query) ||
        c.organizer.toLowerCase().includes(query) ||
        c.state?.toLowerCase().includes(query)
      );
    }

    if (selectedState !== "all") {
      filtered = filtered.filter(c => c.state === selectedState);
    }

    if (selectedDisasterType !== "all") {
      filtered = filtered.filter(c => c.disaster?.toLowerCase().includes(selectedDisasterType.toLowerCase()));
    }

    if (selectedNGO !== "all") {
      filtered = filtered.filter(c => c.organizer === selectedNGO);
    }

    setFilteredCampaigns(filtered);
  };

  const resetFilters = () => {
    setSearchTerm("");
    setSelectedState("all");
    setSelectedDisasterType("all");
    setSelectedNGO("all");
  };

  const getUrgencyBadge = (urgency) => {
    const config = {
      critical: { color: "bg-red-600", label: "Critical" },
      urgent: { color: "bg-orange-600", label: "Urgent" },
      normal: { color: "bg-blue-600", label: "Normal" },
    };
    const badge = config[urgency] || { color: "bg-gray-600", label: urgency };
    return <Badge className={badge.color}>{badge.label}</Badge>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading campaign analytics...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center text-gray-500">
          <p className="font-semibold mb-2">No campaign data available</p>
          <p className="text-sm">Campaign analytics data could not be loaded. Please check your connection and try again.</p>
        </div>
      </div>
    );
  }

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
      {/* View Mode Selector */}
      <div className="flex gap-2">
        <Button
          variant={viewMode === "overview" ? "default" : "outline"}
          onClick={() => setViewMode("overview")}
        >
          <Target className="h-4 w-4 mr-2" />
          Analytics Overview
        </Button>
        <Button
          variant={viewMode === "top10" ? "default" : "outline"}
          onClick={() => setViewMode("top10")}
        >
          <Trophy className="h-4 w-4 mr-2" />
          Top 10 Campaigns
        </Button>
        <Button
          variant={viewMode === "search" ? "default" : "outline"}
          onClick={() => setViewMode("search")}
        >
          <Filter className="h-4 w-4 mr-2" />
          Search & Filter
        </Button>
      </div>

      {/* Overview Mode */}
      {viewMode === "overview" && (
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
      {data.topNeededItems && data.topNeededItems.length > 0 && (
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
      )}
        </div>
      )}

      {/* Top 10 Campaigns View */}
      {viewMode === "top10" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Top 10 Campaigns</h3>
              <p className="text-sm text-muted-foreground">Best performing campaigns with detailed information</p>
            </div>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectItem value="raised">Highest Raised</SelectItem>
                <SelectItem value="donors">Most Donors</SelectItem>
                <SelectItem value="progress">Best Progress</SelectItem>
                <SelectItem value="recent">Most Recent</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {top10Campaigns.map((campaign, index) => (
              <Card key={campaign.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                        <span className="text-lg font-bold text-blue-600">#{index + 1}</span>
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-base line-clamp-1">{campaign.title}</CardTitle>
                        <CardDescription className="line-clamp-1">{campaign.description}</CardDescription>
                      </div>
                    </div>
                    {getUrgencyBadge(campaign.urgency)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Organizer & Location Info */}
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Organizer</p>
                        <p className="font-medium line-clamp-1">{campaign.organizer}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Location</p>
                        <p className="font-medium">{campaign.state || 'N/A'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Progress */}
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium">{campaign.progress.toFixed(1)}%</span>
                    </div>
                    <Progress value={campaign.progress} className="h-2" />
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-3 gap-2 pt-2 border-t">
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground">Raised</p>
                      <p className="text-sm font-bold text-green-600">RM {campaign.raised.toLocaleString()}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground">Goal</p>
                      <p className="text-sm font-bold">RM {campaign.goal.toLocaleString()}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground">Donors</p>
                      <p className="text-sm font-bold text-blue-600">{campaign.donors}</p>
                    </div>
                  </div>

                  {/* Additional Info */}
                  <div className="flex items-center justify-between pt-2 border-t text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3" />
                      {campaign.disaster || 'N/A'}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {campaign.beneficiaries || 0} beneficiaries
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Search & Filter View */}
      {viewMode === "search" && (
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold">Search & Filter Campaigns</h3>
            <p className="text-sm text-muted-foreground">
              Showing {filteredCampaigns.length} of {allCampaigns.length} campaigns
            </p>
          </div>

          {/* Filters Section */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Filters</CardTitle>
                <Button variant="ghost" size="sm" onClick={resetFilters}>
                  Reset All
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search campaigns..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {/* State Filter */}
                <Select value={selectedState} onValueChange={setSelectedState}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select State" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="all">All States</SelectItem>
                    {filters?.states.map(state => (
                      <SelectItem key={state} value={state}>{state}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Disaster Type Filter */}
                <Select value={selectedDisasterType} onValueChange={setSelectedDisasterType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Disaster Type" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="all">All Types</SelectItem>
                    {filters?.disasterTypes.map(type => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* NGO Filter */}
                <Select value={selectedNGO} onValueChange={setSelectedNGO}>
                  <SelectTrigger>
                    <SelectValue placeholder="NGO/Organizer" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="all">All NGOs</SelectItem>
                    {filters?.ngos.map(ngo => (
                      <SelectItem key={ngo} value={ngo}>{ngo}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Filtered Campaigns Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCampaigns.length === 0 ? (
              <div className="col-span-full p-8 text-center">
                <p className="text-muted-foreground">No campaigns found matching your filters.</p>
              </div>
            ) : (
              filteredCampaigns.map((campaign) => (
                <Card key={campaign.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <CardTitle className="text-sm line-clamp-2">{campaign.title}</CardTitle>
                      {getUrgencyBadge(campaign.urgency)}
                    </div>
                    <CardDescription className="line-clamp-2">{campaign.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {/* Organizer & Location */}
                    <div className="space-y-1 text-xs">
                      <div className="flex items-center gap-1">
                        <Building2 className="h-3 w-3 text-muted-foreground" />
                        <span className="line-clamp-1">{campaign.organizer}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-muted-foreground" />
                        <span>{campaign.state || 'N/A'} • {campaign.disaster || 'N/A'}</span>
                      </div>
                    </div>

                    {/* Progress */}
                    <div>
                      <Progress value={campaign.progress} className="h-2 mb-1" />
                      <p className="text-xs text-muted-foreground">{campaign.progress.toFixed(1)}% funded</p>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t">
                      <div>
                        <p className="text-muted-foreground">Raised</p>
                        <p className="font-bold text-green-600">RM {campaign.raised.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Donors</p>
                        <p className="font-bold text-blue-600">{campaign.donors}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
