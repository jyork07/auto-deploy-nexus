import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  BarChart3, 
  TrendingUp, 
  DollarSign, 
  Eye, 
  Clock, 
  Download,
  Upload,
  Users,
  PlayCircle,
  Heart,
  Share,
  MessageCircle,
  Calendar,
  Target
} from "lucide-react";

interface VideoAnalytics {
  id: string;
  title: string;
  platform: 'youtube' | 'tiktok';
  uploadDate: string;
  views: number;
  likes: number;
  shares: number;
  comments: number;
  revenue: number;
  ctr: number;
  avgWatchTime: number;
  retentionRate: number;
}

interface DashboardMetrics {
  totalViews: number;
  totalRevenue: number;
  avgCTR: number;
  avgRetention: number;
  totalUploads: number;
  successRate: number;
  topPerformingVideo: VideoAnalytics;
  revenueGrowth: number;
}

export const AnalyticsDashboard = () => {
  const [timeRange, setTimeRange] = useState("7d");
  const [selectedPlatform, setSelectedPlatform] = useState("all");
  
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalViews: 2547832,
    totalRevenue: 1847.65,
    avgCTR: 12.8,
    avgRetention: 78.4,
    totalUploads: 156,
    successRate: 94.2,
    topPerformingVideo: {
      id: "top-1",
      title: "Amazing Life Hack That Will Blow Your Mind!",
      platform: "youtube",
      uploadDate: "2024-01-15",
      views: 1250000,
      likes: 95000,
      shares: 12500,
      comments: 3400,
      revenue: 892.50,
      ctr: 15.2,
      avgWatchTime: 42,
      retentionRate: 85.6
    },
    revenueGrowth: 23.5
  });

  const [videoAnalytics, setVideoAnalytics] = useState<VideoAnalytics[]>([
    {
      id: "vid-1",
      title: "Amazing Life Hack That Will Blow Your Mind!",
      platform: "youtube",
      uploadDate: "2024-01-15",
      views: 1250000,
      likes: 95000,
      shares: 12500,
      comments: 3400,
      revenue: 892.50,
      ctr: 15.2,
      avgWatchTime: 42,
      retentionRate: 85.6
    },
    {
      id: "vid-2",
      title: "Quick Recipe That Everyone Needs to Try",
      platform: "youtube",
      uploadDate: "2024-01-14",
      views: 890000,
      likes: 67000,
      shares: 8900,
      comments: 2100,
      revenue: 634.80,
      ctr: 13.8,
      avgWatchTime: 38,
      retentionRate: 82.1
    },
    {
      id: "vid-3",
      title: "This Dance Move is Going Viral!",
      platform: "tiktok",
      uploadDate: "2024-01-13",
      views: 2100000,
      likes: 180000,
      shares: 25000,
      comments: 5600,
      revenue: 456.30,
      ctr: 18.5,
      avgWatchTime: 28,
      retentionRate: 91.2
    },
    {
      id: "vid-4",
      title: "Unbelievable Animal Facts You Never Knew",
      platform: "youtube",
      uploadDate: "2024-01-12",
      views: 756000,
      likes: 45000,
      shares: 6200,
      comments: 1800,
      revenue: 423.15,
      ctr: 11.2,
      avgWatchTime: 35,
      retentionRate: 76.8
    },
    {
      id: "vid-5",
      title: "Tech Trick That Will Save You Hours",
      platform: "tiktok",
      uploadDate: "2024-01-11",
      views: 1580000,
      likes: 112000,
      shares: 18500,
      comments: 4200,
      revenue: 289.90,
      ctr: 16.7,
      avgWatchTime: 31,
      retentionRate: 88.4
    }
  ]);

  const [dailyStats] = useState([
    { date: "2024-01-15", views: 425000, revenue: 312.45, uploads: 8 },
    { date: "2024-01-14", views: 389000, revenue: 287.60, uploads: 6 },
    { date: "2024-01-13", views: 512000, revenue: 378.90, uploads: 9 },
    { date: "2024-01-12", views: 367000, revenue: 251.30, uploads: 7 },
    { date: "2024-01-11", views: 445000, revenue: 334.80, uploads: 8 },
    { date: "2024-01-10", views: 298000, revenue: 198.75, uploads: 5 },
    { date: "2024-01-09", views: 356000, revenue: 267.40, uploads: 6 }
  ]);

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getPlatformIcon = (platform: string) => {
    return platform === 'youtube' ? 
      <PlayCircle className="h-4 w-4 text-red-500" /> :
      <Users className="h-4 w-4 text-pink-500" />;
  };

  const getRetentionColor = (rate: number): string => {
    if (rate >= 80) return "text-success";
    if (rate >= 60) return "text-warning";
    return "text-destructive";
  };

  const filteredVideos = videoAnalytics.filter(video => 
    selectedPlatform === "all" || video.platform === selectedPlatform
  );

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1d">24 Hours</SelectItem>
              <SelectItem value="7d">7 Days</SelectItem>
              <SelectItem value="30d">30 Days</SelectItem>
              <SelectItem value="90d">90 Days</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Platforms</SelectItem>
              <SelectItem value="youtube">YouTube</SelectItem>
              <SelectItem value="tiktok">TikTok</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <Button variant="outline" className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Export Data
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-card to-card/80 border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Views</p>
                <p className="text-2xl font-bold">{formatNumber(metrics.totalViews)}</p>
                <p className="text-xs text-success flex items-center gap-1 mt-1">
                  <TrendingUp className="h-3 w-3" />
                  +{metrics.revenueGrowth}% vs last period
                </p>
              </div>
              <Eye className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-card to-card/80 border-success/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold">{formatCurrency(metrics.totalRevenue)}</p>
                <p className="text-xs text-success flex items-center gap-1 mt-1">
                  <TrendingUp className="h-3 w-3" />
                  +{metrics.revenueGrowth}% growth
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-success" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-card to-card/80 border-accent/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg CTR</p>
                <p className="text-2xl font-bold">{metrics.avgCTR}%</p>
                <p className="text-xs text-muted-foreground mt-1">Industry avg: 8.2%</p>
              </div>
              <Target className="h-8 w-8 text-accent" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-card to-card/80 border-warning/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Retention</p>
                <p className="text-2xl font-bold">{metrics.avgRetention}%</p>
                <p className="text-xs text-muted-foreground mt-1">{metrics.totalUploads} videos</p>
              </div>
              <Clock className="h-8 w-8 text-warning" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-card">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Top Performing Video */}
          <Card className="bg-gradient-to-br from-card to-card/80">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Top Performing Video
              </CardTitle>
              <CardDescription>
                Highest performing content in the selected time period
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/30 border border-border/50">
                <div className="flex items-center gap-4">
                  {getPlatformIcon(metrics.topPerformingVideo.platform)}
                  <div>
                    <h3 className="font-medium">{metrics.topPerformingVideo.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {new Date(metrics.topPerformingVideo.uploadDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-6 text-center">
                  <div>
                    <div className="text-lg font-bold">{formatNumber(metrics.topPerformingVideo.views)}</div>
                    <div className="text-xs text-muted-foreground">Views</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold">{metrics.topPerformingVideo.ctr}%</div>
                    <div className="text-xs text-muted-foreground">CTR</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold">{metrics.topPerformingVideo.retentionRate}%</div>
                    <div className="text-xs text-muted-foreground">Retention</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold">{formatCurrency(metrics.topPerformingVideo.revenue)}</div>
                    <div className="text-xs text-muted-foreground">Revenue</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Daily Performance */}
          <Card className="bg-gradient-to-br from-card to-card/80">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-accent" />
                Daily Performance
              </CardTitle>
              <CardDescription>
                Views, revenue, and upload activity over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dailyStats.map((day, index) => (
                  <div key={day.date} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
                    <div className="flex items-center gap-3">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">
                        {new Date(day.date).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-6 text-sm">
                      <div className="text-center">
                        <div className="font-medium">{formatNumber(day.views)}</div>
                        <div className="text-xs text-muted-foreground">Views</div>
                      </div>
                      <div className="text-center">
                        <div className="font-medium">{formatCurrency(day.revenue)}</div>
                        <div className="text-xs text-muted-foreground">Revenue</div>
                      </div>
                      <div className="text-center">
                        <div className="font-medium">{day.uploads}</div>
                        <div className="text-xs text-muted-foreground">Uploads</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <Card className="bg-gradient-to-br from-card to-card/80">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                Video Performance Analysis
              </CardTitle>
              <CardDescription>
                Detailed performance metrics for all uploaded videos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredVideos.map((video) => (
                  <div key={video.id} className="p-4 rounded-lg bg-secondary/30 border border-border/50">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        {getPlatformIcon(video.platform)}
                        <div>
                          <h3 className="font-medium text-sm">{video.title}</h3>
                          <p className="text-xs text-muted-foreground">
                            {new Date(video.uploadDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline">
                        {video.platform.toUpperCase()}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-6 gap-4 text-center">
                      <div>
                        <div className="text-lg font-bold">{formatNumber(video.views)}</div>
                        <div className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                          <Eye className="h-3 w-3" />
                          Views
                        </div>
                      </div>
                      <div>
                        <div className="text-lg font-bold">{formatNumber(video.likes)}</div>
                        <div className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                          <Heart className="h-3 w-3" />
                          Likes
                        </div>
                      </div>
                      <div>
                        <div className="text-lg font-bold">{video.ctr}%</div>
                        <div className="text-xs text-muted-foreground">CTR</div>
                      </div>
                      <div>
                        <div className={`text-lg font-bold ${getRetentionColor(video.retentionRate)}`}>
                          {video.retentionRate}%
                        </div>
                        <div className="text-xs text-muted-foreground">Retention</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold">{video.avgWatchTime}s</div>
                        <div className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                          <Clock className="h-3 w-3" />
                          Watch Time
                        </div>
                      </div>
                      <div>
                        <div className="text-lg font-bold">{formatCurrency(video.revenue)}</div>
                        <div className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                          <DollarSign className="h-3 w-3" />
                          Revenue
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-3">
                      <div className="flex justify-between text-xs mb-1">
                        <span>Retention Rate</span>
                        <span>{video.retentionRate}%</span>
                      </div>
                      <Progress value={video.retentionRate} className="h-2" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="revenue" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-gradient-to-br from-card to-card/80">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-success" />
                  Revenue Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">YouTube Shorts</span>
                    <span className="font-medium">{formatCurrency(1234.56)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">TikTok Creator Fund</span>
                    <span className="font-medium">{formatCurrency(613.09)}</span>
                  </div>
                  <div className="border-t pt-2">
                    <div className="flex items-center justify-between font-medium">
                      <span>Total Revenue</span>
                      <span>{formatCurrency(metrics.totalRevenue)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-card to-card/80">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary" />
                  Revenue Goals
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Monthly Goal</span>
                      <span>{formatCurrency(3000)}</span>
                    </div>
                    <Progress value={61.6} className="h-2" />
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatCurrency(1847.65)} of {formatCurrency(3000)} (61.6%)
                    </p>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Weekly Goal</span>
                      <span>{formatCurrency(750)}</span>
                    </div>
                    <Progress value={82.3} className="h-2" />
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatCurrency(617.25)} of {formatCurrency(750)} (82.3%)
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <Card className="bg-gradient-to-br from-card to-card/80">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-accent" />
                Performance Trends
              </CardTitle>
              <CardDescription>
                Key performance indicators and growth trends
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 rounded-lg bg-secondary/30">
                  <div className="text-2xl font-bold text-success">+23.5%</div>
                  <div className="text-sm text-muted-foreground">Revenue Growth</div>
                  <div className="text-xs text-muted-foreground mt-1">vs last period</div>
                </div>
                
                <div className="text-center p-4 rounded-lg bg-secondary/30">
                  <div className="text-2xl font-bold text-primary">+18.2%</div>
                  <div className="text-sm text-muted-foreground">View Growth</div>
                  <div className="text-xs text-muted-foreground mt-1">7-day trend</div>
                </div>
                
                <div className="text-center p-4 rounded-lg bg-secondary/30">
                  <div className="text-2xl font-bold text-accent">+12.8%</div>
                  <div className="text-sm text-muted-foreground">Engagement Rate</div>
                  <div className="text-xs text-muted-foreground mt-1">improving</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};