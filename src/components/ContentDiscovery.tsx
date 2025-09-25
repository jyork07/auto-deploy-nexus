import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { 
  Search, 
  Download, 
  Play, 
  Eye, 
  ThumbsUp, 
  Clock, 
  TrendingUp,
  Filter,
  RefreshCw,
  Globe
} from "lucide-react";

interface TrendingVideo {
  id: string;
  title: string;
  channelTitle: string;
  viewCount: number;
  likeCount: number;
  duration: number;
  thumbnailUrl: string;
  publishedAt: string;
  aiScore?: number;
}

export const ContentDiscovery = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [trendingVideos, setTrendingVideos] = useState<TrendingVideo[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("US");
  const [selectedCategory, setSelectedCategory] = useState("0");
  const [shortsOnly, setShortsOnly] = useState(true);
  const [maxResults, setMaxResults] = useState(25);

  const regions = [
    { value: "US", label: "United States" },
    { value: "GB", label: "United Kingdom" },
    { value: "CA", label: "Canada" },
    { value: "AU", label: "Australia" },
    { value: "DE", label: "Germany" },
    { value: "FR", label: "France" },
    { value: "JP", label: "Japan" },
    { value: "KR", label: "South Korea" },
    { value: "IN", label: "India" },
    { value: "BR", label: "Brazil" }
  ];

  const categories = [
    { value: "0", label: "All Categories" },
    { value: "1", label: "Film & Animation" },
    { value: "2", label: "Autos & Vehicles" },
    { value: "10", label: "Music" },
    { value: "15", label: "Pets & Animals" },
    { value: "17", label: "Sports" },
    { value: "19", label: "Travel & Events" },
    { value: "20", label: "Gaming" },
    { value: "22", label: "People & Blogs" },
    { value: "23", label: "Comedy" },
    { value: "24", label: "Entertainment" },
    { value: "25", label: "News & Politics" },
    { value: "26", label: "Howto & Style" },
    { value: "27", label: "Education" },
    { value: "28", label: "Science & Technology" }
  ];

  const fetchTrendingContent = async () => {
    setIsLoading(true);
    try {
      // Simulate API call - in real implementation, this would use YouTubeService
      const mockVideos: TrendingVideo[] = [
        {
          id: "vid1",
          title: "Amazing Life Hack That Will Blow Your Mind! 🤯",
          channelTitle: "LifeHackGuru",
          viewCount: 1250000,
          likeCount: 95000,
          duration: 45,
          thumbnailUrl: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=300&h=169",
          publishedAt: "2024-01-15T10:00:00Z",
          aiScore: 87
        },
        {
          id: "vid2", 
          title: "Quick Recipe That Everyone Needs to Try",
          channelTitle: "FoodieSecrets",
          viewCount: 890000,
          likeCount: 67000,
          duration: 52,
          thumbnailUrl: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=300&h=169",
          publishedAt: "2024-01-15T08:30:00Z",
          aiScore: 92
        },
        {
          id: "vid3",
          title: "This Dance Move is Going Viral! Learn It Now",
          channelTitle: "DanceVibes",
          viewCount: 2100000,
          likeCount: 180000,
          duration: 38,
          thumbnailUrl: "https://images.unsplash.com/photo-1547153760-18fc86324498?w=300&h=169",
          publishedAt: "2024-01-15T06:15:00Z",
          aiScore: 95
        },
        {
          id: "vid4",
          title: "Unbelievable Animal Facts You Never Knew",
          channelTitle: "NatureMysteries",
          viewCount: 756000,
          likeCount: 45000,
          duration: 41,
          thumbnailUrl: "https://images.unsplash.com/photo-1549366021-9f761d040a94?w=300&h=169",
          publishedAt: "2024-01-15T04:45:00Z",
          aiScore: 73
        },
        {
          id: "vid5",
          title: "Tech Trick That Will Save You Hours Every Day",
          channelTitle: "TechSimplified",
          viewCount: 1580000,
          likeCount: 112000,
          duration: 56,
          thumbnailUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=300&h=169",
          publishedAt: "2024-01-15T02:20:00Z",
          aiScore: 85
        }
      ];

      setTrendingVideos(mockVideos);
      
      toast({
        title: "Content Discovered",
        description: `Found ${mockVideos.length} trending videos matching your criteria.`,
      });
    } catch (error) {
      toast({
        title: "Discovery Failed",
        description: "Failed to fetch trending content. Please check your API keys.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getScoreColor = (score?: number): string => {
    if (!score) return "text-muted-foreground";
    if (score >= 90) return "text-success";
    if (score >= 70) return "text-warning";
    return "text-destructive";
  };

  useEffect(() => {
    fetchTrendingContent();
  }, []);

  return (
    <div className="space-y-6">
      {/* Discovery Controls */}
      <Card className="bg-gradient-to-br from-card to-card/80">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5 text-primary" />
            Content Discovery Settings
          </CardTitle>
          <CardDescription>
            Configure parameters for discovering trending content
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Region</Label>
              <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {regions.map(region => (
                    <SelectItem key={region.value} value={region.value}>
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4" />
                        {region.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Max Results</Label>
              <Input
                type="number"
                min="10"
                max="100"
                value={maxResults}
                onChange={(e) => setMaxResults(parseInt(e.target.value) || 25)}
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Switch
                  checked={shortsOnly}
                  onCheckedChange={setShortsOnly}
                />
                <Label>Shorts Only (≤60s)</Label>
              </div>
            </div>
            
            <Button 
              onClick={fetchTrendingContent}
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              {isLoading ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              {isLoading ? 'Discovering...' : 'Discover Content'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Trending Content Grid */}
      <Card className="bg-gradient-to-br from-card to-card/80">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-accent" />
            Discovered Content ({trendingVideos.length})
          </CardTitle>
          <CardDescription>
            Trending videos sorted by AI viral potential score
          </CardDescription>
        </CardHeader>
        <CardContent>
          {trendingVideos.length === 0 ? (
            <div className="text-center py-8">
              <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No content discovered yet. Click "Discover Content" to start.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {trendingVideos.map((video) => (
                <div key={video.id} className="group relative overflow-hidden rounded-lg border border-border/50 bg-secondary/30 hover:bg-secondary/50 transition-all duration-300">
                  {/* Thumbnail */}
                  <div className="relative aspect-video overflow-hidden">
                    <img 
                      src={video.thumbnailUrl} 
                      alt={video.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
                    <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/80 text-white text-xs rounded">
                      {formatDuration(video.duration)}
                    </div>
                    {video.aiScore && (
                      <div className="absolute top-2 left-2">
                        <Badge variant="default" className={getScoreColor(video.aiScore)}>
                          AI: {video.aiScore}
                        </Badge>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-4 space-y-3">
                    <h3 className="font-medium text-sm line-clamp-2 leading-tight">
                      {video.title}
                    </h3>
                    
                    <div className="text-xs text-muted-foreground">
                      {video.channelTitle}
                    </div>

                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          {formatNumber(video.viewCount)}
                        </div>
                        <div className="flex items-center gap-1">
                          <ThumbsUp className="h-3 w-3" />
                          {formatNumber(video.likeCount)}
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(video.publishedAt).toLocaleDateString()}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="flex-1">
                        <Play className="h-3 w-3 mr-1" />
                        Preview
                      </Button>
                      <Button size="sm" className="flex-1">
                        <Download className="h-3 w-3 mr-1" />
                        Process
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};