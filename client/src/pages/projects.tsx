import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Code, 
  Star, 
  GitBranch, 
  Users, 
  ExternalLink,
  TrendingUp,
  BookOpen,
  Lightbulb,
  Rocket,
  Eye,
  Calendar,
  Filter,
  Search,
  Brain,
  GraduationCap,
  Building,
  Zap,
  ArrowRight
} from "lucide-react";
import { toastInfo } from "@/hooks/use-toast";
import { Link, useLocation } from "wouter";

interface Project {
  id: string;
  name: string;
  description: string;
  author: string;
  authorType: 'student' | 'startup' | 'company' | 'researcher';
  category: 'web' | 'mobile' | 'ai' | 'blockchain' | 'iot' | 'data';
  techStack: string[];
  stars: number;
  forks: number;
  language: string;
  lastUpdated: string;
  url: string;
  isBookmarked: boolean;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  learningOutcomes: string[];
  prerequisites: string[];
}

interface ResearchPaper {
  id: string;
  title: string;
  authors: string[];
  institution: string;
  category: 'ai' | 'ml' | 'nlp' | 'cv' | 'robotics' | 'quantum';
  abstract: string;
  publishDate: string;
  citations: number;
  url: string;
  keyFindings: string[];
  practicalApplications: string[];
}

