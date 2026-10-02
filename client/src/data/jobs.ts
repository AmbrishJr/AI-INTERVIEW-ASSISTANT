export type JobType = "full-time" | "part-time" | "internship" | "contract";
export type ExperienceLevel = "entry" | "mid" | "senior" | "lead";

export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  type: JobType;
  experience: ExperienceLevel;
  salary?: string;
  postedDaysAgo: number;
  description: string;
  techStack: string[];
  skills: string[];
  source: string;
  url: string;
  applicants?: number;
  matchScore?: number;
}

export interface JobTrend {
  role: string;
  growth: number;
  openings: number;
  avgSalary: string;
  topSkills: string[];
}

export const JOBS: Job[] = [
  {
    id: "1",
    title: "Senior Software Engineer",
    company: "TechCorp",
    location: "San Francisco, CA",
    type: "full-time",
    experience: "senior",
    salary: "$150k - $200k",
    postedDaysAgo: 2,
    description: "Looking for experienced software engineer to join our AI team...",
    techStack: ["React", "Python", "AWS", "TensorFlow"],
    skills: ["Machine Learning", "Cloud Architecture", "System Design"],
    source: "LinkedIn",
    url: "https://linkedin.com/jobs/1",
    applicants: 127,
    matchScore: 92,
  },
  {
    id: "2",
    title: "Frontend Developer Intern",
    company: "StartupXYZ",
    location: "Remote",
    type: "internship",
    experience: "entry",
    salary: "$25 - $35/hour",
    postedDaysAgo: 1,
    description: "Join our frontend team and work on cutting-edge web applications...",
    techStack: ["React", "TypeScript", "Tailwind CSS"],
    skills: ["React", "TypeScript", "CSS", "JavaScript"],
    source: "AngelList",
    url: "https://angel.co/jobs/2",
    applicants: 89,
    matchScore: 88,
  },
  {
    id: "3",
    title: "DevOps Engineer",
    company: "CloudTech",
    location: "Seattle, WA",
    type: "full-time",
    experience: "mid",
    salary: "$120k - $160k",
    postedDaysAgo: 3,
    description: "Help us build and maintain scalable cloud infrastructure...",
    techStack: ["Kubernetes", "Docker", "AWS", "Terraform"],
    skills: ["DevOps", "Cloud Computing", "CI/CD", "Infrastructure as Code"],
    source: "Built In",
    url: "https://builtin.com/jobs/3",
    applicants: 156,
    matchScore: 85,
  },
  {
    id: "4",
    title: "Data Scientist",
    company: "DataCorp",
    location: "New York, NY",
    type: "full-time",
    experience: "senior",
    salary: "$140k - $180k",
    postedDaysAgo: 7,
    description: "Apply machine learning techniques to solve complex business problems...",
    techStack: ["Python", "R", "SQL", "Tableau"],
    skills: ["Machine Learning", "Data Analysis", "Statistics", "Python"],
    source: "Indeed",
    url: "https://indeed.com/jobs/4",
    applicants: 203,
    matchScore: 79,
  },
  {
    id: "5",
    title: "Junior Backend Developer",
    company: "WebSolutions",
    location: "Austin, TX",
    type: "full-time",
    experience: "entry",
    salary: "$70k - $90k",
    postedDaysAgo: 4,
    description: "Great opportunity for junior developers to grow their skills...",
    techStack: ["Node.js", "Express", "MongoDB", "React"],
    skills: ["JavaScript", "Node.js", "Databases", "APIs"],
    source: "Glassdoor",
    url: "https://glassdoor.com/jobs/5",
    applicants: 67,
    matchScore: 83,
  },
];

export const JOB_TRENDS: JobTrend[] = [
  { role: "AI/ML Engineer", growth: 45, openings: 1247, avgSalary: "$130k - $180k", topSkills: ["Python", "TensorFlow", "PyTorch", "AWS"] },
  { role: "DevOps Engineer", growth: 38, openings: 892, avgSalary: "$120k - $160k", topSkills: ["Kubernetes", "Docker", "AWS", "CI/CD"] },
  { role: "Frontend Developer", growth: 25, openings: 2156, avgSalary: "$90k - $140k", topSkills: ["React", "TypeScript", "CSS", "JavaScript"] },
  { role: "Data Scientist", growth: 32, openings: 678, avgSalary: "$120k - $170k", topSkills: ["Python", "R", "SQL", "Machine Learning"] },
];
