import bcrypt from "bcrypt";
import { z } from "zod";
import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema } from "@shared/schema";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import session from "express-session";
import MemoryStore from "memorystore";
import Groq from "groq-sdk";
import dotenv from "dotenv";
import { fetchTechNews, summarizeNewsContent } from "./services/newsService";
import { getAIInsightsEngine } from "./services/aiInsightsEngine";

// Load environment variables
dotenv.config();

// Validation schemas
const registerSchema = insertUserSchema.extend({
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

const chatSchema = z.object({
  message: z.string().min(1, "Message is required"),
});

const newsQuerySchema = z.object({
  category: z.string().optional(),
  search: z.string().optional(),
  source: z.string().optional(),
  sortBy: z.enum(['latest', 'trending', 'relevance']).optional(),
  limit: z.string().optional(),
  offset: z.string().optional(),
});

const analyticsInsightSchema = z.object({
  data: z.any(), // Analytics data to analyze
  type: z.enum(['general', 'trend', 'anomaly', 'recommendation']),
  timeframe: z.string().optional(),
});

// Initialize Groq client
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || "your-groq-api-key-here",
});

// Authentication middleware
export const requireAuth = (req: any, res: any, next: any) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Authentication required" });
  }
  next();
};

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Configure session middleware
  const SessionStore = MemoryStore(session);
  app.use(
    session({
      secret: process.env.SESSION_SECRET || "your-secret-key-change-in-production",
      resave: false,
      saveUninitialized: false,
      store: new SessionStore({
        checkPeriod: 86400000, // 24 hours
      }),
      cookie: {
        secure: process.env.NODE_ENV === "production",
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
      },
    })
  );

  // Configure Passport
  app.use(passport.initialize());
  app.use(passport.session());

  // Local Strategy for username/password authentication
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user) {
          return done(null, false, { message: "Invalid username or password" });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
          return done(null, false, { message: "Invalid username or password" });
        }

        return done(null, user);
      } catch (error) {
        return done(error);
      }
    })
  );

  // Serialize/deserialize user for session
  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: string, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });

  // User registration endpoint
  app.post("/api/register", async (req, res) => {
    try {
      const validatedData = registerSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByUsername(validatedData.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(validatedData.password, 10);
      
      // Create user
      const user = await storage.createUser({
        username: validatedData.username,
        password: hashedPassword,
      });

      // Remove password from response
      const { password, ...userWithoutPassword } = user;
      
      res.status(201).json({ user: userWithoutPassword });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: error.errors 
        });
      }
      console.error("Registration error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // User login endpoint
  app.post("/api/login", (req, res, next) => {
    const { error } = loginSchema.safeParse(req.body);
    if (error) {
      return res.status(400).json({ 
        message: "Validation error", 
        errors: error.errors 
      });
    }

    passport.authenticate("local", (err: any, user: any, info: any) => {
      if (err) {
        return res.status(500).json({ message: "Internal server error" });
      }
      if (!user) {
        return res.status(401).json({ message: info?.message || "Authentication failed" });
      }

      req.logIn(user, (err) => {
        if (err) {
          return res.status(500).json({ message: "Internal server error" });
        }

        const { password, ...userWithoutPassword } = user;
        res.json({ user: userWithoutPassword });
      });
    })(req, res, next);
  });

  // User logout endpoint
  app.post("/api/logout", (req, res) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ message: "Internal server error" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });

  // Get current user endpoint
  app.get("/api/me", (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const { password, ...userWithoutPassword } = req.user as any;
    res.json({ user: userWithoutPassword });
  });

  // Protected route example
  app.get("/api/protected", requireAuth, (req, res) => {
    res.json({ message: "This is a protected route", user: req.user });
  });

  // AI Chat endpoint
  app.post("/api/chat", async (req, res) => {
    try {
      const { message } = chatSchema.parse(req.body);

      // System prompt for AI Coach
      const systemPrompt = `You are an AI Interview Coach Assistant. Your role is to help users improve their interview skills. Provide helpful, encouraging, and practical advice on:
- Interview preparation tips
- Common interview questions and how to answer them
- Body language and presentation tips
- Confidence building techniques
- Industry-specific interview guidance
- Resume and portfolio advice

Always be supportive, professional, and provide actionable advice. Keep responses concise but comprehensive (2-3 paragraphs maximum).`;

      const completion = await groq.chat.completions.create({
        model: "llama-3.1-8b-instant",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message }
        ],
        max_tokens: 300,
        temperature: 0.7,
      });

      const aiResponse = completion.choices[0]?.message?.content || "I'm sorry, I couldn't process that request. Please try again.";

      res.json({ response: aiResponse });
    } catch (error) {
      console.error("AI Chat error:", error);
      
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: error.errors 
        });
      }

      // Handle Groq API errors
      if (error instanceof Error && error.message.includes('API key')) {
        return res.status(500).json({ 
          message: "AI service configuration error. Please check your API key." 
        });
      }

      res.status(500).json({ 
        message: "Failed to get AI response. Please try again later." 
      });
    }
  });

  // News API endpoints
  app.get("/api/news", async (req, res) => {
    try {
      const query = newsQuerySchema.parse(req.query);
      const { category, search, source, sortBy, limit = '20', offset = '0' } = query;
      
      // Fetch real news from external sources
      let newsData: any[] = await fetchTechNews();
      
      // If real news fetch fails, fallback to mock data
      if (!newsData || newsData.length === 0) {
        console.log('Falling back to mock news data');
        newsData = [
          {
            id: '1',
            title: 'OpenAI Announces GPT-5 with Enhanced Reasoning Capabilities',
            summary: 'OpenAI reveals GPT-5 featuring improved logical reasoning, reduced hallucinations, and better performance on complex technical tasks. The model shows significant improvements in code generation and mathematical problem-solving.',
            category: 'tech',
            source: 'TechCrunch',
            url: 'https://techcrunch.com/openai-gpt5',
            publishedAt: new Date('2024-01-23T10:30:00Z').toISOString(),
            companyName: 'OpenAI',
            techStack: ['AI/ML', 'NLP', 'Deep Learning'],
            impact: 'Major advancement in AI capabilities',
            tags: ['AI', 'Machine Learning', 'GPT-5', 'OpenAI']
          },
          {
            id: '2',
            title: 'Google Hiring 1000+ Engineers for Cloud AI Division',
            summary: 'Google Cloud is expanding its AI team with over 1000 new positions across software engineering, machine learning, and cloud infrastructure roles. Positions available in Mountain View, Seattle, and remote.',
            category: 'hiring',
            source: 'Google Careers',
            url: 'https://careers.google.com',
            publishedAt: new Date('2024-01-23T09:15:00Z').toISOString(),
            companyName: 'Google',
            location: 'Mountain View, Seattle, Remote',
            role: 'Software Engineer, ML Engineer',
            techStack: ['Google Cloud', 'TensorFlow', 'Kubernetes'],
            tags: ['Google', 'Hiring', 'Cloud', 'AI', 'Remote']
          }
        ];
      }

      // Apply filters
      let filteredNews = newsData.filter((item: any) => {
        const matchesCategory = !category || category === 'all' || item.category === category;
        const matchesSearch = !search || 
          item.title.toLowerCase().includes(search.toLowerCase()) ||
          item.summary.toLowerCase().includes(search.toLowerCase()) ||
          (item.tags && item.tags.some((tag: string) => tag.toLowerCase().includes(search.toLowerCase())));
        const matchesSource = !source || source === 'all' || item.source === source;
        
        return matchesCategory && matchesSearch && matchesSource;
      });

      // Sort
      filteredNews.sort((a: any, b: any) => {
        switch (sortBy) {
          case 'latest':
            return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
          case 'trending':
            return Math.random() - 0.5; // Simulate trending
          case 'relevance':
          default:
            return 0;
        }
      });

      // Apply pagination
      const limitNum = parseInt(limit);
      const offsetNum = parseInt(offset);
      const paginatedNews = filteredNews.slice(offsetNum, offsetNum + limitNum);

      res.json({
        news: paginatedNews,
        total: filteredNews.length,
        hasMore: offsetNum + limitNum < filteredNews.length
      });
    } catch (error) {
      console.error("News API error:", error);
      
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: error.errors 
        });
      }

      res.status(500).json({ 
        message: "Failed to fetch news. Please try again later." 
      });
    }
  });

  // AI News Summarization endpoint
  app.post("/api/news/summarize", async (req, res) => {
    try {
      const { content } = req.body;
      
      if (!content || typeof content !== 'string') {
        return res.status(400).json({ message: "Content is required for summarization" });
      }

      const summaryResult = await summarizeNewsContent(content, groq);
      res.json(summaryResult);
    } catch (error) {
      console.error("News summarization error:", error);
      res.status(500).json({ 
        message: "Failed to summarize news. Please try again later." 
      });
    }
  });

  // AI Analytics Insights endpoint
  app.post("/api/analytics/insights", async (req, res) => {
    try {
      const { data, type, timeframe } = analyticsInsightSchema.parse(req.body);
      
      const systemPrompt = `You are an AI analytics expert for an interview preparation platform. Your task is to analyze user data and generate actionable insights.

Based on the analytics data provided, generate insights in the following JSON format:
{
  "insights": [
    {
      "type": "trend|anomaly|achievement|warning",
      "title": "Brief, impactful title",
      "description": "Natural language explanation of what happened and why",
      "impact": "high|medium|low",
      "actionable": true/false,
      "recommendation": "Specific action user should take (if actionable)",
      "metrics": {
        "value": number,
        "change": number,
        "changePercent": number
      }
    }
  ],
  "summary": "Overall summary of user's performance",
  "engagementScore": 0-100,
  "predictions": {
    "nextWeek": "expected trend",
    "confidence": 0-100
  }
}

Focus on:
- Clear, natural language explanations
- Actionable recommendations
- Meaningful patterns, not vanity metrics
- Interview preparation context
- Engagement quality and learning progress`;

      const completion = await groq.chat.completions.create({
        model: "llama-3.1-8b-instant",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Analyze this analytics data for ${type} insights over ${timeframe || 'recent period'}: ${JSON.stringify(data)}` }
        ],
        max_tokens: 800,
        temperature: 0.4,
      });

      const aiResponse = completion.choices[0]?.message?.content || '{}';
      
      try {
        const parsedResponse = JSON.parse(aiResponse);
        res.json(parsedResponse);
      } catch (parseError) {
        // Fallback response
        res.json({
          insights: [{
            type: "warning",
            title: "Analysis Limited",
            description: "Unable to generate detailed insights. Please check back later.",
            impact: "low",
            actionable: false,
            recommendation: "Continue with your regular practice schedule.",
            metrics: { value: 0, change: 0, changePercent: 0 }
          }],
          summary: "Basic analytics available",
          engagementScore: 75,
          predictions: { nextWeek: "stable", confidence: 60 }
        });
      }
    } catch (error) {
      console.error("Analytics insights error:", error);
      res.status(500).json({ 
        message: "Failed to generate insights. Please try again later." 
      });
    }
  });

  // Explain Chart endpoint
  app.post("/api/analytics/explain", async (req, res) => {
    try {
      const { chartType, data, question } = req.body;
      
      if (!chartType || !data) {
        return res.status(400).json({ message: "Chart type and data are required" });
      }

      const systemPrompt = `You are an AI analytics assistant. Explain the provided chart data in clear, natural language.

Respond in this JSON format:
{
  "explanation": "What this chart shows in simple terms",
  "keyFindings": ["Main insight 1", "Main insight 2", "Main insight 3"],
  "whyItMatters": "Why this information is important for interview preparation",
  "nextSteps": "What the user should do based on this information",
  "confidence": 0-100
}

Keep explanations:
- Simple and clear
- Focused on interview preparation
- Actionable and practical
- Under 150 words total`;

      const completion = await groq.chat.completions.create({
        model: "llama-3.1-8b-instant",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Explain this ${chartType} chart: ${JSON.stringify(data)}. ${question ? `User question: ${question}` : ''}` }
        ],
        max_tokens: 400,
        temperature: 0.3,
      });

      const aiResponse = completion.choices[0]?.message?.content || '{}';
      
      try {
        const parsedResponse = JSON.parse(aiResponse);
        res.json(parsedResponse);
      } catch (parseError) {
        res.json({
          explanation: "This chart shows your performance metrics over time.",
          keyFindings: ["Data visualization available"],
          whyItMatters: "Tracking progress helps improve interview skills",
          nextSteps: "Continue consistent practice",
          confidence: 70
        });
      }
    } catch (error) {
      console.error("Chart explanation error:", error);
      res.status(500).json({ 
        message: "Failed to explain chart. Please try again later." 
      });
    }
  });

  // Global AI Insights endpoint
  app.post("/api/ai/insights", async (req, res) => {
    try {
      const { type, data, context, timeframe, preferences } = req.body;
      
      if (!type || !data) {
        return res.status(400).json({ message: "Type and data are required" });
      }

      const aiEngine = getAIInsightsEngine();
      const insights = await aiEngine.generateInsights({
        type,
        data,
        context,
        timeframe,
        preferences
      });

      res.json(insights);
    } catch (error) {
      console.error("AI insights error:", error);
      res.status(500).json({ 
        message: "Failed to generate insights. Please try again later." 
      });
    }
  });

  // Product Pulse KPIs endpoint
  app.get("/api/product/pulse", async (req, res) => {
    try {
      // Mock product KPIs - in production, these would come from real analytics
      const pulseData = {
        activeUsers: 1247,
        jobsTracked: 3847,
        newsUpdates: 156,
        engagementRate: 78,
        topTechStacks: ['React', 'Python', 'AWS', 'TypeScript', 'Node.js'],
        topRoles: ['Software Engineer', 'DevOps', 'Data Scientist', 'Frontend Developer', 'Backend Developer'],
        trendingTopics: ['AI/ML', 'Cloud Computing', 'Cybersecurity', 'Web3', 'Remote Work'],
        userGrowth: {
          daily: 23,
          weekly: 156,
          monthly: 687
        },
        contentMetrics: {
          newsArticles: 1247,
          jobPostings: 892,
          projects: 234,
          researchPapers: 156
        }
      };

      // Generate AI insights on product pulse
      const aiEngine = getAIInsightsEngine();
      const insights = await aiEngine.generateInsights({
        type: 'trend',
        data: pulseData,
        context: 'Product performance and user engagement metrics'
      });

      res.json({
        kpis: pulseData,
        insights: insights.insights,
        lastUpdated: new Date().toISOString()
      });
    } catch (error) {
      console.error("Product pulse error:", error);
      res.status(500).json({ 
        message: "Failed to fetch product pulse data." 
      });
    }
  });

  return httpServer;
}
