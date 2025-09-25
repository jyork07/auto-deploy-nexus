import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Brain, 
  TrendingUp, 
  Target, 
  BarChart3, 
  Lightbulb, 
  AlertCircle,
  CheckCircle,
  Clock,
  Zap,
  Filter
} from "lucide-react";

export const AIInsights = () => {
  const [selectedModel, setSelectedModel] = useState("gpt-4");
  
  const modelPerformance = [
    {
      model: "GPT-4",
      accuracy: 94.2,
      speed: 78,
      cost: 85,
      usage: 245,
      status: "active"
    },
    {
      model: "Claude-3",
      accuracy: 91.8,
      speed: 82,
      cost: 72,
      usage: 156,
      status: "active"
    },
    {
      model: "Gemini Pro",
      accuracy: 89.5,
      speed: 89,
      cost: 64,
      usage: 89,
      status: "standby"
    },
    {
      model: "GPT-3.5",
      accuracy: 87.3,
      speed: 95,
      cost: 42,
      usage: 378,
      status: "active"
    }
  ];

  const insights = [
    {
      type: "optimization",
      title: "Performance Optimization",
      description: "GPT-4 shows highest accuracy but consider using GPT-3.5 for cost-sensitive tasks",
      impact: "high",
      icon: TrendingUp
    },
    {
      type: "cost",
      title: "Cost Analysis",
      description: "Switching 30% of simple tasks to GPT-3.5 could save $1,200/month",
      impact: "medium",
      icon: Target
    },
    {
      type: "usage",
      title: "Usage Pattern",
      description: "Peak usage detected between 9-11 AM. Consider load balancing",
      impact: "low",
      icon: BarChart3
    },
    {
      type: "alert",
      title: "Rate Limit Warning",
      description: "OpenAI API approaching rate limits. Consider upgrading plan",
      impact: "high",
      icon: AlertCircle
    }
  ];

  const recentAnalytics = [
    {
      metric: "Total Requests",
      value: "12,847",
      change: "+23%",
      trend: "up"
    },
    {
      metric: "Success Rate",
      value: "98.2%",
      change: "+1.2%",
      trend: "up"
    },
    {
      metric: "Avg Response Time",
      value: "1.8s",
      change: "-0.3s",
      trend: "down"
    },
    {
      metric: "Cost per Request",
      value: "$0.045",
      change: "-15%",
      trend: "down"
    }
  ];

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case "high": return "text-destructive";
      case "medium": return "text-warning";
      case "low": return "text-success";
      default: return "text-muted-foreground";
    }
  };

  const getImpactBadge = (impact: string) => {
    switch (impact) {
      case "high": return { variant: "destructive" as const, text: "High Impact" };
      case "medium": return { variant: "secondary" as const, text: "Medium Impact" };
      case "low": return { variant: "default" as const, text: "Low Impact" };
      default: return { variant: "secondary" as const, text: "Unknown" };
    }
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="performance" className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-card">
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="space-y-6">
          <Card className="bg-gradient-to-br from-card to-card/80">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-primary" />
                Model Performance Comparison
              </CardTitle>
              <CardDescription>
                Real-time performance metrics across all AI models
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {modelPerformance.map((model) => (
                  <div key={model.model} className="p-4 rounded-lg bg-secondary/30 border border-border/50">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <h3 className="font-semibold">{model.model}</h3>
                        <Badge variant={model.status === "active" ? "default" : "secondary"}>
                          {model.status}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {model.usage} requests today
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Accuracy</span>
                          <span className="font-medium">{model.accuracy}%</span>
                        </div>
                        <Progress value={model.accuracy} className="h-2" />
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Speed</span>
                          <span className="font-medium">{model.speed}%</span>
                        </div>
                        <Progress value={model.speed} className="h-2" />
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Cost Efficiency</span>
                          <span className="font-medium">{model.cost}%</span>
                        </div>
                        <Progress value={model.cost} className="h-2" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card className="bg-gradient-to-br from-card to-card/80">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-accent" />
                Usage Analytics
              </CardTitle>
              <CardDescription>
                Detailed analytics and usage patterns
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {recentAnalytics.map((analytic) => (
                  <div key={analytic.metric} className="text-center p-4 rounded-lg bg-secondary/30">
                    <div className="text-2xl font-bold mb-1">{analytic.value}</div>
                    <div className="text-sm text-muted-foreground mb-2">{analytic.metric}</div>
                    <div className={`text-xs flex items-center justify-center gap-1 ${
                      analytic.trend === "up" ? "text-success" : "text-primary"
                    }`}>
                      <TrendingUp className="h-3 w-3" />
                      {analytic.change}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-card to-card/80">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-warning" />
                Processing Timeline
              </CardTitle>
              <CardDescription>
                Recent processing jobs and their status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { id: "job-001", status: "completed", time: "2 minutes ago", duration: "1.2s" },
                  { id: "job-002", status: "processing", time: "1 minute ago", duration: "processing..." },
                  { id: "job-003", status: "completed", time: "5 minutes ago", duration: "0.8s" },
                  { id: "job-004", status: "failed", time: "8 minutes ago", duration: "timeout" },
                  { id: "job-005", status: "completed", time: "12 minutes ago", duration: "2.1s" }
                ].map((job) => (
                  <div key={job.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
                    <div className="flex items-center gap-3">
                      {job.status === "completed" && <CheckCircle className="h-4 w-4 text-success" />}
                      {job.status === "processing" && <Clock className="h-4 w-4 text-primary animate-spin" />}
                      {job.status === "failed" && <AlertCircle className="h-4 w-4 text-destructive" />}
                      <span className="font-mono text-sm">{job.id}</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>{job.duration}</span>
                      <span>{job.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <Card className="bg-gradient-to-br from-card to-card/80">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-warning" />
                AI-Generated Insights
              </CardTitle>
              <CardDescription>
                Intelligent recommendations based on your usage patterns
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {insights.map((insight, index) => {
                  const Icon = insight.icon;
                  const impactBadge = getImpactBadge(insight.impact);
                  return (
                    <div key={index} className="p-4 rounded-lg bg-secondary/30 border border-border/50">
                      <div className="flex items-start gap-3">
                        <Icon className={`h-5 w-5 mt-0.5 ${getImpactColor(insight.impact)}`} />
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium">{insight.title}</h4>
                            <Badge variant={impactBadge.variant} className="text-xs">
                              {impactBadge.text}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{insight.description}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-6">
          <Card className="bg-gradient-to-br from-card to-card/80">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-success" />
                Smart Recommendations
              </CardTitle>
              <CardDescription>
                Actionable recommendations to optimize your AI pipeline
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="p-4 rounded-lg bg-success/10 border border-success/20">
                  <div className="flex items-center gap-3 mb-3">
                    <Zap className="h-5 w-5 text-success" />
                    <h4 className="font-medium">Immediate Actions</h4>
                  </div>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-success" />
                      Implement request caching to reduce API calls by 25%
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-success" />
                      Switch simple classification tasks to GPT-3.5 Turbo
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-success" />
                      Enable batch processing for non-urgent requests
                    </li>
                  </ul>
                </div>

                <div className="p-4 rounded-lg bg-warning/10 border border-warning/20">
                  <div className="flex items-center gap-3 mb-3">
                    <Filter className="h-5 w-5 text-warning" />
                    <h4 className="font-medium">Optimization Opportunities</h4>
                  </div>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-warning" />
                      Consider fine-tuning a model for your specific use case
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-warning" />
                      Implement dynamic model selection based on task complexity
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-warning" />
                      Set up automated monitoring for API rate limits
                    </li>
                  </ul>
                </div>

                <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                  <div className="flex items-center gap-3 mb-3">
                    <Brain className="h-5 w-5 text-primary" />
                    <h4 className="font-medium">Long-term Strategy</h4>
                  </div>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                      Evaluate open-source alternatives for cost reduction
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                      Plan for multi-cloud deployment to avoid vendor lock-in
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                      Invest in prompt engineering training for better results
                    </li>
                  </ul>
                </div>

                <Button className="w-full">
                  Apply Recommended Optimizations
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};