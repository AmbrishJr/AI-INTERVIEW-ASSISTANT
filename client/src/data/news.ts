export type NewsCategory = "tech" | "hiring" | "layoffs" | "projects" | "internships";

export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  category: NewsCategory;
  source: string;
  url: string;
  publishedAt: string;
  companyName?: string;
  location?: string;
  techStack?: string[];
  role?: string;
  impact?: string;
  tags: string[];
}

/** Shown when the /api/news endpoint is unreachable (e.g. running the client alone). */
export const FALLBACK_NEWS: NewsItem[] = [
  {
    id: "1",
    title: "OpenAI Announces GPT-5 with Enhanced Reasoning Capabilities",
    summary: "OpenAI reveals GPT-5 featuring improved logical reasoning, reduced hallucinations, and better performance on complex technical tasks. The model shows significant improvements in code generation and mathematical problem-solving.",
    category: "tech",
    source: "TechCrunch",
    url: "https://techcrunch.com/openai-gpt5",
    publishedAt: "2024-01-23T10:30:00Z",
    companyName: "OpenAI",
    techStack: ["AI/ML", "NLP", "Deep Learning"],
    impact: "Major advancement in AI capabilities",
    tags: ["AI", "Machine Learning", "GPT-5", "OpenAI"]
  },
  {
    id: "2",
    title: "Google Hiring 1000+ Engineers for Cloud AI Division",
    summary: "Google Cloud is expanding its AI team with over 1000 new positions across software engineering, machine learning, and cloud infrastructure roles. Positions available in Mountain View, Seattle, and remote.",
    category: "hiring",
    source: "Google Careers",
    url: "https://careers.google.com",
    publishedAt: "2024-01-23T09:15:00Z",
    companyName: "Google",
    location: "Mountain View, Seattle, Remote",
    role: "Software Engineer, ML Engineer",
    techStack: ["Google Cloud", "TensorFlow", "Kubernetes"],
    tags: ["Google", "Hiring", "Cloud", "AI", "Remote"]
  },
  {
    id: "3",
    title: "Meta Layoffs 5000 Tech Workers in Restructuring",
    summary: "Meta cuts 5000 positions primarily in middle management and non-technical roles as part of \"Year of Efficiency\" initiative. Engineering teams relatively unaffected with focus on AI and metaverse development.",
    category: "layoffs",
    source: "The Verge",
    url: "https://theverge.com/meta-layoffs",
    publishedAt: "2024-01-22T16:45:00Z",
    companyName: "Meta",
    impact: "Major restructuring affecting 5000 employees",
    tags: ["Meta", "Layoffs", "Restructuring", "Meta"]
  },
  {
    id: "4",
    title: "Microsoft Launches Open Source AI Development Framework",
    summary: "Microsoft releases new open-source framework for AI development, integrating with Azure and supporting multiple ML frameworks. Aims to democratize AI development with enterprise-grade tools.",
    category: "projects",
    source: "Microsoft Blog",
    url: "https://blogs.microsoft.com/ai-framework",
    publishedAt: "2024-01-22T14:20:00Z",
    companyName: "Microsoft",
    techStack: ["Azure", "Python", "TypeScript", "ML"],
    impact: "Open source AI tools for developers",
    tags: ["Microsoft", "Open Source", "AI", "Azure", "Development"]
  },
  {
    id: "5",
    title: "Amazon Offers 500 Summer Internships for CS Students",
    summary: "Amazon Web Services announces 500 paid summer internship positions for computer science students. Roles include software development, cloud engineering, and data science. Applications close March 1st.",
    category: "internships",
    source: "Amazon Jobs",
    url: "https://www.amazon.jobs/internships",
    publishedAt: "2024-01-21T11:30:00Z",
    companyName: "Amazon",
    location: "Seattle, Austin, Arlington",
    role: "SDE Intern, Data Science Intern",
    techStack: ["AWS", "Java", "Python", "Distributed Systems"],
    tags: ["Amazon", "Internships", "Summer 2024", "AWS", "Students"]
  }
];
