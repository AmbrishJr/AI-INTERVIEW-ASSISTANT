import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion, AnimatePresence } from "framer-motion";
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Clock, 
  Users, 
  Eye, 
  MousePointer,
  Target,
  AlertTriangle,
  CheckCircle,
  ArrowRight,
  Brain,
  BarChart3,
  LineChart,
  PieChart,
  Zap,
  Info,
  RefreshCw,
  Calendar,
  Filter
} from "lucide-react";
import { toastInfo } from "@/hooks/use-toast";
import { useAuthState } from "@/contexts/AuthStateContext";
import { useLocation } from "wouter";

// Enhanced Types
interface Session {
  id: string;
  date: string;
  sessionName: string;
  duration: number; // minutes
  focusScore: number; // 0-100
  breakCount: number;
  status: 'completed' | 'paused' | 'abandoned';
  pageViews?: number;
  scrollDepth?: number;
  interactions?: number;
}

interface AIInsight {
  type: 'trend' | 'anomaly' | 'achievement' | 'warning';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  actionable: boolean;
  recommendation?: string;
  metrics: {
    value: number;
    change: number;
    changePercent: number;
  };
}

interface BehaviorFlow {
  from: string;
  to: string;
  count: number;
  dropoffRate?: number;
}

interface FeatureAnalytics {
  feature: string;
  usage: number;
  engagement: number;
  conversion?: number;
}

interface EngagementScore {
  overall: number;
  timeSpent: number;
  interactions: number;
  returnVisits: number;
  quality: number;
}

