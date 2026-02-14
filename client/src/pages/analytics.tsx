import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// Types
interface Session {
  id: string;
  date: string;
  sessionName: string;
  duration: number; // minutes
  focusScore: number; // 0-100
  breakCount: number;
  status: 'completed' | 'paused' | 'abandoned';
}

interface Goal {
  id: string;
  title: string;
  target: number;
  current: number;
  unit: string;
}

interface Insight {
  id: string;
  type: 'positive' | 'warning' | 'suggestion';
  text: string;
}

export default function Analytics() {
  // Mock data setup
  const [sessions] = useState<Session[]>([
    { id: '1', date: '2024-01-15', sessionName: 'Morning Focus', duration: 45, focusScore: 85, breakCount: 1, status: 'completed' },
    { id: '2', date: '2024-01-15', sessionName: 'Afternoon Study', duration: 60, focusScore: 72, breakCount: 2, status: 'completed' },
    { id: '3', date: '2024-01-14', sessionName: 'Evening Review', duration: 30, focusScore: 90, breakCount: 0, status: 'completed' },
    { id: '4', date: '2024-01-14', sessionName: 'Quick Session', duration: 15, focusScore: 65, breakCount: 0, status: 'paused' },
    { id: '5', date: '2024-01-13', sessionName: 'Deep Work', duration: 120, focusScore: 88, breakCount: 3, status: 'completed' },
    { id: '6', date: '2024-01-13', sessionName: 'Practice Run', duration: 40, focusScore: 55, breakCount: 1, status: 'abandoned' },
    { id: '7', date: '2024-01-12', sessionName: 'Morning Routine', duration: 50, focusScore: 78, breakCount: 1, status: 'completed' },
    { id: '8', date: '2024-01-12', sessionName: 'Late Night', duration: 35, focusScore: 45, breakCount: 0, status: 'paused' },
    { id: '9', date: '2024-01-11', sessionName: 'Weekend Study', duration: 90, focusScore: 82, breakCount: 2, status: 'completed' },
    { id: '10', date: '2024-01-11', sessionName: 'Quick Review', duration: 25, focusScore: 91, breakCount: 0, status: 'completed' },
  ]);

  const [goals, setGoals] = useState<Goal[]>([
    { id: '1', title: 'Weekly Sessions', target: 10, current: 7, unit: 'sessions' },
    { id: '2', title: 'Focus Score Average', target: 80, current: 75, unit: 'score' },
  ]);

  const [insights, setInsights] = useState<Insight[]>([]);
  const [selectedSessionA, setSelectedSessionA] = useState('');
  const [selectedSessionB, setSelectedSessionB] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'duration' | 'focusScore'>('date');
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackGiven, setFeedbackGiven] = useState<'yes' | 'no' | null>(null);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // Calculate metrics
  const metrics = useMemo(() => {
    const totalSessions = sessions.length;
    const avgFocusScore = Math.round(sessions.reduce((sum, s) => sum + s.focusScore, 0) / totalSessions);
    const totalTimeSpent = sessions.reduce((sum, s) => sum + s.duration, 0);
    
    // Calculate productivity trend (compare first half vs second half)
    const halfPoint = Math.floor(totalSessions / 2);
    const firstHalf = sessions.slice(halfPoint);
    const secondHalf = sessions.slice(0, halfPoint);
    const firstHalfAvg = firstHalf.reduce((sum, s) => sum + s.focusScore, 0) / firstHalf.length;
    const secondHalfAvg = secondHalf.reduce((sum, s) => sum + s.focusScore, 0) / secondHalf.length;
    const trend = firstHalfAvg > secondHalfAvg ? 'up' : 'down';

    return {
      totalSessions,
      avgFocusScore,
      totalTimeSpent,
      trend,
    };
  }, [sessions]);

  // Session distribution
  const distribution = useMemo(() => {
    const completed = sessions.filter(s => s.status === 'completed').length;
    const paused = sessions.filter(s => s.status === 'paused').length;
    const abandoned = sessions.filter(s => s.status === 'abandoned').length;
    return { completed, paused, abandoned };
  }, [sessions]);

  // Time-based insights
  const timeInsights = useMemo(() => {
    // Mock best/worst times based on session data
    const bestTime = '9:00 AM - 11:00 AM';
    const worstTime = '2:00 PM - 4:00 PM';
    return { bestTime, worstTime };
  }, []);

  // Generate AI insights
  const generateInsights = () => {
    const newInsights: Insight[] = [];
    
    if (metrics.avgFocusScore > 70) {
      newInsights.push({
        id: '1',
        type: 'positive',
        text: `Great job! Your average focus score of ${metrics.avgFocusScore}% shows excellent concentration.`
      });
    }
    
    const longSessions = sessions.filter(s => s.duration > 90);
    if (longSessions.length > 0) {
      newInsights.push({
        id: '2',
        type: 'warning',
        text: `You have ${longSessions.length} sessions over 90 minutes. Consider shorter sessions to maintain focus.`
      });
    }
    
    const sessionsWithBreaks = sessions.filter(s => s.breakCount > 0);
    if (sessionsWithBreaks.length > sessions.length / 2) {
      newInsights.push({
        id: '3',
        type: 'suggestion',
        text: 'Taking breaks seems to help your focus. Keep up the good habit!'
      });
    }
    
    setInsights(newInsights);
  };

  // Filter and sort sessions for table
  const filteredSessions = useMemo(() => {
    let filtered = sessions.filter(session =>
      session.sessionName.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    return filtered.sort((a, b) => {
      if (sortBy === 'date') return b.date.localeCompare(a.date);
      if (sortBy === 'duration') return b.duration - a.duration;
      if (sortBy === 'focusScore') return b.focusScore - a.focusScore;
      return 0;
    });
  }, [sessions, searchQuery, sortBy]);

  // Timeline events
  const timelineEvents = useMemo(() => {
    const bestSession = sessions.reduce((best, current) => 
      current.focusScore > best.focusScore ? current : best
    );
    const longestSession = sessions.reduce((longest, current) => 
      current.duration > longest.duration ? current : longest
    );
    
    return [
      { type: 'Best Session', session: bestSession },
      { type: 'Longest Session', session: longestSession },
      { type: 'Low Productivity', session: sessions.find(s => s.focusScore < 60) || sessions[0] },
    ];
  }, [sessions]);

  // Export functions
  const exportCSV = () => {
    alert('CSV Export: This would download your analytics data as CSV');
  };

  const exportPDF = () => {
    alert('PDF Export: This would generate a PDF report of your analytics');
  };

  const submitFeedback = () => {
    alert(`Feedback submitted: ${feedbackGiven ? feedbackGiven : 'No feedback'} - ${feedbackText}`);
    setFeedbackText('');
    setFeedbackGiven(null);
  };

  const updateGoal = (goalId: string) => {
    alert(`Goal ${goalId} updated successfully!`);
  };

  const addNewGoal = () => {
    const newGoal: Goal = {
      id: Date.now().toString(),
      title: 'New Goal',
      target: 100,
      current: 0,
      unit: 'units'
    };
    setGoals([...goals, newGoal]);
  };

  // Initialize insights on mount
  useEffect(() => {
    generateInsights();
  }, []);

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-3xl font-bold mb-2">Analytics</h1>
        <p className="text-muted-foreground">Track your productivity and performance insights</p>
      </div>

      {/* Metrics Overview */}
      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-6 pb-2 border-b border-border">Metrics Overview</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-card/40 backdrop-blur-md border-white/5">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Sessions</p>
                  <p className="text-2xl font-bold">{metrics.totalSessions}</p>
                </div>
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                  <div className="w-5 h-5 rounded-full bg-primary"></div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card/40 backdrop-blur-md border-white/5">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Average Focus Score</p>
                  <p className="text-2xl font-bold">{metrics.avgFocusScore}%</p>
                </div>
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                  <div className="w-5 h-5 rounded-full bg-primary"></div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card/40 backdrop-blur-md border-white/5">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Time Spent</p>
                  <p className="text-2xl font-bold">{metrics.totalTimeSpent} min</p>
                </div>
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                  <div className="w-5 h-5 rounded-full bg-primary"></div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card/40 backdrop-blur-md border-white/5">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Productivity Trend</p>
                  <p className={`text-2xl font-bold ${metrics.trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                    {metrics.trend === 'up' ? '↗️ Up' : '↘️ Down'}
                  </p>
                </div>
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                  <div className="w-5 h-5 rounded-full bg-primary"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Productivity Visualization */}
      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-6 pb-2 border-b border-border">Productivity Visualization</h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="bg-card/40 backdrop-blur-md border-white/5">
            <CardHeader>
              <CardTitle className="text-base">Focus Score Over Time</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="h-48 bg-muted rounded-lg flex items-center justify-center">
                <span className="text-muted-foreground">Chart: Focus scores trending upward</span>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card/40 backdrop-blur-md border-white/5">
            <CardHeader>
              <CardTitle className="text-base">Session Duration Per Day</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="h-48 bg-muted rounded-lg flex items-center justify-center">
                <span className="text-muted-foreground">Chart: Daily session averages</span>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card/40 backdrop-blur-md border-white/5">
            <CardHeader>
              <CardTitle className="text-base">Productivity Trend</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="h-48 bg-muted rounded-lg flex items-center justify-center">
                <span className="text-muted-foreground">Chart: Overall productivity trend</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Session Distribution */}
      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-6 pb-2 border-b border-border">Session Distribution</h2>
        <Card className="bg-card/40 backdrop-blur-md border-white/5">
          <CardContent className="p-6">
            <div className="flex gap-6 items-center">
              <div className="flex-1 space-y-3">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-sm mr-2"></div>
                  <span>Completed: {distribution.completed}</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-yellow-500 rounded-sm mr-2"></div>
                  <span>Paused: {distribution.paused}</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-red-500 rounded-sm mr-2"></div>
                  <span>Abandoned: {distribution.abandoned}</span>
                </div>
              </div>
              <div className="flex-2 h-24 bg-muted rounded-lg flex items-center justify-center">
                <span className="text-muted-foreground">Distribution Chart</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Time-Based Insights */}
      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-6 pb-2 border-b border-border">Time-Based Insights</h2>
        <Card className="bg-card/40 backdrop-blur-md border-white/5">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-base mb-3 text-green-500">Best Time for Focus</h3>
                <p className="text-lg font-semibold">{timeInsights.bestTime}</p>
              </div>
              <div>
                <h3 className="text-base mb-3 text-red-500">Worst Time for Focus</h3>
                <p className="text-lg font-semibold">{timeInsights.worstTime}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Session Comparison Tool */}
      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-6 pb-2 border-b border-border">Session Comparison Tool</h2>
        <Card className="bg-card/40 backdrop-blur-md border-white/5">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block mb-2 font-semibold">Session A:</label>
                <select 
                  value={selectedSessionA} 
                  onChange={(e) => setSelectedSessionA(e.target.value)}
                  className="w-full p-2 border border-border rounded-md bg-background"
                >
                  <option value="">Select session...</option>
                  {sessions.map(session => (
                    <option key={session.id} value={session.id}>{session.sessionName}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block mb-2 font-semibold">Session B:</label>
                <select 
                  value={selectedSessionB} 
                  onChange={(e) => setSelectedSessionB(e.target.value)}
                  className="w-full p-2 border border-border rounded-md bg-background"
                >
                  <option value="">Select session...</option>
                  {sessions.map(session => (
                    <option key={session.id} value={session.id}>{session.sessionName}</option>
                  ))}
                </select>
              </div>
            </div>
            
            {selectedSessionA && selectedSessionB && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {(() => {
                  const sessionA = sessions.find(s => s.id === selectedSessionA);
                  const sessionB = sessions.find(s => s.id === selectedSessionB);
                  return (
                    <>
                      <Card className="bg-muted/50">
                        <CardContent className="p-4">
                          <h4 className="mb-3 font-medium">Session A: {sessionA?.sessionName}</h4>
                          <p>Duration: {sessionA?.duration} min</p>
                          <p>Focus Score: {sessionA?.focusScore}%</p>
                          <p>Break Count: {sessionA?.breakCount}</p>
                        </CardContent>
                      </Card>
                      <Card className="bg-muted/50">
                        <CardContent className="p-4">
                          <h4 className="mb-3 font-medium">Session B: {sessionB?.sessionName}</h4>
                          <p>Duration: {sessionB?.duration} min</p>
                          <p>Focus Score: {sessionB?.focusScore}%</p>
                          <p>Break Count: {sessionB?.breakCount}</p>
                        </CardContent>
                      </Card>
                    </>
                  );
                })()}
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      {/* AI Insights */}
      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-6 pb-2 border-b border-border">AI Insights</h2>
        <Card className="bg-card/40 backdrop-blur-md border-white/5">
          <CardContent className="p-6">
            <div className="mb-6 space-y-3">
              {insights.map(insight => (
                <div 
                  key={insight.id} 
                  className={`
                    p-4 rounded-lg
                    ${insight.type === 'positive' ? 'bg-green-50 border border-green-200 text-green-800' : 
                      insight.type === 'warning' ? 'bg-red-50 border border-red-200 text-red-800' : 
                      'bg-blue-50 border border-blue-200 text-blue-800'
                    }
                  `}
                >
                  <p className="m-0">{insight.text}</p>
                </div>
              ))}
            </div>
            <Button onClick={generateInsights} className="w-full md:w-auto">
              Regenerate Insights
            </Button>
          </CardContent>
        </Card>
      </section>

      {/* Goals & Progress */}
      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-6 pb-2 border-b border-border">Goals & Progress</h2>
        <Card className="bg-card/40 backdrop-blur-md border-white/5">
          <CardContent className="p-6">
            {goals.map(goal => (
              <div key={goal.id} className="mb-6">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-base font-medium">{goal.title}</h3>
                  <div>
                    <Button 
                      onClick={() => updateGoal(goal.id)}
                      variant="outline"
                      size="sm"
                    >
                      Edit Goal
                    </Button>
                  </div>
                </div>
                <div className="w-full bg-muted rounded-full h-5 overflow-hidden">
                  <div 
                    className="bg-primary h-full transition-all duration-300"
                    style={{ width: `${(goal.current / goal.target) * 100}%` }}
                  ></div>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  {goal.current} / {goal.target} {goal.unit}
                </p>
              </div>
            ))}
            <Button onClick={addNewGoal} className="w-full md:w-auto">
              Set New Goal
            </Button>
          </CardContent>
        </Card>
      </section>

      {/* Detailed Session Table */}
      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-6 pb-2 border-b border-border">Detailed Session Table</h2>
        <Card className="bg-card/40 backdrop-blur-md border-white/5">
          <CardContent className="p-6">
            <div className="mb-6 flex gap-3 items-center">
              <input 
                type="text"
                placeholder="Search by session name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 p-2 border border-border rounded-md bg-background max-w-xs"
              />
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="p-2 border border-border rounded-md bg-background"
              >
                <option value="date">Sort by Date</option>
                <option value="duration">Sort by Duration</option>
                <option value="focusScore">Sort by Focus Score</option>
              </select>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-muted">
                    <th className="p-3 text-left border-b border-border">Date</th>
                    <th className="p-3 text-left border-b border-border">Session Name</th>
                    <th className="p-3 text-left border-b border-border">Duration</th>
                    <th className="p-3 text-left border-b border-border">Focus Score</th>
                    <th className="p-3 text-left border-b border-border">Break Count</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSessions.map(session => (
                    <tr key={session.id} className="border-b border-border">
                      <td className="p-3">{session.date}</td>
                      <td className="p-3">{session.sessionName}</td>
                      <td className="p-3">{session.duration} min</td>
                      <td className="p-3">{session.focusScore}%</td>
                      <td className="p-3">{session.breakCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Insights Timeline */}
      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-6 pb-2 border-b border-border">Insights Timeline</h2>
        <Card className="bg-card/40 backdrop-blur-md border-white/5">
          <CardContent className="p-6">
            {timelineEvents.map((event, index) => (
              <div key={index} className="flex mb-6">
                <div className="w-4 h-4 rounded-full bg-primary mr-4 mt-1"></div>
                <div className="flex-1">
                  <h4 className="text-base mb-2">{event.type}</h4>
                  <p className="text-muted-foreground m-0">
                    {event.session.sessionName} - {event.session.focusScore}% focus
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      {/* Export & Feedback */}
      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-6 pb-2 border-b border-border">Export & Feedback</h2>
        <Card className="bg-card/40 backdrop-blur-md border-white/5">
          <CardContent className="p-6">
            <div className="mb-6">
              <h3 className="text-base mb-4">Export Options</h3>
              <div className="flex gap-3 flex-wrap">
                <Button onClick={exportCSV} variant="outline">
                  Download CSV
                </Button>
                <Button onClick={exportPDF} variant="outline">
                  Download PDF
                </Button>
              </div>
            </div>
            
            <div>
              <h3 className="text-base mb-4">Was this analysis helpful?</h3>
              <div className="flex gap-3 mb-4">
                <Button 
                  onClick={() => setFeedbackGiven('yes')}
                  variant={feedbackGiven === 'yes' ? 'default' : 'outline'}
                >
                  Yes
                </Button>
                <Button 
                  onClick={() => setFeedbackGiven('no')}
                  variant={feedbackGiven === 'no' ? 'default' : 'outline'}
                >
                  No
                </Button>
              </div>
              <textarea 
                placeholder="Additional feedback..."
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                className="w-full p-3 border border-border rounded-md resize-vertical min-h-20 mb-4"
              />
              <Button onClick={submitFeedback} className="w-full md:w-auto">
                Submit Feedback
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="bg-card/40 backdrop-blur-md border-white/5 p-6 text-center">
        <p className="m-0 text-muted-foreground">
          Last updated: {lastUpdated.toLocaleString()}
        </p>
        <p className="m-4 mt-0 text-muted-foreground text-sm">
          Data source: Mock Data
        </p>
      </footer>
    </div>
  );
}
