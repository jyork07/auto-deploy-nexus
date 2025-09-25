import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { 
  Play, 
  Pause, 
  Settings, 
  Activity, 
  Clock, 
  CheckCircle,
  AlertCircle,
  BarChart3,
  Upload,
  Download,
  Zap,
  Target,
  TrendingUp
} from "lucide-react";

interface AutopilotStatus {
  isRunning: boolean;
  queueLength: number;
  processedToday: number;
  uploadedToday: number;
  nextRunIn: number; // minutes
  currentStep?: string;
}

interface PipelineStep {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number;
  startTime?: Date;
  endTime?: Date;
}

export const AutopilotDashboard = () => {
  const { toast } = useToast();
  const [autopilotStatus, setAutopilotStatus] = useState<AutopilotStatus>({
    isRunning: false,
    queueLength: 0,
    processedToday: 0,
    uploadedToday: 0,
    nextRunIn: 60
  });

  const [pipelineSteps, setPipelineSteps] = useState<PipelineStep[]>([
    { id: 'discovery', name: 'Content Discovery', status: 'pending', progress: 0 },
    { id: 'scoring', name: 'AI Scoring', status: 'pending', progress: 0 },
    { id: 'processing', name: 'Video Processing', status: 'pending', progress: 0 },
    { id: 'upload', name: 'Platform Upload', status: 'pending', progress: 0 }
  ]);

  const [settings, setSettings] = useState({
    autopilotEnabled: false,
    fetchInterval: 60,
    topKClips: 10,
    dailyUploadCap: 5,
    retentionThreshold: 70,
    youtubeEnabled: true,
    tiktokEnabled: false
  });

  const [recentActivity] = useState([
    {
      id: 1,
      action: "Processed video",
      title: "Amazing Life Hack That Will Blow Your Mind!",
      timestamp: "2 minutes ago",
      status: "success"
    },
    {
      id: 2,
      action: "Uploaded to YouTube",
      title: "Quick Recipe Everyone Needs",
      timestamp: "5 minutes ago",
      status: "success"
    },
    {
      id: 3,
      action: "AI Scoring completed",
      title: "This Dance Move is Going Viral",
      timestamp: "8 minutes ago",
      status: "success"
    },
    {
      id: 4,
      action: "Failed to process",
      title: "Tech Trick That Will Save Hours",
      timestamp: "12 minutes ago",
      status: "error"
    }
  ]);

  const toggleAutopilot = () => {
    const newState = !autopilotStatus.isRunning;
    setAutopilotStatus(prev => ({ ...prev, isRunning: newState }));
    setSettings(prev => ({ ...prev, autopilotEnabled: newState }));
    
    toast({
      title: newState ? "Autopilot Started" : "Autopilot Stopped",
      description: newState 
        ? "ViraPilot is now automatically discovering and processing content."
        : "Autopilot has been stopped. Manual processing is still available.",
    });

    if (newState) {
      // Simulate pipeline activity
      simulatePipelineActivity();
    }
  };

  const simulatePipelineActivity = () => {
    let currentStepIndex = 0;
    const steps = [...pipelineSteps];
    
    const processStep = () => {
      if (currentStepIndex >= steps.length) {
        // Reset for next cycle
        currentStepIndex = 0;
        steps.forEach(step => {
          step.status = 'pending';
          step.progress = 0;
        });
        setTimeout(processStep, 300000); // Next cycle in 5 minutes
        return;
      }

      const step = steps[currentStepIndex];
      step.status = 'running';
      step.startTime = new Date();
      
      // Simulate progress
      let progress = 0;
      const progressInterval = setInterval(() => {
        progress += Math.random() * 20;
        step.progress = Math.min(100, progress);
        setPipelineSteps([...steps]);
        
        if (progress >= 100) {
          clearInterval(progressInterval);
          step.status = 'completed';
          step.endTime = new Date();
          step.progress = 100;
          setPipelineSteps([...steps]);
          
          // Update metrics
          if (step.id === 'processing') {
            setAutopilotStatus(prev => ({
              ...prev,
              processedToday: prev.processedToday + 1
            }));
          } else if (step.id === 'upload') {
            setAutopilotStatus(prev => ({
              ...prev,
              uploadedToday: prev.uploadedToday + 1
            }));
          }
          
          currentStepIndex++;
          setTimeout(processStep, 1000);
        }
      }, 500);
    };

    if (autopilotStatus.isRunning) {
      setTimeout(processStep, 2000);
    }
  };

  const getStepIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-success" />;
      case 'running':
        return <Clock className="h-4 w-4 text-primary animate-spin" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-destructive" />;
      default:
        return <AlertCircle className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getActivityIcon = (status: string) => {
    return status === 'success' 
      ? <CheckCircle className="h-4 w-4 text-success" />
      : <AlertCircle className="h-4 w-4 text-destructive" />;
  };

  useEffect(() => {
    // Countdown timer for next run
    const interval = setInterval(() => {
      if (autopilotStatus.isRunning && autopilotStatus.nextRunIn > 0) {
        setAutopilotStatus(prev => ({
          ...prev,
          nextRunIn: Math.max(0, prev.nextRunIn - 1)
        }));
      }
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [autopilotStatus.isRunning, autopilotStatus.nextRunIn]);

  return (
    <div className="space-y-6">
      {/* Autopilot Control */}
      <Card className="bg-gradient-to-br from-card to-card/80">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              Autopilot Control
            </div>
            <Badge variant={autopilotStatus.isRunning ? "default" : "secondary"}>
              {autopilotStatus.isRunning ? "Active" : "Inactive"}
            </Badge>
          </CardTitle>
          <CardDescription>
            Automated content discovery, processing, and publishing pipeline
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Switch
                  checked={autopilotStatus.isRunning}
                  onCheckedChange={toggleAutopilot}
                />
                <Label className="text-base font-medium">
                  {autopilotStatus.isRunning ? "Autopilot Running" : "Autopilot Stopped"}
                </Label>
              </div>
              <p className="text-sm text-muted-foreground">
                {autopilotStatus.isRunning 
                  ? `Next cycle in ${autopilotStatus.nextRunIn} minutes`
                  : "Enable to start automated content processing"
                }
              </p>
            </div>
            
            <Button
              variant={autopilotStatus.isRunning ? "destructive" : "default"}
              onClick={toggleAutopilot}
              className="flex items-center gap-2"
            >
              {autopilotStatus.isRunning ? (
                <>
                  <Pause className="h-4 w-4" />
                  Stop Autopilot
                </>
              ) : (
                <>
                  <Play className="h-4 w-4" />
                  Start Autopilot
                </>
              )}
            </Button>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 rounded-lg bg-secondary/30">
              <div className="text-2xl font-bold text-primary">{autopilotStatus.queueLength}</div>
              <div className="text-xs text-muted-foreground">Queue</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-secondary/30">
              <div className="text-2xl font-bold text-accent">{autopilotStatus.processedToday}</div>
              <div className="text-xs text-muted-foreground">Processed Today</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-secondary/30">
              <div className="text-2xl font-bold text-success">{autopilotStatus.uploadedToday}</div>
              <div className="text-xs text-muted-foreground">Uploaded Today</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-secondary/30">
              <div className="text-2xl font-bold text-warning">{settings.dailyUploadCap - autopilotStatus.uploadedToday}</div>
              <div className="text-xs text-muted-foreground">Remaining</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pipeline Status */}
      <Card className="bg-gradient-to-br from-card to-card/80">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-accent" />
            Pipeline Status
          </CardTitle>
          <CardDescription>
            Real-time status of the automated processing pipeline
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {pipelineSteps.map((step) => (
              <div key={step.id} className="flex items-center justify-between p-4 rounded-lg bg-secondary/30 border border-border/50">
                <div className="flex items-center gap-3">
                  {getStepIcon(step.status)}
                  <div>
                    <p className="font-medium">{step.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {step.status === 'running' ? 'Processing...' : 
                       step.status === 'completed' ? 'Completed' :
                       step.status === 'failed' ? 'Failed' : 'Waiting'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-32">
                    <Progress value={step.progress} className="h-2" />
                  </div>
                  <Badge variant={
                    step.status === 'completed' ? 'default' :
                    step.status === 'running' ? 'default' :
                    step.status === 'failed' ? 'destructive' : 'secondary'
                  }>
                    {step.progress}%
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Settings */}
      <Card className="bg-gradient-to-br from-card to-card/80">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-warning" />
            Quick Settings
          </CardTitle>
          <CardDescription>
            Key autopilot parameters for fine-tuning performance
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Fetch Interval (minutes)</Label>
              <Input
                type="number"
                min="15"
                max="1440"
                value={settings.fetchInterval}
                onChange={(e) => setSettings(prev => ({ 
                  ...prev, 
                  fetchInterval: parseInt(e.target.value) || 60 
                }))}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Top K Clips</Label>
              <Input
                type="number"
                min="1"
                max="50"
                value={settings.topKClips}
                onChange={(e) => setSettings(prev => ({ 
                  ...prev, 
                  topKClips: parseInt(e.target.value) || 10 
                }))}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Daily Upload Cap</Label>
              <Input
                type="number"
                min="1"
                max="100"
                value={settings.dailyUploadCap}
                onChange={(e) => setSettings(prev => ({ 
                  ...prev, 
                  dailyUploadCap: parseInt(e.target.value) || 5 
                }))}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Retention Threshold (%)</Label>
              <Input
                type="number"
                min="50"
                max="100"
                value={settings.retentionThreshold}
                onChange={(e) => setSettings(prev => ({ 
                  ...prev, 
                  retentionThreshold: parseInt(e.target.value) || 70 
                }))}
              />
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Switch
                checked={settings.youtubeEnabled}
                onCheckedChange={(checked) => setSettings(prev => ({ 
                  ...prev, 
                  youtubeEnabled: checked 
                }))}
              />
              <Label>YouTube Upload</Label>
            </div>
            
            <div className="flex items-center gap-2">
              <Switch
                checked={settings.tiktokEnabled}
                onCheckedChange={(checked) => setSettings(prev => ({ 
                  ...prev, 
                  tiktokEnabled: checked 
                }))}
              />
              <Label>TikTok Upload</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card className="bg-gradient-to-br from-card to-card/80">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            Recent Activity
          </CardTitle>
          <CardDescription>
            Latest autopilot actions and their results
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
                <div className="flex items-center gap-3">
                  {getActivityIcon(activity.status)}
                  <div>
                    <p className="text-sm font-medium">{activity.action}</p>
                    <p className="text-xs text-muted-foreground line-clamp-1">{activity.title}</p>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground">
                  {activity.timestamp}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};