export default function EnhancedAnalytics() {
  const [, setLocation] = useLocation();
  const { isLoggedIn } = useAuthState();
  
  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoggedIn) {
      setLocation('/login');
    }
  }, [isLoggedIn, setLocation]);
  
  // Don't render if not logged in
  if (!isLoggedIn) {
    return null;
  }
  
  // State
  const [sessions, setSessions] = useState<Session[]>([]);
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [engagementScore, setEngagementScore] = useState<EngagementScore | null>(null);
  const [behaviorFlow, setBehaviorFlow] = useState<BehaviorFlow[]>([]);
  const [featureAnalytics, setFeatureAnalytics] = useState<FeatureAnalytics[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTimeframe, setSelectedTimeframe] = useState('7d');
  const [compareMode, setCompareMode] = useState<'none' | 'period' | 'feature'>('none');
  const [chartExplanation, setChartExplanation] = useState<any>(null);

  // Mock enhanced data
  const mockSessions: Session[] = [
    { id: '1', date: '2024-01-23', sessionName: 'Morning Practice', duration: 45, focusScore: 85, breakCount: 1, status: 'completed', pageViews: 12, scrollDepth: 78, interactions: 25 },
    { id: '2', date: '2024-01-23', sessionName: 'News Reading', duration: 30, focusScore: 72, breakCount: 0, status: 'completed', pageViews: 8, scrollDepth: 65, interactions: 15 },
    { id: '3', date: '2024-01-22', sessionName: 'Evening Review', duration: 60, focusScore: 90, breakCount: 2, status: 'completed', pageViews: 15, scrollDepth: 85, interactions: 32 },
    { id: '4', date: '2024-01-22', sessionName: 'Quick Session', duration: 20, focusScore: 65, breakCount: 0, status: 'paused', pageViews: 5, scrollDepth: 45, interactions: 8 },
    { id: '5', date: '2024-01-21', sessionName: 'Deep Work', duration: 120, focusScore: 88, breakCount: 3, status: 'completed', pageViews: 25, scrollDepth: 92, interactions: 45 },
  ];

  const mockBehaviorFlow: BehaviorFlow[] = [
    { from: 'Home', to: 'Dashboard', count: 145, dropoffRate: 5 },
    { from: 'Dashboard', to: 'News', count: 89, dropoffRate: 12 },
    { from: 'News', to: 'Jobs', count: 67, dropoffRate: 8 },
    { from: 'Jobs', to: 'Analytics', count: 34, dropoffRate: 15 },
    { from: 'Analytics', to: 'Session', count: 28, dropoffRate: 3 },
  ];

  const mockFeatureAnalytics: FeatureAnalytics[] = [
    { feature: 'News Search', usage: 234, engagement: 78, conversion: 45 },
    { feature: 'Job Filters', usage: 189, engagement: 65, conversion: 32 },
    { feature: 'AI Coach', usage: 156, engagement: 82, conversion: 28 },
    { feature: 'Bookmarks', usage: 98, engagement: 71, conversion: 19 },
    { feature: 'Sessions', usage: 267, engagement: 89, conversion: 67 },
  ];

  useEffect(() => {
    loadAnalyticsData();
  }, [selectedTimeframe]);

  const loadAnalyticsData = async () => {
    setLoading(true);
    try {
      // Simulate API calls
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSessions(mockSessions);
      setBehaviorFlow(mockBehaviorFlow);
      setFeatureAnalytics(mockFeatureAnalytics);
      
      // Generate AI insights
      await generateAIInsights();
      
      // Calculate engagement score
      calculateEngagementScore();
      
    } catch (error) {
      console.error('Failed to load analytics:', error);
      toastInfo('Error', 'Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const generateAIInsights = async () => {
    try {
      const response = await fetch('/api/analytics/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          data: {
            sessions: mockSessions,
            features: mockFeatureAnalytics,
            timeframe: selectedTimeframe
          },
          type: 'general',
          timeframe: selectedTimeframe
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        setInsights(data.insights || []);
        setEngagementScore({
          overall: data.engagementScore || 0,
          timeSpent: 85,
          interactions: 78,
          returnVisits: 92,
          quality: 88
        });
      }
    } catch (error) {
      // Fallback insights
      setInsights([
        {
          type: 'achievement',
          title: 'Focus Score Improved',
          description: 'Your average focus score increased by 12% this week, showing better concentration during practice sessions.',
          impact: 'high',
          actionable: false,
          recommendation: 'Keep up the great work!',
          metrics: { value: 85, change: 12, changePercent: 12 }
        },
        {
          type: 'trend',
          title: 'News Engagement Rising',
          description: 'You\'re spending 23% more time reading tech news, which helps with interview preparation.',
          impact: 'medium',
          actionable: true,
          recommendation: 'Focus on AI and cloud computing news for better results.',
          metrics: { value: 45, change: 8, changePercent: 23 }
        }
      ]);
    }
  };

  const calculateEngagementScore = () => {
    const avgFocus = mockSessions.reduce((sum, s) => sum + s.focusScore, 0) / mockSessions.length;
    const avgDuration = mockSessions.reduce((sum, s) => sum + s.duration, 0) / mockSessions.length;
    const completionRate = mockSessions.filter(s => s.status === 'completed').length / mockSessions.length * 100;
    
    const score = Math.round((avgFocus * 0.4 + avgDuration * 0.3 + completionRate * 0.3));
    
    setEngagementScore({
      overall: score,
      timeSpent: Math.min(100, avgDuration * 2),
      interactions: 85,
      returnVisits: 92,
      quality: score
    });
  };

  const explainChart = async (chartType: string, data: any, question?: string) => {
    try {
      const response = await fetch('/api/analytics/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chartType, data, question })
      });
      
      if (response.ok) {
        const explanation = await response.json();
        setChartExplanation(explanation);
      }
    } catch (error) {
      console.error('Failed to explain chart:', error);
    }
  };

  // Calculate metrics
  const metrics = useMemo(() => {
    const totalSessions = sessions.length;
    const avgFocusScore = Math.round(sessions.reduce((sum, s) => sum + s.focusScore, 0) / totalSessions);
    const totalTimeSpent = sessions.reduce((sum, s) => sum + s.duration, 0);
    const completionRate = Math.round((sessions.filter(s => s.status === 'completed').length / totalSessions) * 100);
    
    return {
      totalSessions,
      avgFocusScore,
      totalTimeSpent,
      completionRate,
      pageViews: sessions.reduce((sum, s) => sum + (s.pageViews || 0), 0),
      avgScrollDepth: Math.round(sessions.reduce((sum, s) => sum + (s.scrollDepth || 0), 0) / totalSessions),
      totalInteractions: sessions.reduce((sum, s) => sum + (s.interactions || 0), 0)
    };
  }, [sessions]);

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'trend': return TrendingUp;
      case 'anomaly': return AlertTriangle;
      case 'achievement': return CheckCircle;
      case 'warning': return AlertTriangle;
      default: return Info;
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'trend': return 'text-blue-600 bg-blue-50';
      case 'anomaly': return 'text-orange-600 bg-orange-50';
      case 'achievement': return 'text-green-600 bg-green-50';
      case 'warning': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-64 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-32 bg-muted rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Analytics</h1>
            <p className="text-muted-foreground">AI-powered insights into your interview preparation journey</p>
          </div>
          <div className="flex items-center gap-3">
            <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="24h">Last 24h</SelectItem>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={loadAnalyticsData}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* What's Happening - Smart Highlights */}
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-blue-600" />
              What's Happening
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <AnimatePresence>
                {insights.slice(0, 3).map((insight, index) => {
                  const Icon = getInsightIcon(insight.type);
                  return (
                    <motion.div
                      key={insight.title}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className={`p-4 rounded-lg border ${getInsightColor(insight.type)}`}
                    >
                      <div className="flex items-start gap-3">
                        <Icon className="h-5 w-5 mt-0.5" />
                        <div className="flex-1">
                          <h4 className="font-semibold text-sm">{insight.title}</h4>
                          <p className="text-xs mt-1 opacity-80">{insight.description}</p>
                          {insight.actionable && insight.recommendation && (
                            <div className="mt-2 flex items-center gap-1">
                              <ArrowRight className="h-3 w-3" />
                              <span className="text-xs font-medium">{insight.recommendation}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </CardContent>
        </Card>

        {/* Engagement Quality Score */}
        {engagementScore && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Engagement Quality Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                <div className="text-center">
                  <div className="text-4xl font-bold text-primary">{engagementScore.overall}</div>
                  <div className="text-sm text-muted-foreground mt-1">Overall Score</div>
                  <Progress value={engagementScore.overall} className="mt-2" />
                </div>
                <div className="text-center">
                  <div className="text-2xl font-semibold">{engagementScore.timeSpent}%</div>
                  <div className="text-sm text-muted-foreground">Time Spent</div>
                  <Progress value={engagementScore.timeSpent} className="mt-2" />
                </div>
                <div className="text-center">
                  <div className="text-2xl font-semibold">{engagementScore.interactions}%</div>
                  <div className="text-sm text-muted-foreground">Interactions</div>
                  <Progress value={engagementScore.interactions} className="mt-2" />
                </div>
                <div className="text-center">
                  <div className="text-2xl font-semibold">{engagementScore.returnVisits}%</div>
                  <div className="text-sm text-muted-foreground">Return Visits</div>
                  <Progress value={engagementScore.returnVisits} className="mt-2" />
                </div>
                <div className="text-center">
                  <div className="text-2xl font-semibold">{engagementScore.quality}%</div>
                  <div className="text-sm text-muted-foreground">Quality</div>
                  <Progress value={engagementScore.quality} className="mt-2" />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="behavior">Behavior Flow</TabsTrigger>
            <TabsTrigger value="features">Features</TabsTrigger>
            <TabsTrigger value="insights">AI Insights</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Total Sessions</p>
                      <p className="text-2xl font-bold">{metrics.totalSessions}</p>
                    </div>
                    <Activity className="h-8 w-8 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Avg Focus Score</p>
                      <p className="text-2xl font-bold">{metrics.avgFocusScore}%</p>
                    </div>
                    <Target className="h-8 w-8 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Completion Rate</p>
                      <p className="text-2xl font-bold">{metrics.completionRate}%</p>
                    </div>
                    <CheckCircle className="h-8 w-8 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Total Time</p>
                      <p className="text-2xl font-bold">{Math.round(metrics.totalTimeSpent / 60)}h</p>
                    </div>
                    <Clock className="h-8 w-8 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Performance Chart with AI Explain */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Performance Trends</CardTitle>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => explainChart('performance', sessions)}
                >
                  <Brain className="h-4 w-4 mr-2" />
                  Explain
                </Button>
              </CardHeader>
              <CardContent>
                {chartExplanation && (
                  <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h4 className="font-semibold text-blue-900 mb-2">AI Explanation</h4>
                    <p className="text-sm text-blue-800">{chartExplanation.explanation}</p>
                    {chartExplanation.nextSteps && (
                      <p className="text-sm text-blue-700 mt-2">
                        <strong>Next steps:</strong> {chartExplanation.nextSteps}
                      </p>
                    )}
                  </div>
                )}
                <div className="h-64 flex items-center justify-center border-2 border-dashed border-muted rounded-lg">
                  <div className="text-center">
                    <LineChart className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                    <p className="text-muted-foreground">Performance chart visualization</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="behavior" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>User Behavior Flow</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {behaviorFlow.map((flow, index) => (
                    <div key={index} className="flex items-center gap-4">
                      <div className="flex items-center gap-2 min-w-0">
                        <Badge variant="outline">{flow.from}</Badge>
                        <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <Badge variant="outline">{flow.to}</Badge>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{flow.count} users</span>
                          {flow.dropoffRate && (
                            <Badge variant="secondary" className="text-xs">
                              {flow.dropoffRate}% dropoff
                            </Badge>
                          )}
                        </div>
                        <Progress 
                          value={(flow.count / Math.max(...behaviorFlow.map(f => f.count))) * 100} 
                          className="mt-1" 
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="features" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Feature Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {featureAnalytics.map((feature, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-semibold">{feature.feature}</h4>
                        <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                          <span>{feature.usage} uses</span>
                          <span>{feature.engagement}% engagement</span>
                          {feature.conversion && <span>{feature.conversion}% conversion</span>}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold">{feature.engagement}%</div>
                        <div className="text-sm text-muted-foreground">engagement</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="insights" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>AI-Generated Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {insights.map((insight, index) => {
                    const Icon = getInsightIcon(insight.type);
                    return (
                      <div key={index} className={`p-4 rounded-lg border ${getInsightColor(insight.type)}`}>
                        <div className="flex items-start gap-3">
                          <Icon className="h-5 w-5 mt-0.5" />
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <h4 className="font-semibold">{insight.title}</h4>
                              <Badge variant="outline">{insight.impact} impact</Badge>
                            </div>
                            <p className="text-sm mt-2">{insight.description}</p>
                            {insight.actionable && insight.recommendation && (
                              <div className="mt-3 p-3 bg-white/50 rounded border">
                                <div className="flex items-center gap-2 text-sm font-medium">
                                  <Zap className="h-4 w-4" />
                                  Recommendation
                                </div>
                                <p className="text-sm mt-1">{insight.recommendation}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
