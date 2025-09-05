'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { MessageSquare, Send, Settings, Play, Pause, CheckCircle, AlertCircle, Loader2, Link, TestTube, Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface TransferConfig {
  evolutionApiUrl: string;
  evolutionApiKey: string;
  telegramBotToken: string;
  telegramChatId: string;
  whatsappSourceGroup: string;
  whatsappTargetGroup: string;
  replacementLink: string;
  telegramReplacementLink: string;
  isActive: boolean;
}

interface TransferLog {
  id: string;
  timestamp: string;
  message: string;
  status: 'success' | 'error' | 'info';
  source: string;
  target: string;
}

export default function Home() {
  const [config, setConfig] = useState<TransferConfig>({
    evolutionApiUrl: '',
    evolutionApiKey: '',
    telegramBotToken: '',
    telegramChatId: '@spinjuiceai',
    whatsappSourceGroup: '120363355538668931@g.us',
    whatsappTargetGroup: '💰🎁 REY DEL GREEN 🎁💰 #1',
    replacementLink: 'https://jugar.trylines.com/68b22a207a3857d4dcf79078?utm_source=ganar',
    telegramReplacementLink: 'https://t.me/spinjuiceai',
    isActive: false
  });

  const [isLoading, setIsLoading] = useState(false);
  const [logs, setLogs] = useState<TransferLog[]>([]);
  const [lastSync, setLastSync] = useState<string>('');
  const { toast } = useToast();

  // Specific links that will be replaced
  const SPECIFIC_LINKS = [
    'https://go.aff.7k-partners.com/gq18hxcm?afp=WPP',
    'https://reydelgreen.com/ruleta-premios/'
  ];
  const TELEGRAM_BOT_LINK = 'http://t.me/ReydelgreenDouble_bot';

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const response = await fetch('/api/transfer');
      const data = await response.json();
      setConfig(data.config);
      setLastSync(data.config.isActive ? new Date().toLocaleString() : '');
    } catch (error) {
      console.error('Failed to load config:', error);
    }
  };

  const handleConfigChange = (field: keyof TransferConfig, value: string) => {
    setConfig(prev => ({ ...prev, [field]: value }));
  };

  const addLog = (message: string, status: 'success' | 'error' | 'info', source: string, target: string) => {
    const newLog: TransferLog = {
      id: Date.now().toString(),
      timestamp: new Date().toLocaleString(),
      message,
      status,
      source,
      target
    };
    setLogs(prev => [newLog, ...prev.slice(0, 49)]);
  };

  const updateConfig = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/transfer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'updateConfig', ...config })
      });

      const data = await response.json();
      if (data.status === 'success') {
       toast({
  id: "config-updated",
  title: "Configuration Updated",
  description: "Your settings have been saved successfully.",
});
        addLog('Configuration updated', 'success', 'System', 'System');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update configuration.",
        variant: "destructive",
      });
      addLog('Failed to update configuration', 'error', 'System', 'System');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="text-center py-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            WhatsApp ↔ Telegram Transfer Bot
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Automatically transfer messages from WhatsApp community to Telegram and other WhatsApp groups
          </p>
          <div className="mt-4 flex items-center justify-center gap-2 flex-wrap">
            <Badge variant="secondary" className="flex items-center gap-1">
              <Link className="h-3 w-3" />
              Custom Link Rules Active
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Configuration
              </CardTitle>
              <CardDescription>
                Set up your API credentials and group settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="evolutionUrl">Evolution API URL</Label>
                <Input
                  id="evolutionUrl"
                  placeholder="https://your-evolution-api.com"
                  value={config.evolutionApiUrl}
                  onChange={(e) => handleConfigChange('evolutionApiUrl', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="evolutionKey">Evolution API Key</Label>
                <Input
                  id="evolutionKey"
                  type="password"
                  placeholder="Your Evolution API key"
                  value={config.evolutionApiKey}
                  onChange={(e) => handleConfigChange('evolutionApiKey', e.target.value)}
                />
              </div>

              <Button onClick={updateConfig} disabled={isLoading} className="w-full">
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Save Configuration
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Transfer Control
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div>
                  <p className="font-medium">Service Status</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {config.isActive ? 'Running' : 'Stopped'}
                  </p>
                </div>
                <Badge variant={config.isActive ? 'default' : 'secondary'}>
                  {config.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
