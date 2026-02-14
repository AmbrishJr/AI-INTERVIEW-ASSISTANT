import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Briefcase, 
  MapPin, 
  Clock, 
  DollarSign,
  TrendingUp,
  Building,
  Users,
  Search,
  Filter,
  Bookmark,
  ExternalLink,
  Brain,
  Code,
  GraduationCap,
  Rocket,
  Star,
  Eye,
  Calendar,
  ArrowRight
} from "lucide-react";
import { toastInfo } from "@/hooks/use-toast";
import { Link, useLocation } from "wouter";

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  type: 'full-time' | 'part-time' | 'internship' | 'contract';
  experience: 'entry' | 'mid' | 'senior' | 'lead';
  salary?: string;
  posted: string;
  description: string;
  techStack: string[];
  skills: string[];
  source: string;
  url: string;
  isBookmarked: boolean;
  applicants?: number;
  matchScore?: number;
}

interface JobTrend {
  role: string;
  growth: number;
  openings: number;
  avgSalary: string;
  topSkills: string[];
}

export default function Jobs() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedExperience, setSelectedExperience] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [sortBy, setSortBy] = useState('latest');
  const [jobTrends, setJobTrends] = useState<JobTrend[]>([]);
  const [bookmarkedJobs, setBookmarkedJobs] = useState<Set<string>>(new Set());
  const [, setLocation] = useLocation();

  // Mock job data
  const mockJobs: Job[] = [
    {
      id: '1',
      title: 'Senior Software Engineer',
      company: 'TechCorp',
      location: 'San Francisco, CA',
      type: 'full-time',
      experience: 'senior',
      salary: '$150k - $200k',
      posted: '2 days ago',
      description: 'Looking for experienced software engineer to join our AI team...',
      techStack: ['React', 'Python', 'AWS', 'TensorFlow'],
      skills: ['Machine Learning', 'Cloud Architecture', 'System Design'],
      source: 'LinkedIn',
      url: 'https://linkedin.com/jobs/1',
      isBookmarked: false,
      applicants: 127,
      matchScore: 92
    },
    {
      id: '2',
      title: 'Frontend Developer Intern',
      company: 'StartupXYZ',
      location: 'Remote',
      type: 'internship',
      experience: 'entry',
      salary: '$25 - $35/hour',
      posted: '1 day ago',
      description: 'Join our frontend team and work on cutting-edge web applications...',
      techStack: ['React', 'TypeScript', 'Tailwind CSS'],
      skills: ['React', 'TypeScript', 'CSS', 'JavaScript'],
      source: 'AngelList',
      url: 'https://angel.co/jobs/2',
      isBookmarked: false,
      applicants: 89,
      matchScore: 88
    },
    {
      id: '3',
      title: 'DevOps Engineer',
      company: 'CloudTech',
      location: 'Seattle, WA',
      type: 'full-time',
      experience: 'mid',
      salary: '$120k - $160k',
      posted: '3 days ago',
      description: 'Help us build and maintain scalable cloud infrastructure...',
      techStack: ['Kubernetes', 'Docker', 'AWS', 'Terraform'],
      skills: ['DevOps', 'Cloud Computing', 'CI/CD', 'Infrastructure as Code'],
      source: 'Built In',
      url: 'https://builtin.com/jobs/3',
      isBookmarked: false,
      applicants: 156,
      matchScore: 85
    },
    {
      id: '4',
      title: 'Data Scientist',
      company: 'DataCorp',
      location: 'New York, NY',
      type: 'full-time',
      experience: 'senior',
      salary: '$140k - $180k',
      posted: '1 week ago',
      description: 'Apply machine learning techniques to solve complex business problems...',
      techStack: ['Python', 'R', 'SQL', 'Tableau'],
      skills: ['Machine Learning', 'Data Analysis', 'Statistics', 'Python'],
      source: 'Indeed',
      url: 'https://indeed.com/jobs/4',
      isBookmarked: false,
      applicants: 203,
      matchScore: 79
    },
    {
      id: '5',
      title: 'Junior Backend Developer',
      company: 'WebSolutions',
      location: 'Austin, TX',
      type: 'full-time',
      experience: 'entry',
      salary: '$70k - $90k',
      posted: '4 days ago',
      description: 'Great opportunity for junior developers to grow their skills...',
      techStack: ['Node.js', 'Express', 'MongoDB', 'React'],
      skills: ['JavaScript', 'Node.js', 'Databases', 'APIs'],
      source: 'Glassdoor',
      url: 'https://glassdoor.com/jobs/5',
      isBookmarked: false,
      applicants: 67,
      matchScore: 83
    }
  ];

  const mockJobTrends: JobTrend[] = [
    {
      role: 'AI/ML Engineer',
      growth: 45,
      openings: 1247,
      avgSalary: '$130k - $180k',
      topSkills: ['Python', 'TensorFlow', 'PyTorch', 'AWS']
    },
    {
      role: 'DevOps Engineer',
      growth: 38,
      openings: 892,
      avgSalary: '$120k - $160k',
      topSkills: ['Kubernetes', 'Docker', 'AWS', 'CI/CD']
    },
    {
      role: 'Frontend Developer',
      growth: 25,
      openings: 2156,
      avgSalary: '$90k - $140k',
      topSkills: ['React', 'TypeScript', 'CSS', 'JavaScript']
    },
    {
      role: 'Data Scientist',
      growth: 32,
      openings: 678,
      avgSalary: '$120k - $170k',
      topSkills: ['Python', 'R', 'SQL', 'Machine Learning']
    }
  ];

  useEffect(() => {
    loadJobs();
    loadJobTrends();
  }, []);

  useEffect(() => {
    filterJobs();
  }, [jobs, searchQuery, selectedType, selectedExperience, selectedLocation, sortBy]);

  const loadJobs = async () => {
    try {
      setLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setJobs(mockJobs);
    } catch (error) {
      console.error('Failed to load jobs:', error);
      toastInfo('Error', 'Failed to load job listings');
    } finally {
      setLoading(false);
    }
  };

  const loadJobTrends = async () => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      setJobTrends(mockJobTrends);
    } catch (error) {
      console.error('Failed to load job trends:', error);
    }
  };

  const filterJobs = () => {
    let filtered = [...jobs];

    // Apply filters
    if (searchQuery) {
      filtered = filtered.filter(job =>
        job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.techStack.some(tech => tech.toLowerCase().includes(searchQuery.toLowerCase())) ||
        job.skills.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    if (selectedType !== 'all') {
      filtered = filtered.filter(job => job.type === selectedType);
    }

    if (selectedExperience !== 'all') {
      filtered = filtered.filter(job => job.experience === selectedExperience);
    }

    if (selectedLocation !== 'all') {
      filtered = filtered.filter(job => 
        job.location.toLowerCase().includes(selectedLocation.toLowerCase())
      );
    }

    // Sort
    switch (sortBy) {
      case 'latest':
        filtered.sort((a, b) => new Date(b.posted).getTime() - new Date(a.posted).getTime());
        break;
      case 'match':
        filtered.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
        break;
      case 'salary':
        filtered.sort((a, b) => {
          const salaryA = parseInt(a.salary?.match(/\d+/)?.[0] || '0');
          const salaryB = parseInt(b.salary?.match(/\d+/)?.[0] || '0');
          return salaryB - salaryA;
        });
        break;
      case 'applicants':
        filtered.sort((a, b) => (a.applicants || 0) - (b.applicants || 0));
        break;
    }

    setFilteredJobs(filtered);
  };

  const toggleBookmark = (jobId: string) => {
    setBookmarkedJobs(prev => {
      const newSet = new Set(prev);
      if (newSet.has(jobId)) {
        newSet.delete(jobId);
        toastInfo('Removed', 'Job removed from bookmarks');
      } else {
        newSet.add(jobId);
        toastInfo('Saved', 'Job added to bookmarks');
      }
      return newSet;
    });
  };

  const getExperienceColor = (level: string) => {
    switch (level) {
      case 'entry': return 'bg-green-100 text-green-800';
      case 'mid': return 'bg-blue-100 text-blue-800';
      case 'senior': return 'bg-purple-100 text-purple-800';
      case 'lead': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'internship': return GraduationCap;
      case 'full-time': return Briefcase;
      case 'part-time': return Clock;
      case 'contract': return Users;
      default: return Briefcase;
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
            <h1 className="text-3xl font-bold">Tech Opportunities</h1>
            <p className="text-muted-foreground">Discover your next career move in technology</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Advanced Filters
            </Button>
          </div>
        </div>

        <Tabs defaultValue="jobs" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="jobs">Job Listings</TabsTrigger>
            <TabsTrigger value="trends">Market Trends</TabsTrigger>
          </TabsList>

          <TabsContent value="jobs" className="space-y-6">
            {/* Search and Filters */}
            <Card>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search jobs, skills..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={selectedType} onValueChange={setSelectedType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Job Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="full-time">Full Time</SelectItem>
                      <SelectItem value="part-time">Part Time</SelectItem>
                      <SelectItem value="internship">Internship</SelectItem>
                      <SelectItem value="contract">Contract</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={selectedExperience} onValueChange={setSelectedExperience}>
                    <SelectTrigger>
                      <SelectValue placeholder="Experience" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Levels</SelectItem>
                      <SelectItem value="entry">Entry Level</SelectItem>
                      <SelectItem value="mid">Mid Level</SelectItem>
                      <SelectItem value="senior">Senior Level</SelectItem>
                      <SelectItem value="lead">Lead Level</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                    <SelectTrigger>
                      <SelectValue placeholder="Location" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Locations</SelectItem>
                      <SelectItem value="remote">Remote</SelectItem>
                      <SelectItem value="san francisco">San Francisco</SelectItem>
                      <SelectItem value="new york">New York</SelectItem>
                      <SelectItem value="seattle">Seattle</SelectItem>
                      <SelectItem value="austin">Austin</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sort By" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="latest">Latest</SelectItem>
                      <SelectItem value="match">Best Match</SelectItem>
                      <SelectItem value="salary">Salary</SelectItem>
                      <SelectItem value="applicants">Competition</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Job Listings */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <AnimatePresence>
                {filteredJobs.map((job) => {
                  const TypeIcon = getTypeIcon(job.type);
                  return (
                    <motion.div
                      key={job.id}
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
                                <TypeIcon className="h-4 w-4 text-muted-foreground" />
                                <Badge variant="outline" className={getExperienceColor(job.experience)}>
                                  {job.experience}
                                </Badge>
                                {job.matchScore && (
                                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                                    {job.matchScore}% Match
                                  </Badge>
                                )}
                              </div>
                              <h3 className="text-lg font-semibold mb-1">{job.title}</h3>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                                <Building className="h-4 w-4" />
                                <span>{job.company}</span>
                                <MapPin className="h-4 w-4 ml-2" />
                                <span>{job.location}</span>
                              </div>
                              {job.salary && (
                                <div className="flex items-center gap-2 text-sm text-green-600 font-medium mb-2">
                                  <DollarSign className="h-4 w-4" />
                                  <span>{job.salary}</span>
                                </div>
                              )}
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleBookmark(job.id)}
                              className="text-muted-foreground hover:text-primary"
                            >
                              <Bookmark className={`h-4 w-4 ${bookmarkedJobs.has(job.id) ? 'fill-current' : ''}`} />
                            </Button>
                          </div>

                          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                            {job.description}
                          </p>

                          <div className="flex flex-wrap gap-1 mb-4">
                            {job.techStack.slice(0, 4).map((tech) => (
                              <Badge key={tech} variant="secondary" className="text-xs">
                                {tech}
                              </Badge>
                            ))}
                            {job.techStack.length > 4 && (
                              <Badge variant="outline" className="text-xs">
                                +{job.techStack.length - 4} more
                              </Badge>
                            )}
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                <span>{job.posted}</span>
                              </div>
                              {job.applicants && (
                                <div className="flex items-center gap-1">
                                  <Users className="h-3 w-3" />
                                  <span>{job.applicants} applicants</span>
                                </div>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <Button size="sm" variant="outline">
                                <Eye className="h-4 w-4 mr-1" />
                                View
                              </Button>
                              <Button size="sm">
                                <ExternalLink className="h-4 w-4 mr-1" />
                                Apply
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </TabsContent>

          <TabsContent value="trends" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {jobTrends.map((trend, index) => (
                <motion.div
                  key={trend.role}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold">{trend.role}</h3>
                        <div className="flex items-center gap-1 text-green-600">
                          <TrendingUp className="h-4 w-4" />
                          <span className="font-medium">+{trend.growth}%</span>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Open Positions</span>
                          <span className="font-medium">{trend.openings.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Average Salary</span>
                          <span className="font-medium">{trend.avgSalary}</span>
                        </div>
                        
                        <div className="pt-3 border-t">
                          <div className="text-sm font-medium mb-2">Top Skills in Demand</div>
                          <div className="flex flex-wrap gap-1">
                            {trend.topSkills.map((skill) => (
                              <Badge key={skill} variant="secondary" className="text-xs">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* AI Insights */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  AI Career Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                      🚀 High Growth Areas
                    </h4>
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                      AI/ML and DevOps roles showing 40%+ growth. Focus on cloud skills and automation tools.
                    </p>
                  </div>
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <h4 className="font-semibold text-green-900 dark:text-green-100 mb-2">
                      💡 Skill Recommendations
                    </h4>
                    <p className="text-sm text-green-800 dark:text-green-200">
                      Python, AWS, and Kubernetes appear in 70% of high-paying tech roles.
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
