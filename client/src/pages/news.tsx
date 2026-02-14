import { useState, useEffect, useMemo } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, 
  Filter, 
  TrendingUp, 
  Clock, 
  ExternalLink, 
  Bookmark, 
  Share2,
  RefreshCw,
  Briefcase,
  Users,
  AlertTriangle,
  Rocket,
  GraduationCap
} from "lucide-react";
import { toastInfo } from "@/hooks/use-toast";

// Types
interface NewsItem {
  id: string;
  title: string;
  summary: string;
  category: 'tech' | 'hiring' | 'layoffs' | 'projects' | 'internships';
  source: string;
  url: string;
  publishedAt: string;
  companyName?: string;
  location?: string;
  techStack?: string[];
  role?: string;
  impact?: string;
  isBookmarked: boolean;
  tags: string[];
}

interface NewsFilters {
  category: string;
  search: string;
  source: string;
  sortBy: 'latest' | 'trending' | 'relevance';
}

const CATEGORIES = [
  { value: 'all', label: 'All News', icon: TrendingUp },
  { value: 'tech', label: 'Tech News', icon: Rocket },
  { value: 'hiring', label: 'Hiring', icon: Briefcase },
  { value: 'layoffs', label: 'Layoffs', icon: AlertTriangle },
  { value: 'projects', label: 'Projects', icon: Users },
  { value: 'internships', label: 'Internships', icon: GraduationCap },
];

const CATEGORY_COLORS = {
  tech: 'bg-blue-500/10 text-blue-600 border-blue-200',
  hiring: 'bg-green-500/10 text-green-600 border-green-200',
  layoffs: 'bg-red-500/10 text-red-600 border-red-200',
  projects: 'bg-purple-500/10 text-purple-600 border-purple-200',
  internships: 'bg-yellow-500/10 text-yellow-600 border-yellow-200',
};

