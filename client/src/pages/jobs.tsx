import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FilterSelect, matchesQuery, SearchInput } from "@/components/common/filters";
import PageHeader from "@/components/common/page-header";
import JobCard from "@/components/jobs/job-card";
import MarketTrends from "@/components/jobs/market-trends";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { JOB_TRENDS, JOBS, type Job } from "@/data/jobs";
import { useBookmarks } from "@/hooks/use-bookmarks";

const TYPE_OPTIONS = [
  { value: "all", label: "All Types" },
  { value: "full-time", label: "Full Time" },
  { value: "part-time", label: "Part Time" },
  { value: "internship", label: "Internship" },
  { value: "contract", label: "Contract" },
] as const;

const EXPERIENCE_OPTIONS = [
  { value: "all", label: "All Levels" },
  { value: "entry", label: "Entry Level" },
  { value: "mid", label: "Mid Level" },
  { value: "senior", label: "Senior Level" },
  { value: "lead", label: "Lead Level" },
] as const;

const LOCATION_OPTIONS = [
  { value: "all", label: "All Locations" },
  { value: "remote", label: "Remote" },
  { value: "san francisco", label: "San Francisco" },
  { value: "new york", label: "New York" },
  { value: "seattle", label: "Seattle" },
  { value: "austin", label: "Austin" },
] as const;

const SORT_OPTIONS = [
  { value: "latest", label: "Latest" },
  { value: "match", label: "Best Match" },
  { value: "salary", label: "Salary" },
  { value: "applicants", label: "Least Competition" },
] as const;

type SortKey = (typeof SORT_OPTIONS)[number]["value"];

const salaryFloor = (job: Job) => parseInt(job.salary?.match(/\d+/)?.[0] ?? "0", 10);

const SORTERS: Record<SortKey, (a: Job, b: Job) => number> = {
  latest: (a, b) => a.postedDaysAgo - b.postedDaysAgo,
  match: (a, b) => (b.matchScore ?? 0) - (a.matchScore ?? 0),
  salary: (a, b) => salaryFloor(b) - salaryFloor(a),
  applicants: (a, b) => (a.applicants ?? 0) - (b.applicants ?? 0),
};

export default function Jobs() {
  const [query, setQuery] = useState("");
  const [type, setType] = useState<(typeof TYPE_OPTIONS)[number]["value"]>("all");
  const [experience, setExperience] = useState<(typeof EXPERIENCE_OPTIONS)[number]["value"]>("all");
  const [location, setLocation] = useState<(typeof LOCATION_OPTIONS)[number]["value"]>("all");
  const [sortBy, setSortBy] = useState<SortKey>("latest");
  const bookmarks = useBookmarks("Job");

  const jobs = useMemo(
    () =>
      JOBS.filter(
        (job) =>
          matchesQuery(query, job.title, job.company, job.techStack, job.skills) &&
          (type === "all" || job.type === type) &&
          (experience === "all" || job.experience === experience) &&
          (location === "all" || job.location.toLowerCase().includes(location)),
      ).sort(SORTERS[sortBy]),
    [query, type, experience, location, sortBy],
  );

  return (
    <div className="max-w-7xl mx-auto py-6 space-y-6">
      <PageHeader title="Tech Opportunities" description="Discover your next career move in technology" />

      <Tabs defaultValue="jobs" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="jobs">Job Listings</TabsTrigger>
          <TabsTrigger value="trends">Market Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="jobs" className="space-y-6">
          <Card>
            <CardContent className="p-6 grid grid-cols-1 md:grid-cols-5 gap-4">
              <SearchInput value={query} onChange={setQuery} placeholder="Search jobs, skills..." />
              <FilterSelect value={type} onChange={setType} options={TYPE_OPTIONS} placeholder="Job Type" />
              <FilterSelect value={experience} onChange={setExperience} options={EXPERIENCE_OPTIONS} placeholder="Experience" />
              <FilterSelect value={location} onChange={setLocation} options={LOCATION_OPTIONS} placeholder="Location" />
              <FilterSelect value={sortBy} onChange={setSortBy} options={SORT_OPTIONS} placeholder="Sort By" />
            </CardContent>
          </Card>

          {jobs.length === 0 ? (
            <p className="text-center text-muted-foreground py-12">No jobs match your filters.</p>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <AnimatePresence>
                {jobs.map((job) => (
                  <motion.div
                    key={job.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <JobCard
                      job={job}
                      bookmarked={bookmarks.isBookmarked(job.id)}
                      onToggleBookmark={() => bookmarks.toggle(job.id)}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </TabsContent>

        <TabsContent value="trends">
          <MarketTrends trends={JOB_TRENDS} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
