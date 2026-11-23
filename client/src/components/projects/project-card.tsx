import {
  BookOpen,
  Building,
  ExternalLink,
  GitBranch,
  GraduationCap,
  Rocket,
  Star,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatDaysAgo } from "@/lib/format";
import type {
  AuthorType,
  Project,
  ProjectCategory,
  ProjectDifficulty,
} from "@/data/projects";

const CATEGORY_STYLES: Record<ProjectCategory, string> = {
  ai: "bg-purple-100 dark:bg-purple-950/50 text-purple-800 dark:text-purple-300",
  web: "bg-blue-100 dark:bg-blue-950/50 text-blue-800 dark:text-blue-300",
  mobile:
    "bg-green-100 dark:bg-green-950/50 text-green-800 dark:text-green-300",
  blockchain:
    "bg-orange-100 dark:bg-orange-950/50 text-orange-800 dark:text-orange-300",
  data: "bg-cyan-100 dark:bg-cyan-950/50 text-cyan-800 dark:text-cyan-300",
  iot: "bg-red-100 dark:bg-red-950/50 text-red-800 dark:text-red-300",
};

const DIFFICULTY_STYLES: Record<ProjectDifficulty, string> = {
  beginner:
    "bg-green-100 dark:bg-green-950/50 text-green-800 dark:text-green-300",
  intermediate:
    "bg-yellow-100 dark:bg-yellow-950/50 text-yellow-800 dark:text-yellow-300",
  advanced: "bg-red-100 dark:bg-red-950/50 text-red-800 dark:text-red-300",
};

const AUTHOR_ICONS: Record<AuthorType, typeof Building> = {
  student: GraduationCap,
  startup: Rocket,
  company: Building,
  researcher: BookOpen,
};

const MAX_TECH_BADGES = 4;

interface ProjectCardProps {
  project: Project;
  bookmarked: boolean;
  onToggleBookmark: () => void;
}

export default function ProjectCard({
  project,
  bookmarked,
  onToggleBookmark,
}: ProjectCardProps) {
  const AuthorIcon = AUTHOR_ICONS[project.authorType];

  return (
    <Card className="h-full hover:border-input transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <AuthorIcon
                className="h-4 w-4 text-muted-foreground"
                aria-label={project.authorType}
              />
              <Badge
                variant="outline"
                className={CATEGORY_STYLES[project.category]}
              >
                {project.category}
              </Badge>
              <Badge
                variant="outline"
                className={DIFFICULTY_STYLES[project.difficulty]}
              >
                {project.difficulty}
              </Badge>
            </div>
            <h3 className="text-lg font-semibold mb-1">{project.name}</h3>
            <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground mb-2">
              <span>{project.author}</span>
              <span aria-hidden>•</span>
              <span>{project.language}</span>
              <span aria-hidden>•</span>
              <span>{formatDaysAgo(project.updatedDaysAgo)}</span>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleBookmark}
            aria-label={bookmarked ? "Remove bookmark" : "Bookmark project"}
            aria-pressed={bookmarked}
            className="text-muted-foreground hover:text-primary"
          >
            <Star className={bookmarked ? "h-4 w-4 fill-current" : "h-4 w-4"} />
          </Button>
        </div>

        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
          {project.description}
        </p>

        <div className="flex flex-wrap gap-1 mb-4">
          {project.techStack.slice(0, MAX_TECH_BADGES).map((tech) => (
            <Badge key={tech} variant="secondary" className="text-xs">
              {tech}
            </Badge>
          ))}
          {project.techStack.length > MAX_TECH_BADGES && (
            <Badge variant="outline" className="text-xs">
              +{project.techStack.length - MAX_TECH_BADGES} more
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
          <span className="flex items-center gap-1">
            <Star className="h-3 w-3" />
            {project.stars.toLocaleString()}
          </span>
          <span className="flex items-center gap-1">
            <GitBranch className="h-3 w-3" />
            {project.forks}
          </span>
        </div>

        {project.learningOutcomes.length > 0 && (
          <div className="p-3 bg-blue-50 dark:bg-blue-950/50 rounded-lg mb-4">
            <div className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-1">
              What you’ll learn
            </div>
            <div className="flex flex-wrap gap-1">
              {project.learningOutcomes.slice(0, 3).map((outcome) => (
                <Badge
                  key={outcome}
                  variant="secondary"
                  className="text-xs bg-blue-100 dark:bg-blue-950/50 text-blue-800 dark:text-blue-300"
                >
                  {outcome}
                </Badge>
              ))}
            </div>
          </div>
        )}

        <Button size="sm" asChild>
          <a href={project.url} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="h-4 w-4 mr-1" />
            View on GitHub
          </a>
        </Button>
      </CardContent>
    </Card>
  );
}
