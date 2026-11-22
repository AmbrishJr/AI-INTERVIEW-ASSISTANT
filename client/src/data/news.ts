export type NewsCategory =
  "tech" | "hiring" | "layoffs" | "projects" | "internships";

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

/** Explicit examples used only when the live feed is unavailable. */
export const FALLBACK_NEWS: NewsItem[] = [
  {
    id: "sample-tech",
    title: "Sample: a new developer tool",
    summary:
      "An example article about evaluating a developer tool: consider documentation, compatibility, and maintenance before adopting it.",
    category: "tech",
    source: "Illustrative example",
    url: "",
    publishedAt: "",
    techStack: ["Developer tools"],
    tags: ["development", "tools"],
  },
  {
    id: "sample-hiring",
    title: "Sample: preparing for a software role",
    summary:
      "An example hiring brief. Compare a role’s responsibilities with projects you can discuss clearly during an interview.",
    category: "hiring",
    source: "Illustrative example",
    url: "",
    publishedAt: "",
    techStack: ["Software Engineering"],
    tags: ["hiring", "interview"],
  },
  {
    id: "sample-projects",
    title: "Sample: learning through open source",
    summary:
      "An example project update. Reading an issue, writing a test, and explaining a small fix can be useful interview practice.",
    category: "projects",
    source: "Illustrative example",
    url: "",
    publishedAt: "",
    techStack: ["Open source"],
    tags: ["projects", "learning"],
  },
];