export default function Projects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [researchPapers, setResearchPapers] = useState<ResearchPaper[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [selectedAuthorType, setSelectedAuthorType] = useState('all');
  const [sortBy, setSortBy] = useState('trending');
  const [bookmarkedProjects, setBookmarkedProjects] = useState<Set<string>>(new Set());
  const [, setLocation] = useLocation();

  // Mock project data
  const mockProjects: Project[] = [
    {
      id: '1',
      name: 'AI-Powered Code Review Assistant',
      description: 'An intelligent code review tool that uses machine learning to identify bugs, suggest improvements, and enforce coding standards automatically.',
      author: 'Sarah Chen',
      authorType: 'student',
      category: 'ai',
      techStack: ['Python', 'TensorFlow', 'React', 'FastAPI'],
      stars: 1247,
      forks: 234,
      language: 'Python',
      lastUpdated: '2 days ago',
      url: 'https://github.com/sarahchen/ai-code-review',
      isBookmarked: false,
      difficulty: 'advanced',
      learningOutcomes: ['Machine Learning', 'Code Analysis', 'API Development'],
      prerequisites: ['Python', 'Machine Learning basics', 'REST APIs']
    },
    {
      id: '2',
      name: 'Real-time Collaboration Platform',
      description: 'A modern web-based collaboration tool with real-time editing, video conferencing, and project management features.',
      author: 'TechStart Inc.',
      authorType: 'startup',
      category: 'web',
      techStack: ['React', 'Node.js', 'WebRTC', 'MongoDB'],
      stars: 892,
      forks: 156,
      language: 'TypeScript',
      lastUpdated: '1 week ago',
      url: 'https://github.com/techstart/collab-platform',
      isBookmarked: false,
      difficulty: 'intermediate',
      learningOutcomes: ['Real-time Communication', 'WebRTC', 'Full-stack Development'],
      prerequisites: ['React', 'Node.js', 'WebSockets']
    },
    {
      id: '3',
      name: 'Blockchain Supply Chain Tracker',
      description: 'A decentralized supply chain management system using blockchain technology for transparency and traceability.',
      author: 'Prof. Michael Roberts',
      authorType: 'researcher',
      category: 'blockchain',
      techStack: ['Solidity', 'Web3.js', 'React', 'IPFS'],
      stars: 567,
      forks: 89,
      language: 'Solidity',
      lastUpdated: '3 days ago',
      url: 'https://github.com/mroberts/supply-chain',
      isBookmarked: false,
      difficulty: 'advanced',
      learningOutcomes: ['Blockchain Development', 'Smart Contracts', 'DApps'],
      prerequisites: ['JavaScript', 'Blockchain basics', 'Cryptography']
    },
    {
      id: '4',
      name: 'Mobile Health Monitoring App',
      description: 'A cross-platform mobile application for tracking health metrics, medication reminders, and telemedicine consultations.',
      author: 'HealthTech Solutions',
      authorType: 'company',
      category: 'mobile',
      techStack: ['React Native', 'Firebase', 'Node.js', 'TensorFlow Lite'],
      stars: 2341,
      forks: 445,
      language: 'JavaScript',
      lastUpdated: '5 days ago',
      url: 'https://github.com/healthtech/monitor-app',
      isBookmarked: false,
      difficulty: 'intermediate',
      learningOutcomes: ['Mobile Development', 'Health Tech', 'Firebase'],
      prerequisites: ['React', 'JavaScript', 'Mobile Development']
    },
    {
      id: '5',
      name: 'Data Visualization Dashboard',
      description: 'An interactive dashboard for creating beautiful, responsive data visualizations with drag-and-drop functionality.',
      author: 'Alex Kumar',
      authorType: 'student',
      category: 'data',
      techStack: ['Vue.js', 'D3.js', 'Python', 'PostgreSQL'],
      stars: 789,
      forks: 123,
      language: 'JavaScript',
      lastUpdated: '1 day ago',
      url: 'https://github.com/alexkumar/data-viz',
      isBookmarked: false,
      difficulty: 'beginner',
      learningOutcomes: ['Data Visualization', 'D3.js', 'Dashboard Design'],
      prerequisites: ['JavaScript', 'HTML/CSS', 'Basic Statistics']
    }
  ];

  const mockResearchPapers: ResearchPaper[] = [
    {
      id: '1',
      title: 'Transformers in Computer Vision: A Comprehensive Survey',
      authors: ['Dr. Emily Zhang', 'Prof. James Liu', 'Dr. Sarah Williams'],
      institution: 'MIT Computer Science Lab',
      category: 'cv',
      abstract: 'This paper presents a comprehensive survey of transformer architectures in computer vision, analyzing their performance across various tasks and datasets.',
      publishDate: '2024-01-15',
      citations: 127,
      url: 'https://arxiv.org/abs/2024.01234',
      keyFindings: [
        'Vision Transformers outperform CNNs in large-scale datasets',
        'Self-supervised learning significantly improves performance',
        'Computational efficiency remains a challenge'
      ],
      practicalApplications: [
        'Medical image analysis',
        'Autonomous vehicle perception',
        'Industrial quality control'
      ]
    },
    {
      id: '2',
      title: 'Quantum Machine Learning: Algorithms and Applications',
      authors: ['Prof. Robert Chen', 'Dr. Lisa Anderson'],
      institution: 'Stanford Quantum Computing Center',
      category: 'quantum',
      abstract: 'An exploration of quantum machine learning algorithms, their theoretical foundations, and practical applications in near-term quantum devices.',
      publishDate: '2024-01-10',
      citations: 89,
      url: 'https://arxiv.org/abs/2024.01012',
      keyFindings: [
        'Quantum advantage demonstrated in specific ML tasks',
        'Hybrid quantum-classical approaches show promise',
        'Error mitigation is crucial for practical applications'
      ],
      practicalApplications: [
        'Drug discovery',
        'Financial modeling',
        'Optimization problems'
      ]
    }
  ];

  useEffect(() => {
    loadProjects();
    loadResearchPapers();
  }, []);

  useEffect(() => {
    filterProjects();
  }, [projects, searchQuery, selectedCategory, selectedDifficulty, selectedAuthorType, sortBy]);

  const loadProjects = async () => {
    try {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      setProjects(mockProjects);
    } catch (error) {
      console.error('Failed to load projects:', error);
      toastInfo('Error', 'Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const loadResearchPapers = async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      setResearchPapers(mockResearchPapers);
    } catch (error) {
      console.error('Failed to load research papers:', error);
    }
  };

  const filterProjects = () => {
    let filtered = [...projects];

    if (searchQuery) {
      filtered = filtered.filter(project =>
        project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.techStack.some(tech => tech.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(project => project.category === selectedCategory);
    }

    if (selectedDifficulty !== 'all') {
      filtered = filtered.filter(project => project.difficulty === selectedDifficulty);
    }

    if (selectedAuthorType !== 'all') {
      filtered = filtered.filter(project => project.authorType === selectedAuthorType);
    }

    switch (sortBy) {
      case 'trending':
        filtered.sort((a, b) => b.stars - a.stars);
        break;
      case 'updated':
        filtered.sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime());
        break;
      case 'forks':
        filtered.sort((a, b) => b.forks - a.forks);
        break;
      case 'beginner':
        const difficultyOrder = { 'beginner': 0, 'intermediate': 1, 'advanced': 2 };
        filtered.sort((a, b) => difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty]);
        break;
    }

    setFilteredProjects(filtered);
  };

  const toggleBookmark = (projectId: string) => {
    setBookmarkedProjects(prev => {
      const newSet = new Set(prev);
      if (newSet.has(projectId)) {
        newSet.delete(projectId);
        toastInfo('Removed', 'Project removed from bookmarks');
      } else {
        newSet.add(projectId);
        toastInfo('Saved', 'Project added to bookmarks');
      }
      return newSet;
    });
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'ai': return 'bg-purple-100 text-purple-800';
      case 'web': return 'bg-blue-100 text-blue-800';
      case 'mobile': return 'bg-green-100 text-green-800';
      case 'blockchain': return 'bg-orange-100 text-orange-800';
      case 'data': return 'bg-cyan-100 text-cyan-800';
      case 'iot': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getAuthorIcon = (authorType: string) => {
    switch (authorType) {
      case 'student': return GraduationCap;
      case 'startup': return Rocket;
      case 'company': return Building;
      case 'researcher': return BookOpen;
      default: return Users;
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
                <div key={i} className="h-64 bg-muted rounded"></div>
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
            <h1 className="text-3xl font-bold">Projects & Research</h1>
            <p className="text-muted-foreground">Discover innovative projects and cutting-edge research</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Advanced Filters
            </Button>
          </div>
        </div>

        <Tabs defaultValue="projects" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="projects">Open Source Projects</TabsTrigger>
            <TabsTrigger value="research">Research Papers</TabsTrigger>
          </TabsList>

          <TabsContent value="projects" className="space-y-6">
            {/* Search and Filters */}
            <Card>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search projects..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="ai">AI/ML</SelectItem>
                      <SelectItem value="web">Web Development</SelectItem>
                      <SelectItem value="mobile">Mobile</SelectItem>
                      <SelectItem value="blockchain">Blockchain</SelectItem>
                      <SelectItem value="data">Data Science</SelectItem>
                      <SelectItem value="iot">IoT</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                    <SelectTrigger>
                      <SelectValue placeholder="Difficulty" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Levels</SelectItem>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={selectedAuthorType} onValueChange={setSelectedAuthorType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Author Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Authors</SelectItem>
                      <SelectItem value="student">Students</SelectItem>
                      <SelectItem value="startup">Startups</SelectItem>
                      <SelectItem value="company">Companies</SelectItem>
                      <SelectItem value="researcher">Researchers</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sort By" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="trending">Trending</SelectItem>
                      <SelectItem value="updated">Recently Updated</SelectItem>
                      <SelectItem value="forks">Most Forked</SelectItem>
                      <SelectItem value="beginner">Beginner Friendly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Projects Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <AnimatePresence>
                {filteredProjects.map((project) => {
                  const AuthorIcon = getAuthorIcon(project.authorType);
                  return (
                    <motion.div
                      key={project.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Card className="h-full hover:shadow-lg transition-shadow">
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <AuthorIcon className="h-4 w-4 text-muted-foreground" />
                                <Badge variant="outline" className={getCategoryColor(project.category)}>
                                  {project.category}
                                </Badge>
                                <Badge variant="outline" className={getDifficultyColor(project.difficulty)}>
                                  {project.difficulty}
                                </Badge>
                              </div>
                              <h3 className="text-lg font-semibold mb-1">{project.name}</h3>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                                <span>{project.author}</span>
                                <span>•</span>
                                <span>{project.language}</span>
                                <span>•</span>
                                <span>{project.lastUpdated}</span>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleBookmark(project.id)}
                              className="text-muted-foreground hover:text-primary"
                            >
                              <Star className={`h-4 w-4 ${bookmarkedProjects.has(project.id) ? 'fill-current' : ''}`} />
                            </Button>
                          </div>

                          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                            {project.description}
                          </p>

                          <div className="flex flex-wrap gap-1 mb-4">
                            {project.techStack.slice(0, 4).map((tech) => (
                              <Badge key={tech} variant="secondary" className="text-xs">
                                {tech}
                              </Badge>
                            ))}
                            {project.techStack.length > 4 && (
                              <Badge variant="outline" className="text-xs">
                                +{project.techStack.length - 4} more
                              </Badge>
                            )}
                          </div>

                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Star className="h-3 w-3" />
                                <span>{project.stars.toLocaleString()}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <GitBranch className="h-3 w-3" />
                                <span>{project.forks}</span>
                              </div>
                            </div>
                          </div>

                          {project.learningOutcomes.length > 0 && (
                            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg mb-4">
                              <div className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
                                🎯 What you'll learn
                              </div>
                              <div className="flex flex-wrap gap-1">
                                {project.learningOutcomes.slice(0, 3).map((outcome) => (
                                  <Badge key={outcome} variant="secondary" className="text-xs bg-blue-100 text-blue-800">
                                    {outcome}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}

                          <div className="flex items-center gap-2">
                            <Button size="sm" variant="outline">
                              <Eye className="h-4 w-4 mr-1" />
                              View Details
                            </Button>
                            <Button size="sm">
                              <ExternalLink className="h-4 w-4 mr-1" />
                              View on GitHub
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </TabsContent>

          <TabsContent value="research" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {researchPapers.map((paper, index) => (
                <motion.div
                  key={paper.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <Card className="h-full">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-2 mb-3">
                        <BookOpen className="h-4 w-4 text-purple-600" />
                        <Badge variant="outline" className="bg-purple-100 text-purple-800">
                          {paper.category.toUpperCase()}
                        </Badge>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground ml-auto">
                          <Star className="h-3 w-3" />
                          <span>{paper.citations} citations</span>
                        </div>
                      </div>
                      
                      <h3 className="text-lg font-semibold mb-2">{paper.title}</h3>
                      
                      <div className="text-sm text-muted-foreground mb-3">
                        <div>{paper.authors.join(', ')}</div>
                        <div>{paper.institution}</div>
                        <div>{new Date(paper.publishDate).toLocaleDateString()}</div>
                      </div>

                      <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                        {paper.abstract}
                      </p>

                      {paper.keyFindings.length > 0 && (
                        <div className="mb-4">
                          <div className="text-sm font-medium mb-2">🔬 Key Findings</div>
                          <ul className="text-sm text-muted-foreground space-y-1">
                            {paper.keyFindings.slice(0, 2).map((finding, i) => (
                              <li key={i} className="flex items-start gap-2">
                                <span className="text-purple-600 mt-1">•</span>
                                <span>{finding}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {paper.practicalApplications.length > 0 && (
                        <div className="mb-4">
                          <div className="text-sm font-medium mb-2">💡 Applications</div>
                          <div className="flex flex-wrap gap-1">
                            {paper.practicalApplications.slice(0, 3).map((app) => (
                              <Badge key={app} variant="secondary" className="text-xs">
                                {app}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4 mr-1" />
                          Read Abstract
                        </Button>
                        <Button size="sm">
                          <ExternalLink className="h-4 w-4 mr-1" />
                          View Paper
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* AI Research Insights */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  AI Research Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <h4 className="font-semibold text-purple-900 dark:text-purple-100 mb-2">
                      🔥 Trending Research Areas
                    </h4>
                    <p className="text-sm text-purple-800 dark:text-purple-200">
                      Vision Transformers and Quantum ML are dominating recent publications with 40%+ growth.
                    </p>
                  </div>
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                      📊 Industry Applications
                    </h4>
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                      Healthcare and finance sectors are leading in AI research adoption and funding.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
