import { AlertTriangle, Bookmark, Briefcase, Clock, ExternalLink, GraduationCap, Rocket, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { NewsCategory, NewsItem } from "@/data/news";

export const CATEGORY_META: Record<NewsCategory, { label: string; Icon: typeof Rocket; className: string }> = {
  tech: { label: "Tech News", Icon: Rocket, className: "bg-blue-500/10 text-blue-600 border-blue-200" },
  hiring: { label: "Hiring", Icon: Briefcase, className: "bg-green-500/10 text-green-600 border-green-200" },
  layoffs: { label: "Layoffs", Icon: AlertTriangle, className: "bg-red-500/10 text-red-600 border-red-200" },
  projects: { label: "Projects", Icon: Users, className: "bg-purple-500/10 text-purple-600 border-purple-200" },
  internships: { label: "Internships", Icon: GraduationCap, className: "bg-yellow-500/10 text-yellow-600 border-yellow-200" },
};

const MAX_TECH_BADGES = 3;

function formatTimeAgo(iso: string) {
  const hours = Math.floor((Date.now() - new Date(iso).getTime()) / 3_600_000);
  if (hours < 1) return "Just now";
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

interface NewsCardProps {
  item: NewsItem;
  bookmarked: boolean;
  onToggleBookmark: () => void;
}

export default function NewsCard({ item, bookmarked, onToggleBookmark }: NewsCardProps) {
  const category = CATEGORY_META[item.category] ?? CATEGORY_META.tech;
  const { Icon } = category;

  return (
    <Card className="h-full hover:shadow-lg transition-shadow duration-300">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <Badge className={`${category.className} border`}>
            <Icon className="h-3 w-3 mr-1" />
            {category.label}
          </Badge>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleBookmark}
              aria-label={bookmarked ? "Remove bookmark" : "Bookmark article"}
              aria-pressed={bookmarked}
              className="h-8 w-8 p-0"
            >
              <Bookmark className={bookmarked ? "h-4 w-4 fill-current" : "h-4 w-4"} />
            </Button>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" asChild>
              <a href={item.url} target="_blank" rel="noopener noreferrer" aria-label="Open article">
                <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
          </div>
        </div>
        <CardTitle className="text-lg line-clamp-2 leading-tight">{item.title}</CardTitle>
      </CardHeader>
      <CardContent className="pt-0 space-y-3">
        <p className="text-sm text-muted-foreground line-clamp-3">{item.summary}</p>

        {item.companyName && (
          <div className="flex items-center gap-2 text-sm">
            <span className="font-medium">{item.companyName}</span>
            {item.location && <span className="text-muted-foreground">• {item.location}</span>}
          </div>
        )}

        {item.techStack && item.techStack.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {item.techStack.slice(0, MAX_TECH_BADGES).map((tech) => (
              <Badge key={tech} variant="secondary" className="text-xs">
                {tech}
              </Badge>
            ))}
            {item.techStack.length > MAX_TECH_BADGES && (
              <Badge variant="outline" className="text-xs">
                +{item.techStack.length - MAX_TECH_BADGES}
              </Badge>
            )}
          </div>
        )}

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {formatTimeAgo(item.publishedAt)}
          </span>
          <span>{item.source}</span>
        </div>
      </CardContent>
    </Card>
  );
}

export function NewsCardSkeleton() {
  return (
    <Card className="animate-pulse">
      <CardContent className="p-6">
        <div className="h-4 bg-muted rounded mb-2" />
        <div className="h-3 bg-muted rounded mb-4 w-3/4" />
        <div className="space-y-2">
          <div className="h-3 bg-muted rounded" />
          <div className="h-3 bg-muted rounded w-5/6" />
        </div>
      </CardContent>
    </Card>
  );
}
