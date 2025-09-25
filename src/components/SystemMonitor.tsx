import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  Activity, 
  Database, 
  HardDrive, 
  Wifi, 
  Thermometer, 
  Zap, 
  Clock,
  TrendingUp,
  AlertTriangle
} from "lucide-react";

interface SystemStatus {
  cpu: number;
  memory: number;
  storage: number;
  network: number;
}

interface SystemMonitorProps {
  systemStatus: SystemStatus;
}

export const SystemMonitor = ({ systemStatus }: SystemMonitorProps) => {
  const getStatusColor = (value: number) => {
    if (value < 50) return "text-success";
    if (value < 80) return "text-warning";
    return "text-destructive";
  };

  const getStatusBadge = (value: number) => {
    if (value < 50) return { variant: "default" as const, text: "Optimal" };
    if (value < 80) return { variant: "secondary" as const, text: "Moderate" };
    return { variant: "destructive" as const, text: "High" };
  };

  const systemMetrics = [
    {
      name: "CPU Usage",
      value: systemStatus.cpu,
      icon: Activity,
      description: "Processor utilization",
      unit: "%"
    },
    {
      name: "Memory Usage",
      value: systemStatus.memory,
      icon: Database,
      description: "RAM utilization",
      unit: "%"
    },
    {
      name: "Storage Usage",
      value: systemStatus.storage,
      icon: HardDrive,
      description: "Disk space utilization",
      unit: "%"
    },
    {
      name: "Network Usage",
      value: systemStatus.network,
      icon: Wifi,
      description: "Network bandwidth utilization",
      unit: "%"
    }
  ];

  const additionalMetrics = [
    {
      name: "Temperature",
      value: 42,
      icon: Thermometer,
      description: "System temperature",
      unit: "°C"
    },
    {
      name: "Power Usage",
      value: 67,
      icon: Zap,
      description: "Power consumption",
      unit: "W"
    },
    {
      name: "Uptime",
      value: 99.8,
      icon: Clock,
      description: "System uptime",
      unit: "%"
    },
    {
      name: "Throughput",
      value: 89,
      icon: TrendingUp,
      description: "Processing throughput",
      unit: "ops/s"
    }
  ];

  return (
    <div className="space-y-6">
      {/* System Overview */}
      <Card className="bg-gradient-to-br from-card to-card/80">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            System Overview
          </CardTitle>
          <CardDescription>
            Real-time monitoring of system resources and performance metrics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {systemMetrics.map((metric) => {
              const Icon = metric.icon;
              const statusBadge = getStatusBadge(metric.value);
              return (
                <div key={metric.name} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icon className={`h-4 w-4 ${getStatusColor(metric.value)}`} />
                      <span className="text-sm font-medium">{metric.name}</span>
                    </div>
                    <Badge variant={statusBadge.variant} className="text-xs">
                      {statusBadge.text}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold">
                        {metric.value.toFixed(1)}{metric.unit}
                      </span>
                    </div>
                    <Progress value={metric.value} className="h-2" />
                    <p className="text-xs text-muted-foreground">{metric.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Additional Metrics */}
      <Card className="bg-gradient-to-br from-card to-card/80">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-accent" />
            Additional Metrics
          </CardTitle>
          <CardDescription>
            Extended system monitoring and performance indicators
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {additionalMetrics.map((metric) => {
              const Icon = metric.icon;
              return (
                <div key={metric.name} className="p-4 rounded-lg bg-secondary/30 border border-border/50">
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className="h-4 w-4 text-accent" />
                    <span className="text-sm font-medium">{metric.name}</span>
                  </div>
                  <div className="space-y-1">
                    <div className="text-2xl font-bold">
                      {metric.value}{metric.unit}
                    </div>
                    <p className="text-xs text-muted-foreground">{metric.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* System Health */}
      <Card className="bg-gradient-to-br from-card to-card/80">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-warning" />
            System Health
          </CardTitle>
          <CardDescription>
            System health indicators and alerts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-success/10 border border-success/20">
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-success animate-pulse" />
                <span className="text-sm font-medium">All systems operational</span>
              </div>
              <Badge variant="default" className="bg-success text-success-foreground">
                Healthy
              </Badge>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-warning/10 border border-warning/20">
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-warning" />
                <span className="text-sm font-medium">High memory usage detected</span>
              </div>
              <Badge variant="secondary" className="bg-warning text-warning-foreground">
                Warning
              </Badge>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-primary/10 border border-primary/20">
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-primary" />
                <span className="text-sm font-medium">AI processing pipeline active</span>
              </div>
              <Badge variant="default">
                Active
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance History */}
      <Card className="bg-gradient-to-br from-card to-card/80">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-muted-foreground" />
            Performance History
          </CardTitle>
          <CardDescription>
            Historical performance data and trends
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 rounded-lg bg-secondary/30">
                <div className="text-2xl font-bold text-success">99.8%</div>
                <div className="text-sm text-muted-foreground">24h Uptime</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-secondary/30">
                <div className="text-2xl font-bold text-primary">156</div>
                <div className="text-sm text-muted-foreground">Jobs Completed</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-secondary/30">
                <div className="text-2xl font-bold text-accent">47ms</div>
                <div className="text-sm text-muted-foreground">Avg Response Time</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};