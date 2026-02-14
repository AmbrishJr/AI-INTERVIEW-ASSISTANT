import Groq from 'groq-sdk';
import { newsCache } from './cacheService';

interface InsightRequest {
  type: 'trend' | 'summary' | 'recommendation' | 'prediction' | 'anomaly';
  data: any;
  context?: string;
  timeframe?: string;
  preferences?: any;
}

interface InsightResponse {
  insights: Array<{
    type: string;
    title: string;
    description: string;
    impact: 'high' | 'medium' | 'low';
    actionable: boolean;
    recommendation?: string;
    confidence: number;
    metrics?: any;
  }>;
  summary?: string;
  predictions?: any;
  trends?: any;
  anomalies?: any;
}

class AIInsightsEngine {
  private groq: Groq;
  private cache: Map<string, { data: any; timestamp: number; ttl: number }> = new Map();

  constructor(apiKey: string) {
    this.groq = new Groq({ apiKey });
  }

  // Generate insights based on type and data
  async generateInsights(request: InsightRequest): Promise<InsightResponse> {
    const cacheKey = this.generateCacheKey(request);
    const cached = this.getFromCache(cacheKey);
    if (cached) {
      return cached;
    }

    let response: InsightResponse;

    switch (request.type) {
      case 'trend':
        response = await this.analyzeTrends(request.data, request.context, request.timeframe);
        break;
      case 'summary':
        response = await this.generateSummary(request.data, request.context);
        break;
      case 'recommendation':
        response = await this.generateRecommendations(request.data, request.preferences);
        break;
      case 'prediction':
        response = await this.generatePredictions(request.data, request.timeframe);
        break;
      case 'anomaly':
        response = await this.detectAnomalies(request.data, request.context);
        break;
      default:
        response = await this.generateGeneralInsights(request.data, request.context);
    }

    this.setCache(cacheKey, response, 5 * 60 * 1000); // 5 minutes cache
    return response;
  }

  private async analyzeTrends(data: any, context?: string, timeframe?: string): Promise<InsightResponse> {
    const systemPrompt = `You are an AI trend analyst for a tech intelligence platform. Analyze the provided data and identify meaningful trends.

Focus on:
- Tech industry trends (AI, Cloud, Cybersecurity, etc.)
- Job market trends
- Technology adoption patterns
- Emerging technologies

Return JSON format:
{
  "insights": [
    {
      "type": "trend",
      "title": "Brief, impactful title",
      "description": "Clear explanation of the trend and why it matters",
      "impact": "high|medium|low",
      "actionable": true/false,
      "recommendation": "What users should do about this trend",
      "confidence": 0-100,
      "metrics": {
        "direction": "up|down|stable",
        "changePercent": number,
        "affectedArea": "specific area"
      }
    }
  ],
  "trends": {
    "emerging": ["trend1", "trend2"],
    "declining": ["trend3"],
    "stable": ["trend4"]
  }
}`;

    const userPrompt = `Analyze tech trends in this data for ${timeframe || 'recent period'}: ${JSON.stringify(data)}. Context: ${context || 'General tech intelligence'}`;

    return this.callAI(systemPrompt, userPrompt);
  }

  private async generateSummary(data: any, context?: string): Promise<InsightResponse> {
    const systemPrompt = `You are an AI content summarizer for a tech intelligence platform. Create concise, insightful summaries.

Focus on:
- Key takeaways only
- Tech-relevant information
- Actionable insights
- Clear, professional language

Return JSON format:
{
  "summary": "2-3 sentence summary",
  "insights": [
    {
      "type": "summary",
      "title": "Key Insight",
      "description": "Main point with context",
      "impact": "high|medium|low",
      "actionable": true/false,
      "recommendation": "What to do with this information",
      "confidence": 0-100
    }
  ]
}`;

    const userPrompt = `Summarize this tech data: ${JSON.stringify(data)}. Context: ${context || 'Tech intelligence summary'}`;

    return this.callAI(systemPrompt, userPrompt);
  }

  private async generateRecommendations(data: any, preferences?: any): Promise<InsightResponse> {
    const systemPrompt = `You are an AI recommendation engine for tech professionals. Generate personalized, actionable recommendations.

Consider:
- User preferences and goals
- Career development
- Skill improvement
- Market opportunities
- Learning paths

Return JSON format:
{
  "insights": [
    {
      "type": "recommendation",
      "title": "Action-oriented title",
      "description": "Why this matters for the user",
      "impact": "high|medium|low",
      "actionable": true,
      "recommendation": "Specific action to take",
      "confidence": 0-100,
      "priority": "high|medium|low"
    }
  ]
}`;

    const userPrompt = `Generate recommendations based on: Data: ${JSON.stringify(data)}, Preferences: ${JSON.stringify(preferences || {})}`;

    return this.callAI(systemPrompt, userPrompt);
  }

