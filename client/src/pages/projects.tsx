import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FilterSelect, matchesQuery, SearchInput } from "@/components/common/filters";
import PageHeader from "@/components/common/page-header";
import ProjectCard from "@/components/projects/project-card";
import ResearchPapers from "@/components/projects/research-papers";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PROJECTS, RESEARCH_PAPERS, type Project } from "@/data/projects";
import { useBookmarks } from "@/hooks/use-bookmarks";

const CATEGORY_OPTIONS = [
  { value: "all", label: "All Categories" },
  { value: "ai", label: "AI/ML" },
  { value: "web", label: "Web Development" },
  { value: "mobile", label: "Mobile" },
  { value: "blockchain", label: "Blockchain" },
  { value: "data", label: "Data Science" },
  { value: "iot", label: "IoT" },
] as const;

const DIFFICULTY_OPTIONS = [
  { value: "all", label: "All Levels" },
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
] as const;

const AUTHOR_OPTIONS = [
  { value: "all", label: "All Authors" },
  { value: "student", label: "Students" },
  { value: "startup", label: "Startups" },
  { value: "company", label: "Companies" },
  { value: "researcher", label: "Researchers" },
] as const;

const SORT_OPTIONS = [
  { value: "trending", label: "Trending" },
  { value: "updated", label: "Recently Updated" },
  { value: "forks", label: "Most Forked" },
  { value: "beginner", label: "Beginner Friendly" },
] as const;

type SortKey = (typeof SORT_OPTIONS)[number]["value"];

const DIFFICULTY_RANK = { beginner: 0, intermediate: 1, advanced: 2 } as const;

const SORTERS: Record<SortKey, (a: Project, b: Project) => number> = {
  trending: (a, b) => b.stars - a.stars,
  updated: (a, b) => a.updatedDaysAgo - b.updatedDaysAgo,
  forks: (a, b) => b.forks - a.forks,
  beginner: (a, b) => DIFFICULTY_RANK[a.difficulty] - DIFFICULTY_RANK[b.difficulty],
};

export default function Projects() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<(typeof CATEGORY_OPTIONS)[number]["value"]>("all");
  const [difficulty, setDifficulty] = useState<(typeof DIFFICULTY_OPTIONS)[number]["value"]>("all");
  const [authorType, setAuthorType] = useState<(typeof AUTHOR_OPTIONS)[number]["value"]>("all");
  const [sortBy, setSortBy] = useState<SortKey>("trending");
  const bookmarks = useBookmarks("Project");

  const projects = useMemo(
    () =>
      PROJECTS.filter(
        (p) =>
          matchesQuery(query, p.name, p.description, p.techStack) &&
          (category === "all" || p.category === category) &&
          (difficulty === "all" || p.difficulty === difficulty) &&
          (authorType === "all" || p.authorType === authorType),
      ).sort(SORTERS[sortBy]),
    [query, category, difficulty, authorType, sortBy],
  );

  return (
    <div className="max-w-7xl mx-auto py-6 space-y-6">
      <PageHeader title="Projects & Research" description="Discover innovative projects and cutting-edge research" />

      <Tabs defaultValue="projects" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="projects">Open Source Projects</TabsTrigger>
          <TabsTrigger value="research">Research Papers</TabsTrigger>
        </TabsList>

        <TabsContent value="projects" className="space-y-6">
          <Card>
            <CardContent className="p-6 grid grid-cols-1 md:grid-cols-5 gap-4">
              <SearchInput value={query} onChange={setQuery} placeholder="Search projects..." />
              <FilterSelect value={category} onChange={setCategory} options={CATEGORY_OPTIONS} placeholder="Category" />
              <FilterSelect value={difficulty} onChange={setDifficulty} options={DIFFICULTY_OPTIONS} placeholder="Difficulty" />
              <FilterSelect value={authorType} onChange={setAuthorType} options={AUTHOR_OPTIONS} placeholder="Author Type" />
              <FilterSelect value={sortBy} onChange={setSortBy} options={SORT_OPTIONS} placeholder="Sort By" />
            </CardContent>
          </Card>

          {projects.length === 0 ? (
            <p className="text-center text-muted-foreground py-12">No projects match your filters.</p>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <AnimatePresence>
                {projects.map((project) => (
                  <motion.div
                    key={project.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ProjectCard
                      project={project}
                      bookmarked={bookmarks.isBookmarked(project.id)}
                      onToggleBookmark={() => bookmarks.toggle(project.id)}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </TabsContent>

        <TabsContent value="research">
          <ResearchPapers papers={RESEARCH_PAPERS} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
