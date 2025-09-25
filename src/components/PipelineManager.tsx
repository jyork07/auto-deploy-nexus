import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Download, 
  Upload, 
  Brain, 
  Layers, 
  Workflow,
  CheckCircle,
  Clock,
  AlertCircle
} from "lucide-react";

interface PipelineManagerProps {
  isProcessing: boolean;
}

export const PipelineManager = ({ isProcessing }: PipelineManagerProps) => {
  const [selectedModel, setSelectedModel] = useState("gpt-4");
  const [inputData, setInputData] = useState("");
  const [pipelineSteps, setPipelineSteps] = useState([
    { id: 1, name: "Data Preprocessing", status: "completed", progress: 100 },
    { id: 2, name: "AI Model Processing", status: isProcessing ? "running" : "pending", progress: isProcessing ? 65 : 0 },
    { id: 3, name: "Result Optimization", status: "pending", progress: 0 },
    { id: 4, name: "Output Generation", status: "pending", progress: 0 }
  ]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-success" />;
      case "running":
        return <Clock className="h-4 w-4 text-primary animate-spin" />;
      case "pending":
        return <AlertCircle className="h-4 w-4 text-muted-foreground" />;
      default:
        return <AlertCircle className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "completed":
        return "default" as const;
      case "running":
        return "default" as const;
      case "pending":
        return "secondary" as const;
      default:
        return "secondary" as const;
    }
  };

  return (
    <div className="space-y-6">
      {/* Pipeline Configuration */}
      <Card className="bg-gradient-to-br from-card to-card/80">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Workflow className="h-5 w-5 text-primary" />
            Pipeline Configuration
          </CardTitle>
          <CardDescription>
            Configure your AI processing pipeline with custom models and parameters
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="model-select">AI Model</Label>
              <Select value={selectedModel} onValueChange={setSelectedModel}>
                <SelectTrigger>
                  <SelectValue placeholder="Select AI Model" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gpt-4">GPT-4 (OpenAI)</SelectItem>
                  <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                  <SelectItem value="claude-3">Claude 3 (Anthropic)</SelectItem>
                  <SelectItem value="gemini-pro">Gemini Pro (Google)</SelectItem>
                  <SelectItem value="llama-2">Llama 2 (Meta)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Processing Mode</Label>
              <Select defaultValue="batch">
                <SelectTrigger>
                  <SelectValue placeholder="Select Processing Mode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="batch">Batch Processing</SelectItem>
                  <SelectItem value="stream">Real-time Stream</SelectItem>
                  <SelectItem value="hybrid">Hybrid Mode</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="input-data">Input Data</Label>
            <Textarea
              id="input-data"
              placeholder="Enter your data or prompt here..."
              value={inputData}
              onChange={(e) => setInputData(e.target.value)}
              className="min-h-[120px] resize-none"
            />
          </div>

          <div className="flex gap-3">
            <Button variant="outline" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Import Data
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Export Config
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <RotateCcw className="h-4 w-4" />
              Reset Pipeline
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Pipeline Steps */}
      <Card className="bg-gradient-to-br from-card to-card/80">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-accent" />
            Pipeline Steps
          </CardTitle>
          <CardDescription>
            Monitor the progress of each step in your AI processing pipeline
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {pipelineSteps.map((step) => (
              <div key={step.id} className="flex items-center justify-between p-4 rounded-lg bg-secondary/50 border border-border/50">
                <div className="flex items-center gap-3">
                  {getStatusIcon(step.status)}
                  <div>
                    <p className="font-medium">{step.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Step {step.id} of {pipelineSteps.length}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-32">
                    <Progress value={step.progress} className="h-2" />
                  </div>
                  <Badge variant={getStatusVariant(step.status)}>
                    {step.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Pipeline Controls */}
      <Card className="bg-gradient-to-br from-card to-card/80">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-warning" />
            Pipeline Controls
          </CardTitle>
          <CardDescription>
            Start, stop, and monitor your AI processing pipeline
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="font-medium">Pipeline Status</p>
              <p className="text-sm text-muted-foreground">
                {isProcessing ? "Processing data through AI models..." : "Pipeline ready to start"}
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                variant={isProcessing ? "destructive" : "default"}
                className="flex items-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <Pause className="h-4 w-4" />
                    Stop Processing
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4" />
                    Start Processing
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};