  private async generatePredictions(data: any, timeframe?: string): Promise<InsightResponse> {
    const systemPrompt = `You are an AI prediction engine for tech trends. Generate realistic, data-driven predictions.

Focus on:
- Short-term predictions (1-4 weeks)
- Tech industry trends
- Job market changes
- Technology adoption
- Include confidence levels

Return JSON format:
{
  "predictions": {
    "nextWeek": {
      "trend": "up|down|stable",
      "confidence": 0-100,
      "factors": ["factor1", "factor2"]
    },
    "nextMonth": {
      "trend": "up|down|stable", 
      "confidence": 0-100,
      "factors": ["factor1", "factor2"]
    }
  },
  "insights": [
    {
      "type": "prediction",
      "title": "Prediction title",
      "description": "What to expect and why",
      "impact": "high|medium|low",
      "actionable": true,
      "recommendation": "How to prepare",
      "confidence": 0-100
    }
  ]
}`;

    const userPrompt = `Generate predictions for ${timeframe || 'next week'} based on: ${JSON.stringify(data)}`;

    return this.callAI(systemPrompt, userPrompt);
  }

  private async detectAnomalies(data: any, context?: string): Promise<InsightResponse> {
    const systemPrompt = `You are an AI anomaly detection system for tech intelligence. Identify unusual patterns and outliers.

Look for:
- Sudden spikes or drops
- Unusual behavior patterns
- Unexpected correlations
- Significant deviations from norms

Return JSON format:
{
  "anomalies": [
    {
      "type": "spike|drop|pattern",
      "metric": "what changed",
      "severity": "high|medium|low",
      "description": "what happened",
      "possibleCauses": ["cause1", "cause2"]
    }
  ],
  "insights": [
    {
      "type": "anomaly",
      "title": "Anomaly detected",
      "description": "What's unusual and why it matters",
      "impact": "high|medium|low",
      "actionable": true,
      "recommendation": "How to respond",
      "confidence": 0-100
    }
  ]
}`;

    const userPrompt = `Detect anomalies in this data: ${JSON.stringify(data)}. Context: ${context || 'Tech platform analytics'}`;

    return this.callAI(systemPrompt, userPrompt);
  }

  private async generateGeneralInsights(data: any, context?: string): Promise<InsightResponse> {
    const systemPrompt = `You are an AI insights engine for a tech intelligence platform. Generate meaningful insights from any data.

Focus on:
- Tech industry relevance
- Actionable takeaways
- Clear explanations
- Professional tone

Return JSON format:
{
  "summary": "Overall summary",
  "insights": [
    {
      "type": "general",
      "title": "Insight title",
      "description": "Detailed explanation",
      "impact": "high|medium|low",
      "actionable": true/false,
      "recommendation": "Action if applicable",
      "confidence": 0-100
    }
  ]
}`;

    const userPrompt = `Generate insights from: ${JSON.stringify(data)}. Context: ${context || 'Tech intelligence'}`;

    return this.callAI(systemPrompt, userPrompt);
  }

  private async callAI(systemPrompt: string, userPrompt: string): Promise<InsightResponse> {
    try {
      const completion = await this.groq.chat.completions.create({
        model: "llama-3.1-8b-instant",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        max_tokens: 800,
        temperature: 0.3,
      });

      const aiResponse = completion.choices[0]?.message?.content || '{}';
      
      try {
        return JSON.parse(aiResponse);
      } catch (parseError) {
        console.error('Failed to parse AI response:', parseError);
        return this.getFallbackResponse();
      }
    } catch (error) {
      console.error('AI call failed:', error);
      return this.getFallbackResponse();
    }
  }

  private getFallbackResponse(): InsightResponse {
    return {
      insights: [{
        type: 'general',
        title: 'Analysis Limited',
        description: 'Unable to generate detailed insights at this time.',
        impact: 'low',
        actionable: false,
        recommendation: 'Please try again later.',
        confidence: 50
      }],
      summary: 'Basic analysis available'
    };
  }

  private generateCacheKey(request: InsightRequest): string {
    return `${request.type}_${JSON.stringify(request.data).slice(0, 100)}_${request.context || ''}_${request.timeframe || ''}`;
  }

  private getFromCache(key: string): InsightResponse | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < cached.ttl) {
      return cached.data;
    }
    if (cached) {
      this.cache.delete(key);
    }
    return null;
  }

  private setCache(key: string, data: InsightResponse, ttl: number): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  // Clean up expired cache entries
  cleanupCache(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];
    
    this.cache.forEach((value, key) => {
      if (now - value.timestamp > value.ttl) {
        keysToDelete.push(key);
      }
    });
    
    keysToDelete.forEach(key => this.cache.delete(key));
  }
}

// Singleton instance
let aiInsightsEngine: AIInsightsEngine | null = null;

export function getAIInsightsEngine(): AIInsightsEngine {
  if (!aiInsightsEngine) {
    const apiKey = process.env.GROQ_API_KEY || 'your-groq-api-key-here';
    aiInsightsEngine = new AIInsightsEngine(apiKey);
    
    // Cleanup cache every 10 minutes
    setInterval(() => {
      aiInsightsEngine?.cleanupCache();
    }, 10 * 60 * 1000);
  }
  
  return aiInsightsEngine;
}

export { AIInsightsEngine, type InsightRequest, type InsightResponse };
