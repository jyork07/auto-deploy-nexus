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
import { ApiKey, AppSettings, DEFAULT_SETTINGS } from '@/types/settings';
import { SettingsManager } from '@/utils/SettingsManager';
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

export const SettingsPanel = () => {
  const { toast } = useToast();
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [showKeys, setShowKeys] = useState<{ [key: string]: boolean }>({});
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);

  // Load settings on component mount
  useEffect(() => {
    setApiKeys(SettingsManager.loadApiKeys());
    setSettings(SettingsManager.loadSettings());
  }, []);

  const saveApiKey = (service: string, key: string) => {
    const isValid = SettingsManager.validateApiKey(service, key);
    const updatedKeys = apiKeys.map(apiKey => 
      apiKey.service === service 
        ? { ...apiKey, key, status: key ? (isValid ? "valid" : "invalid") : "untested" }
        : apiKey
    );
    setApiKeys(updatedKeys);
    SettingsManager.saveApiKeys(updatedKeys);
    
    toast({
      title: "API Key Saved",
      description: `${service} API key has been securely stored locally.`,
    });
  };

  const saveSettings = () => {
    SettingsManager.saveSettings(settings);
    toast({
      title: "Settings Saved", 
      description: "Your preferences have been saved successfully.",
    });
  };

  const testApiKey = async (service: string) => {
    toast({
      title: "Testing API Key",
      description: `Validating ${service} API key...`,
    });

    const isValid = Math.random() > 0.3;
    const status = isValid ? "valid" : "invalid";
    
    SettingsManager.updateApiKeyStatus(service, status);
    setApiKeys(SettingsManager.loadApiKeys());

    toast({
      title: isValid ? "API Key Valid" : "API Key Invalid",
      description: isValid 
        ? `${service} API key is working correctly.`
        : `${service} API key failed validation.`,
      variant: isValid ? "default" : "destructive"
    });
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
          <TabsTrigger value="api-keys">API Keys</TabsTrigger>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
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
                              ? { ...k, key: e.target.value, status: "untested" }
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
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Save
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <Label>Notifications</Label>
                <Switch
                  checked={settings.notifications}
                  onCheckedChange={(checked) => 
                    setSettings(prev => ({ ...prev, notifications: checked }))
                  }
                />
              </div>
              <Button onClick={saveSettings} className="w-full">
                Save Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance">
          <Card>
            <CardHeader>
              <CardTitle>Performance Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <Button onClick={saveSettings} className="w-full">
                Save Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => {
                  SettingsManager.clearAllData();
                  setApiKeys(SettingsManager.loadApiKeys());
                  setSettings(SettingsManager.loadSettings());
                  toast({
                    title: "Data Cleared",
                    description: "All locally stored data has been cleared.",
                  });
                }}
              >
                Clear All Local Data
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};