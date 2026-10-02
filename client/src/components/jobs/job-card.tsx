import { Bookmark, Briefcase, Building, Calendar, Clock, DollarSign, ExternalLink, GraduationCap, MapPin, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatDaysAgo } from "@/lib/format";
import type { ExperienceLevel, Job, JobType } from "@/data/jobs";

const EXPERIENCE_STYLES: Record<ExperienceLevel, string> = {
  entry: "bg-green-100 text-green-800",
  mid: "bg-blue-100 text-blue-800",
  senior: "bg-purple-100 text-purple-800",
  lead: "bg-orange-100 text-orange-800",
};

const TYPE_ICONS: Record<JobType, typeof Briefcase> = {
  internship: GraduationCap,
  "full-time": Briefcase,
  "part-time": Clock,
  contract: Users,
};

const MAX_TECH_BADGES = 4;

interface JobCardProps {
  job: Job;
  bookmarked: boolean;
  onToggleBookmark: () => void;
}

export default function JobCard({ job, bookmarked, onToggleBookmark }: JobCardProps) {
  const TypeIcon = TYPE_ICONS[job.type];

  return (
    <Card className="h-full hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <TypeIcon className="h-4 w-4 text-muted-foreground" aria-label={job.type} />
              <Badge variant="outline" className={EXPERIENCE_STYLES[job.experience]}>
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
            onClick={onToggleBookmark}
            aria-label={bookmarked ? "Remove bookmark" : "Bookmark job"}
            aria-pressed={bookmarked}
            className="text-muted-foreground hover:text-primary"
          >
            <Bookmark className={bookmarked ? "h-4 w-4 fill-current" : "h-4 w-4"} />
          </Button>
        </div>

        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{job.description}</p>

        <div className="flex flex-wrap gap-1 mb-4">
          {job.techStack.slice(0, MAX_TECH_BADGES).map((tech) => (
            <Badge key={tech} variant="secondary" className="text-xs">
              {tech}
            </Badge>
          ))}
          {job.techStack.length > MAX_TECH_BADGES && (
            <Badge variant="outline" className="text-xs">
              +{job.techStack.length - MAX_TECH_BADGES} more
            </Badge>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {formatDaysAgo(job.postedDaysAgo)}
            </span>
            {job.applicants && (
              <span className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                {job.applicants} applicants
              </span>
            )}
          </div>
          <Button size="sm" asChild>
            <a href={job.url} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4 mr-1" />
              Apply on {job.source}
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
