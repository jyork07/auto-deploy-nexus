import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, Play, Pause, RefreshCw, Activity, Zap, Brain, Database, TrendingUp, BarChart3 } from "lucide-react";
import { PipelineManager } from "@/components/PipelineManager";
import { SettingsPanel } from "@/components/SettingsPanel";
import { SystemMonitor } from "@/components/SystemMonitor";
import { AIInsights } from "@/components/AIInsights";
import { ContentDiscovery } from "@/components/ContentDiscovery";
import { AutopilotDashboard } from "@/components/AutopilotDashboard";
import { AnalyticsDashboard } from "@/components/AnalyticsDashboard";

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [isProcessing, setIsProcessing] = useState(false);
  const [systemStatus, setSystemStatus] = useState({
    cpu: 45,
    memory: 67,
    storage: 23,
    network: 89
  });

  useEffect(() => {
    // Simulate real-time system monitoring
    const interval = setInterval(() => {
      setSystemStatus(prev => ({
        cpu: Math.max(20, Math.min(80, prev.cpu + (Math.random() - 0.5) * 10)),
        memory: Math.max(30, Math.min(90, prev.memory + (Math.random() - 0.5) * 8)),
        storage: Math.max(10, Math.min(95, prev.storage + (Math.random() - 0.5) * 2)),
        network: Math.max(50, Math.min(100, prev.network + (Math.random() - 0.5) * 15))
      }));
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-background/95">
      <div className="container mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center">
              <Brain className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                ViraPilot v2.0
              </h1>
              <p className="text-muted-foreground">Advanced AI Pipeline Management System</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Badge variant="outline" className="text-success border-success">
              <Activity className="h-3 w-3 mr-1" />
              Online
            </Badge>
            <Button
              variant={isProcessing ? "destructive" : "default"}
              onClick={() => setIsProcessing(!isProcessing)}
              className="transition-all duration-300"
            >
              {isProcessing ? (
                <>
                  <Pause className="h-4 w-4 mr-2" />
                  Stop Pipeline
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Start Pipeline
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Main Dashboard */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-8 bg-card text-xs">
            <TabsTrigger value="overview" className="flex items-center gap-1">
              <Activity className="h-3 w-3" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="autopilot" className="flex items-center gap-1">
              <Zap className="h-3 w-3" />
              Autopilot
            </TabsTrigger>
            <TabsTrigger value="discovery" className="flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              Discovery
            </TabsTrigger>
            <TabsTrigger value="pipeline" className="flex items-center gap-1">
              <Brain className="h-3 w-3" />
              Pipeline
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-1">
              <BarChart3 className="h-3 w-3" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="insights" className="flex items-center gap-1">
              <Brain className="h-3 w-3" />
              AI Insights
            </TabsTrigger>
            <TabsTrigger value="monitor" className="flex items-center gap-1">
              <Database className="h-3 w-3" />
              Monitor
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-1">
              <Settings className="h-3 w-3" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* System Status Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-gradient-to-br from-card to-card/80 border-primary/20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">CPU Usage</CardTitle>
                  <Activity className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{systemStatus.cpu.toFixed(1)}%</div>
                  <Progress value={systemStatus.cpu} className="mt-2" />
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-card to-card/80 border-accent/20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Memory</CardTitle>
                  <Database className="h-4 w-4 text-accent" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{systemStatus.memory.toFixed(1)}%</div>
                  <Progress value={systemStatus.memory} className="mt-2" />
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-card to-card/80 border-warning/20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Storage</CardTitle>
                  <RefreshCw className="h-4 w-4 text-warning" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{systemStatus.storage.toFixed(1)}%</div>
                  <Progress value={systemStatus.storage} className="mt-2" />
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-card to-card/80 border-success/20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Network</CardTitle>
                  <Zap className="h-4 w-4 text-success" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{systemStatus.network.toFixed(1)}%</div>
                  <Progress value={systemStatus.network} className="mt-2" />
                </CardContent>
              </Card>
            </div>

            {/* Pipeline Status */}
            <Card className="bg-gradient-to-br from-card to-card/80">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-primary" />
                  Pipeline Status
                </CardTitle>
                <CardDescription>
                  Real-time monitoring of your AI processing pipeline
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Data Ingestion</span>
                    <Badge variant={isProcessing ? "default" : "secondary"}>
                      {isProcessing ? "Active" : "Idle"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">AI Processing</span>
                    <Badge variant={isProcessing ? "default" : "secondary"}>
                      {isProcessing ? "Processing" : "Standby"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Output Generation</span>
                    <Badge variant={isProcessing ? "default" : "secondary"}>
                      {isProcessing ? "Generating" : "Ready"}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="autopilot">
            <AutopilotDashboard />
          </TabsContent>

          <TabsContent value="discovery">
            <ContentDiscovery />
          </TabsContent>

          <TabsContent value="pipeline">
            <PipelineManager isProcessing={isProcessing} />
          </TabsContent>

          <TabsContent value="analytics">
            <AnalyticsDashboard />
          </TabsContent>

          <TabsContent value="insights">
            <AIInsights />
          </TabsContent>

          <TabsContent value="monitor">
            <SystemMonitor systemStatus={systemStatus} />
          </TabsContent>

          <TabsContent value="settings">
            <SettingsPanel />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;