export default function News() {
  const [, setLocation] = useLocation();
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filters, setFilters] = useState<NewsFilters>({
    category: 'all',
    search: '',
    source: 'all',
    sortBy: 'latest'
  });
  const [bookmarkedItems, setBookmarkedItems] = useState<Set<string>>(new Set());

  // Mock data - replace with real API call
  const mockNewsData: NewsItem[] = [
    {
      id: '1',
      title: 'OpenAI Announces GPT-5 with Enhanced Reasoning Capabilities',
      summary: 'OpenAI reveals GPT-5 featuring improved logical reasoning, reduced hallucinations, and better performance on complex technical tasks. The model shows significant improvements in code generation and mathematical problem-solving.',
      category: 'tech',
      source: 'TechCrunch',
      url: 'https://techcrunch.com/openai-gpt5',
      publishedAt: '2024-01-23T10:30:00Z',
      companyName: 'OpenAI',
      techStack: ['AI/ML', 'NLP', 'Deep Learning'],
      impact: 'Major advancement in AI capabilities',
      isBookmarked: false,
      tags: ['AI', 'Machine Learning', 'GPT-5', 'OpenAI']
    },
    {
      id: '2',
      title: 'Google Hiring 1000+ Engineers for Cloud AI Division',
      summary: 'Google Cloud is expanding its AI team with over 1000 new positions across software engineering, machine learning, and cloud infrastructure roles. Positions available in Mountain View, Seattle, and remote.',
      category: 'hiring',
      source: 'Google Careers',
      url: 'https://careers.google.com',
      publishedAt: '2024-01-23T09:15:00Z',
      companyName: 'Google',
      location: 'Mountain View, Seattle, Remote',
      role: 'Software Engineer, ML Engineer',
      techStack: ['Google Cloud', 'TensorFlow', 'Kubernetes'],
      isBookmarked: false,
      tags: ['Google', 'Hiring', 'Cloud', 'AI', 'Remote']
    },
    {
      id: '3',
      title: 'Meta Layoffs 5000 Tech Workers in Restructuring',
      summary: 'Meta cuts 5000 positions primarily in middle management and non-technical roles as part of "Year of Efficiency" initiative. Engineering teams relatively unaffected with focus on AI and metaverse development.',
      category: 'layoffs',
      source: 'The Verge',
      url: 'https://theverge.com/meta-layoffs',
      publishedAt: '2024-01-22T16:45:00Z',
      companyName: 'Meta',
      impact: 'Major restructuring affecting 5000 employees',
      isBookmarked: false,
      tags: ['Meta', 'Layoffs', 'Restructuring', 'Meta']
    },
    {
      id: '4',
      title: 'Microsoft Launches Open Source AI Development Framework',
      summary: 'Microsoft releases new open-source framework for AI development, integrating with Azure and supporting multiple ML frameworks. Aims to democratize AI development with enterprise-grade tools.',
      category: 'projects',
      source: 'Microsoft Blog',
      url: 'https://blogs.microsoft.com/ai-framework',
      publishedAt: '2024-01-22T14:20:00Z',
      companyName: 'Microsoft',
      techStack: ['Azure', 'Python', 'TypeScript', 'ML'],
      impact: 'Open source AI tools for developers',
      isBookmarked: false,
      tags: ['Microsoft', 'Open Source', 'AI', 'Azure', 'Development']
    },
    {
      id: '5',
      title: 'Amazon Offers 500 Summer Internships for CS Students',
      summary: 'Amazon Web Services announces 500 paid summer internship positions for computer science students. Roles include software development, cloud engineering, and data science. Applications close March 1st.',
      category: 'internships',
      source: 'Amazon Jobs',
      url: 'https://www.amazon.jobs/internships',
      publishedAt: '2024-01-21T11:30:00Z',
      companyName: 'Amazon',
      location: 'Seattle, Austin, Arlington',
      role: 'SDE Intern, Data Science Intern',
      techStack: ['AWS', 'Java', 'Python', 'Distributed Systems'],
      isBookmarked: false,
      tags: ['Amazon', 'Internships', 'Summer 2024', 'AWS', 'Students']
    }
  ];

  useEffect(() => {
    fetchNews();
  }, [filters.category, filters.search, filters.sortBy]);

  const fetchNews = async () => {
    try {
      setLoading(true);
      
      // Build query params
      const params = new URLSearchParams();
      if (filters.category && filters.category !== 'all') params.append('category', filters.category);
      if (filters.search) params.append('search', filters.search);
      if (filters.source && filters.source !== 'all') params.append('source', filters.source);
      if (filters.sortBy) params.append('sortBy', filters.sortBy);
      params.append('limit', '20');
      params.append('offset', '0');

      const response = await fetch(`/api/news?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch news');
      }
      
      const data = await response.json();
      setNewsItems(data.news || []);
    } catch (error) {
      console.error('Failed to fetch news:', error);
      toastInfo('Error', 'Failed to load news. Please try again.');
      // Fallback to mock data if API fails
      setNewsItems(mockNewsData);
    } finally {
      setLoading(false);
    }
  };

  const refreshNews = async () => {
    setRefreshing(true);
    await fetchNews();
    setRefreshing(false);
    toastInfo('Updated', 'News feed refreshed successfully');
  };

  const toggleBookmark = (newsId: string) => {
    setBookmarkedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(newsId)) {
        newSet.delete(newsId);
        toastInfo('Removed', 'Article removed from bookmarks');
      } else {
        newSet.add(newsId);
        toastInfo('Saved', 'Article added to bookmarks');
      }
      return newSet;
    });
  };

  const filteredNews = useMemo(() => {
    return newsItems; // Already filtered on backend
  }, [newsItems]);

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  const getCategoryIcon = (category: string) => {
    const cat = CATEGORIES.find(c => c.value === category);
    return cat ? cat.icon : TrendingUp;
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold">Tech & Jobs News</h1>
            <p className="text-muted-foreground mt-1">
              Stay updated with latest tech news, job opportunities, and industry trends
            </p>
          </div>
          <Button 
            variant="outline" 
            onClick={refreshNews}
            disabled={refreshing}
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search news, companies, tech stack..."
                    value={filters.search}
                    onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Category Filter */}
              <Select value={filters.category} onValueChange={(value) => setFilters(prev => ({ ...prev, category: value }))}>
                <SelectTrigger className="w-full lg:w-48">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map(cat => {
                    const Icon = cat.icon;
                    return (
                      <SelectItem key={cat.value} value={cat.value}>
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4" />
                          {cat.label}
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>

              {/* Sort */}
              <Select value={filters.sortBy} onValueChange={(value: any) => setFilters(prev => ({ ...prev, sortBy: value }))}>
                <SelectTrigger className="w-full lg:w-40">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="latest">Latest</SelectItem>
                  <SelectItem value="trending">Trending</SelectItem>
                  <SelectItem value="relevance">Relevance</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* News Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-4 bg-muted rounded mb-2"></div>
                  <div className="h-3 bg-muted rounded mb-4 w-3/4"></div>
                  <div className="space-y-2">
                    <div className="h-3 bg-muted rounded"></div>
                    <div className="h-3 bg-muted rounded w-5/6"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            <AnimatePresence>
              {filteredNews.map((item, index) => {
                const CategoryIcon = getCategoryIcon(item.category);
                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <Card className="h-full hover:shadow-lg transition-shadow duration-300">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between gap-2">
                          <Badge 
                            className={`${CATEGORY_COLORS[item.category as keyof typeof CATEGORY_COLORS]} border`}
                          >
                            <CategoryIcon className="h-3 w-3 mr-1" />
                            {CATEGORIES.find(c => c.value === item.category)?.label}
                          </Badge>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleBookmark(item.id)}
                              className="h-8 w-8 p-0"
                            >
                              <Bookmark 
                                className={`h-4 w-4 ${bookmarkedItems.has(item.id) ? 'fill-current' : ''}`} 
                              />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => window.open(item.url, '_blank')}
                              className="h-8 w-8 p-0"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <CardTitle className="text-lg line-clamp-2 leading-tight">
                          {item.title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                          {item.summary}
                        </p>
                        
                        {/* Metadata */}
                        <div className="space-y-3">
                          {item.companyName && (
                            <div className="flex items-center gap-2 text-sm">
                              <span className="font-medium">{item.companyName}</span>
                              {item.location && (
                                <span className="text-muted-foreground">• {item.location}</span>
                              )}
                            </div>
                          )}
                          
                          {item.techStack && item.techStack.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {item.techStack.slice(0, 3).map((tech, idx) => (
                                <Badge key={idx} variant="secondary" className="text-xs">
                                  {tech}
                                </Badge>
                              ))}
                              {item.techStack.length > 3 && (
                                <Badge variant="outline" className="text-xs">
                                  +{item.techStack.length - 3}
                                </Badge>
                              )}
                            </div>
                          )}
                          
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formatTimeAgo(item.publishedAt)}
                            </div>
                            <span>{item.source}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredNews.length === 0 && (
          <div className="text-center py-12">
            <div className="text-muted-foreground mb-4">
              <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No news found matching your criteria.</p>
              <p className="text-sm">Try adjusting your filters or search terms.</p>
            </div>
            <Button 
              variant="outline" 
              onClick={() => setFilters({ category: 'all', search: '', source: 'all', sortBy: 'latest' })}
            >
              Clear Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
