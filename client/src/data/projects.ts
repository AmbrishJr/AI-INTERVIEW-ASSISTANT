export type ProjectCategory = "web" | "mobile" | "ai" | "blockchain" | "iot" | "data";
export type ProjectDifficulty = "beginner" | "intermediate" | "advanced";
export type AuthorType = "student" | "startup" | "company" | "researcher";

export interface Project {
  id: string;
  name: string;
  description: string;
  author: string;
  authorType: AuthorType;
  category: ProjectCategory;
  techStack: string[];
  stars: number;
  forks: number;
  language: string;
  updatedDaysAgo: number;
  url: string;
  difficulty: ProjectDifficulty;
  learningOutcomes: string[];
  prerequisites: string[];
}

export interface ResearchPaper {
  id: string;
  title: string;
  authors: string[];
  institution: string;
  category: "ai" | "ml" | "nlp" | "cv" | "robotics" | "quantum";
  abstract: string;
  publishDate: string;
  citations: number;
  url: string;
  keyFindings: string[];
  practicalApplications: string[];
}

export const PROJECTS: Project[] = [
  {
    id: "1",
    name: "AI-Powered Code Review Assistant",
    description: "An intelligent code review tool that uses machine learning to identify bugs, suggest improvements, and enforce coding standards automatically.",
    author: "Sarah Chen",
    authorType: "student",
    category: "ai",
    techStack: ["Python", "TensorFlow", "React", "FastAPI"],
    stars: 1247,
    forks: 234,
    language: "Python",
    updatedDaysAgo: 2,
    url: "https://github.com/sarahchen/ai-code-review",
    difficulty: "advanced",
    learningOutcomes: ["Machine Learning", "Code Analysis", "API Development"],
    prerequisites: ["Python", "Machine Learning basics", "REST APIs"]
  },
  {
    id: "2",
    name: "Real-time Collaboration Platform",
    description: "A modern web-based collaboration tool with real-time editing, video conferencing, and project management features.",
    author: "TechStart Inc.",
    authorType: "startup",
    category: "web",
    techStack: ["React", "Node.js", "WebRTC", "MongoDB"],
    stars: 892,
    forks: 156,
    language: "TypeScript",
    updatedDaysAgo: 7,
    url: "https://github.com/techstart/collab-platform",
    difficulty: "intermediate",
    learningOutcomes: ["Real-time Communication", "WebRTC", "Full-stack Development"],
    prerequisites: ["React", "Node.js", "WebSockets"]
  },
  {
    id: "3",
    name: "Blockchain Supply Chain Tracker",
    description: "A decentralized supply chain management system using blockchain technology for transparency and traceability.",
    author: "Prof. Michael Roberts",
    authorType: "researcher",
    category: "blockchain",
    techStack: ["Solidity", "Web3.js", "React", "IPFS"],
    stars: 567,
    forks: 89,
    language: "Solidity",
    updatedDaysAgo: 3,
    url: "https://github.com/mroberts/supply-chain",
    difficulty: "advanced",
    learningOutcomes: ["Blockchain Development", "Smart Contracts", "DApps"],
    prerequisites: ["JavaScript", "Blockchain basics", "Cryptography"]
  },
  {
    id: "4",
    name: "Mobile Health Monitoring App",
    description: "A cross-platform mobile application for tracking health metrics, medication reminders, and telemedicine consultations.",
    author: "HealthTech Solutions",
    authorType: "company",
    category: "mobile",
    techStack: ["React Native", "Firebase", "Node.js", "TensorFlow Lite"],
    stars: 2341,
    forks: 445,
    language: "JavaScript",
    updatedDaysAgo: 5,
    url: "https://github.com/healthtech/monitor-app",
    difficulty: "intermediate",
    learningOutcomes: ["Mobile Development", "Health Tech", "Firebase"],
    prerequisites: ["React", "JavaScript", "Mobile Development"]
  },
  {
    id: "5",
    name: "Data Visualization Dashboard",
    description: "An interactive dashboard for creating beautiful, responsive data visualizations with drag-and-drop functionality.",
    author: "Alex Kumar",
    authorType: "student",
    category: "data",
    techStack: ["Vue.js", "D3.js", "Python", "PostgreSQL"],
    stars: 789,
    forks: 123,
    language: "JavaScript",
    updatedDaysAgo: 1,
    url: "https://github.com/alexkumar/data-viz",
    difficulty: "beginner",
    learningOutcomes: ["Data Visualization", "D3.js", "Dashboard Design"],
    prerequisites: ["JavaScript", "HTML/CSS", "Basic Statistics"]
  }
];

export const RESEARCH_PAPERS: ResearchPaper[] = [
  {
    id: "1",
    title: "Transformers in Computer Vision: A Comprehensive Survey",
    authors: ["Dr. Emily Zhang", "Prof. James Liu", "Dr. Sarah Williams"],
    institution: "MIT Computer Science Lab",
    category: "cv",
    abstract: "This paper presents a comprehensive survey of transformer architectures in computer vision, analyzing their performance across various tasks and datasets.",
    publishDate: "2024-01-15",
    citations: 127,
    url: "https://arxiv.org/abs/2024.01234",
    keyFindings: [
      "Vision Transformers outperform CNNs in large-scale datasets",
      "Self-supervised learning significantly improves performance",
      "Computational efficiency remains a challenge"
    ],
    practicalApplications: [
      "Medical image analysis",
      "Autonomous vehicle perception",
      "Industrial quality control"
    ]
  },
  {
    id: "2",
    title: "Quantum Machine Learning: Algorithms and Applications",
    authors: ["Prof. Robert Chen", "Dr. Lisa Anderson"],
    institution: "Stanford Quantum Computing Center",
    category: "quantum",
    abstract: "An exploration of quantum machine learning algorithms, their theoretical foundations, and practical applications in near-term quantum devices.",
    publishDate: "2024-01-10",
    citations: 89,
    url: "https://arxiv.org/abs/2024.01012",
    keyFindings: [
      "Quantum advantage demonstrated in specific ML tasks",
      "Hybrid quantum-classical approaches show promise",
      "Error mitigation is crucial for practical applications"
    ],
    practicalApplications: [
      "Drug discovery",
      "Financial modeling",
      "Optimization problems"
    ]
  }
];
