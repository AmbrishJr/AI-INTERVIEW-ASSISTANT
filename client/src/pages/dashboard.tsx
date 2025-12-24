import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import { ArrowUpRight, Calendar, Clock, Trophy } from "lucide-react";

const mockData = [
  { name: 'Mon', score: 65 },
  { name: 'Tue', score: 72 },
  { name: 'Wed', score: 68 },
  { name: 'Thu', score: 85 },
  { name: 'Fri', score: 82 },
  { name: 'Sat', score: 90 },
  { name: 'Sun', score: 88 },
];

const recentSessions = [
  { id: 1, type: "Behavioral", duration: "15m", date: "Today, 10:30 AM", score: 92, status: "Excellent" },
  { id: 2, type: "Technical", duration: "25m", date: "Yesterday, 2:15 PM", score: 78, status: "Good" },
  { id: 3, type: "System Design", duration: "40m", date: "Oct 24, 11:00 AM", score: 65, status: "Needs Work" },
];

export default function Dashboard() {
  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-heading font-bold text-white mb-2">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, Alex. Your performance is trending up.</p>
        </div>
        <div className="flex gap-2">
           <span className="px-3 py-1 rounded-full bg-green-500/10 text-green-500 border border-green-500/20 text-sm font-mono flex items-center gap-2">
             <ArrowUpRight className="w-4 h-4" /> +12% vs last week
           </span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-card/40 backdrop-blur-md border-white/5">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Sessions</CardTitle>
            <Clock className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">24</div>
            <p className="text-xs text-muted-foreground mt-1">12.5 hrs practice time</p>
          </CardContent>
        </Card>
        
        <Card className="bg-card/40 backdrop-blur-md border-white/5">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg. Score</CardTitle>
            <Trophy className="w-4 h-4 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">78/100</div>
            <p className="text-xs text-muted-foreground mt-1">Top 15% of users</p>
          </CardContent>
        </Card>

        <Card className="bg-card/40 backdrop-blur-md border-white/5 md:col-span-2">
           <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Current Streak</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-2">
              <div className="text-2xl font-bold text-white">5 Days</div>
              <div className="flex gap-1 mb-1 ml-4">
                {[1,1,1,1,1,0,0].map((active, i) => (
                  <div key={i} className={`w-3 h-3 rounded-sm ${active ? 'bg-primary shadow-[0_0_5px_var(--color-primary)]' : 'bg-white/10'}`} />
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Chart */}
        <Card className="lg:col-span-2 bg-card/40 backdrop-blur-md border-white/5">
          <CardHeader>
            <CardTitle className="font-heading">Performance Trend</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mockData}>
                <defs>
                  <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  stroke="rgba(255,255,255,0.3)" 
                  tick={{fill: 'rgba(255,255,255,0.3)', fontSize: 12}} 
                  axisLine={false} 
                  tickLine={false}
                />
                <YAxis 
                  stroke="rgba(255,255,255,0.3)" 
                  tick={{fill: 'rgba(255,255,255,0.3)', fontSize: 12}} 
                  axisLine={false} 
                  tickLine={false}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}
                  itemStyle={{ color: 'white' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="score" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorScore)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Readiness Score */}
        <Card className="bg-card/40 backdrop-blur-md border-white/5 flex flex-col items-center justify-center p-6">
          <h3 className="font-heading font-semibold text-lg mb-6">Interview Readiness</h3>
          <div className="w-48 h-48">
            <CircularProgressbar 
              value={82} 
              text={`82%`} 
              styles={buildStyles({
                pathColor: `hsl(var(--secondary))`,
                textColor: '#fff',
                trailColor: 'rgba(255,255,255,0.05)',
                pathTransitionDuration: 0.5,
              })}
            />
          </div>
          <p className="text-center text-muted-foreground mt-6 text-sm">
            You are ready for mid-level technical interviews. Focus on system design to level up.
          </p>
        </Card>
      </div>

      {/* Recent Sessions */}
      <Card className="bg-card/40 backdrop-blur-md border-white/5">
        <CardHeader>
          <CardTitle className="font-heading">Recent Sessions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentSessions.map((session) => (
              <div key={session.id} className="flex items-center justify-between p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-colors border border-white/5 group">
                <div className="flex items-center gap-4">
                  <div className={`w-2 h-12 rounded-full ${
                    session.score >= 90 ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]' : 
                    session.score >= 70 ? 'bg-primary shadow-[0_0_10px_rgba(0,240,255,0.5)]' : 
                    'bg-yellow-500'
                  }`} />
                  <div>
                    <h4 className="font-medium text-white">{session.type} Interview</h4>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3"/> {session.date}</span>
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3"/> {session.duration}</span>
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-xl font-bold font-mono">{session.score}</div>
                  <div className={`text-xs ${
                    session.status === 'Excellent' ? 'text-green-400' :
                    session.status === 'Good' ? 'text-primary' :
                    'text-yellow-400'
                  }`}>{session.status}</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}