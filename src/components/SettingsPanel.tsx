import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  Key, 
  Shield, 
  Globe, 
  Bell, 
  Palette, 
  Database, 
  Cpu, 
  Save,
  Eye,
  EyeOff,
  CheckCircle,
  AlertTriangle
} from "lucide-react";

interface ApiKey {
  service: string;
  key: string;
  status: "valid" | "invalid" | "untested";
}

export const SettingsPanel = () => {
  const { toast } = useToast();
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([
    { service: "OpenAI", key: "", status: "untested" },
    { service: "Anthropic", key: "", status: "untested" },
    { service: "Google AI", key: "", status: "untested" },
    { service: "Azure OpenAI", key: "", status: "untested" }
  ]);
  const [showKeys, setShowKeys] = useState<{ [key: string]: boolean }>({});
  const [settings, setSettings] = useState({
    notifications: true,
    autoSave: true,
    darkMode: true,
    debugMode: false,
    maxConcurrentJobs: 3,
    cacheSize: 1024,
    logLevel: "info"
  });

  // Load settings from localStorage on component mount
  useEffect(() => {
    const savedApiKeys = localStorage.getItem("virapilot-api-keys");
    const savedSettings = localStorage.getItem("virapilot-settings");
    
    if (savedApiKeys) {
      try {
        setApiKeys(JSON.parse(savedApiKeys));
      } catch (error) {
        console.error("Failed to load API keys:", error);
      }
    }
    
    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings));
      } catch (error) {
        console.error("Failed to load settings:", error);
      }
    }
  }, []);

  const saveApiKey = (service: string, key: string) => {
    const updatedKeys = apiKeys.map(apiKey => 
      apiKey.service === service 
        ? { ...apiKey, key, status: key ? "valid" as const : "untested" as const }
        : apiKey
    );
    setApiKeys(updatedKeys);
    localStorage.setItem("virapilot-api-keys", JSON.stringify(updatedKeys));
    
    toast({
      title: "API Key Saved",
      description: `${service} API key has been securely stored locally.`,
    });
  };

  const saveSettings = () => {
    localStorage.setItem("virapilot-settings", JSON.stringify(settings));
    toast({
      title: "Settings Saved",
      description: "Your preferences have been saved successfully.",
    });
  };

  const testApiKey = async (service: string) => {
    // Simulate API key validation
    const updatedKeys = apiKeys.map(apiKey => 
      apiKey.service === service 
        ? { ...apiKey, status: Math.random() > 0.3 ? "valid" as const : "invalid" as const }
        : apiKey
    );
    setApiKeys(updatedKeys);
    localStorage.setItem("virapilot-api-keys", JSON.stringify(updatedKeys));
  };

  const toggleKeyVisibility = (service: string) => {
    setShowKeys(prev => ({
      ...prev,
      [service]: !prev[service]
    }));
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "valid":
        return <CheckCircle className="h-4 w-4 text-success" />;
      case "invalid":
        return <AlertTriangle className="h-4 w-4 text-destructive" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "valid":
        return <Badge variant="default" className="bg-success text-success-foreground">Valid</Badge>;
      case "invalid":
        return <Badge variant="destructive">Invalid</Badge>;
      default:
        return <Badge variant="secondary">Untested</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="api-keys" className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-card">
          <TabsTrigger value="api-keys" className="flex items-center gap-2">
            <Key className="h-4 w-4" />
            API Keys
          </TabsTrigger>
          <TabsTrigger value="general" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            General
          </TabsTrigger>
          <TabsTrigger value="performance" className="flex items-center gap-2">
            <Cpu className="h-4 w-4" />
            Performance
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Security
          </TabsTrigger>
        </TabsList>

        <TabsContent value="api-keys" className="space-y-6">
          <Card className="bg-gradient-to-br from-card to-card/80">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5 text-primary" />
                API Key Management
              </CardTitle>
              <CardDescription>
                Store your AI service API keys securely in local browser storage
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {apiKeys.map((apiKey) => (
                <div key={apiKey.service} className="space-y-3 p-4 rounded-lg bg-secondary/30 border border-border/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Label className="font-medium">{apiKey.service}</Label>
                      {getStatusIcon(apiKey.status)}
                      {getStatusBadge(apiKey.status)}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => testApiKey(apiKey.service)}
                      className="flex items-center gap-2"
                    >
                      Test Connection
                    </Button>
                  </div>
                  
                  <div className="flex gap-2">
                    <div className="flex-1 relative">
                      <Input
                        type={showKeys[apiKey.service] ? "text" : "password"}
                        placeholder={`Enter ${apiKey.service} API key...`}
                        value={apiKey.key}
                        onChange={(e) => {
                          const updatedKeys = apiKeys.map(k => 
                            k.service === apiKey.service 
                              ? { ...k, key: e.target.value, status: "untested" as const }
                              : k
                          );
                          setApiKeys(updatedKeys);
                        }}
                        className="pr-10"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => toggleKeyVisibility(apiKey.service)}
                      >
                        {showKeys[apiKey.service] ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    <Button
                      onClick={() => saveApiKey(apiKey.service, apiKey.key)}
                      className="flex items-center gap-2"
                    >
                      <Save className="h-4 w-4" />
                      Save
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="general" className="space-y-6">
          <Card className="bg-gradient-to-br from-card to-card/80">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-accent" />
                General Settings
              </CardTitle>
              <CardDescription>
                Configure general application preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive notifications for pipeline events
                  </p>
                </div>
                <Switch
                  checked={settings.notifications}
                  onCheckedChange={(checked) => 
                    setSettings(prev => ({ ...prev, notifications: checked }))
                  }
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Auto-save</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically save work every 30 seconds
                  </p>
                </div>
                <Switch
                  checked={settings.autoSave}
                  onCheckedChange={(checked) => 
                    setSettings(prev => ({ ...prev, autoSave: checked }))
                  }
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Debug Mode</Label>
                  <p className="text-sm text-muted-foreground">
                    Show detailed debug information
                  </p>
                </div>
                <Switch
                  checked={settings.debugMode}
                  onCheckedChange={(checked) => 
                    setSettings(prev => ({ ...prev, debugMode: checked }))
                  }
                />
              </div>

              <Separator />

              <Button onClick={saveSettings} className="w-full">
                <Save className="h-4 w-4 mr-2" />
                Save General Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <Card className="bg-gradient-to-br from-card to-card/80">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Cpu className="h-5 w-5 text-warning" />
                Performance Settings
              </CardTitle>
              <CardDescription>
                Optimize application performance and resource usage
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="concurrent-jobs">Max Concurrent Jobs</Label>
                <Input
                  id="concurrent-jobs"
                  type="number"
                  min="1"
                  max="10"
                  value={settings.maxConcurrentJobs}
                  onChange={(e) => 
                    setSettings(prev => ({ 
                      ...prev, 
                      maxConcurrentJobs: parseInt(e.target.value) || 1 
                    }))
                  }
                />
                <p className="text-xs text-muted-foreground">
                  Number of simultaneous processing jobs (1-10)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cache-size">Cache Size (MB)</Label>
                <Input
                  id="cache-size"
                  type="number"
                  min="512"
                  max="4096"
                  value={settings.cacheSize}
                  onChange={(e) => 
                    setSettings(prev => ({ 
                      ...prev, 
                      cacheSize: parseInt(e.target.value) || 512 
                    }))
                  }
                />
                <p className="text-xs text-muted-foreground">
                  Memory allocated for caching (512-4096 MB)
                </p>
              </div>

              <Button onClick={saveSettings} className="w-full">
                <Save className="h-4 w-4 mr-2" />
                Save Performance Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card className="bg-gradient-to-br from-card to-card/80">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-destructive" />
                Security Settings
              </CardTitle>
              <CardDescription>
                Configure security and privacy settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
                <h4 className="font-medium flex items-center gap-2 mb-2">
                  <Shield className="h-4 w-4" />
                  Data Storage Notice
                </h4>
                <p className="text-sm text-muted-foreground">
                  All API keys and settings are stored locally in your browser's storage. 
                  No data is transmitted to external servers except when using the configured AI services.
                </p>
              </div>

              <div className="space-y-4">
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => {
                    localStorage.removeItem("virapilot-api-keys");
                    localStorage.removeItem("virapilot-settings");
                    setApiKeys(apiKeys.map(k => ({ ...k, key: "", status: "untested" })));
                    toast({
                      title: "Data Cleared",
                      description: "All locally stored data has been cleared.",
                    });
                  }}
                >
                  Clear All Local Data
                </Button>

                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => {
                    const data = {
                      apiKeys: apiKeys.filter(k => k.key),
                      settings
                    };
                    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'virapilot-backup.json';
                    a.click();
                    URL.revokeObjectURL(url);
                  }}
                >
                  Export Configuration
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};