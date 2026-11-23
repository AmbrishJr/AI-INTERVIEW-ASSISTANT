import { useState } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { RefreshCw, Search } from "lucide-react";
import { FilterSelect, SearchInput } from "@/components/common/filters";
import PageHeader from "@/components/common/page-header";
import NewsCard, {
  CATEGORY_META,
  NewsCardSkeleton,
} from "@/components/news/news-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FALLBACK_NEWS, type NewsItem } from "@/data/news";
import { useBookmarks } from "@/hooks/use-bookmarks";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { toastInfo } from "@/hooks/use-toast";

const CATEGORY_OPTIONS = [
  { value: "all", label: "All News" },
  ...Object.entries(CATEGORY_META).map(([value, { label }]) => ({
    value,
    label,
  })),
];

const SORT_OPTIONS = [
  { value: "latest", label: "Latest" },
  { value: "trending", label: "Top scored" },
  { value: "relevance", label: "Source order" },
] as const;

type SortKey = (typeof SORT_OPTIONS)[number]["value"];

const PAGE_SIZE = 20;

async function fetchNews(
  category: string,
  search: string,
  sortBy: SortKey,
): Promise<{ news: NewsItem[]; fallback: boolean }> {
  const params = new URLSearchParams({
    sortBy,
    limit: String(PAGE_SIZE),
    offset: "0",
  });
  if (category !== "all") params.set("category", category);
  if (search) params.set("search", search);
  try {
    const res = await fetch(`/api/news?${params}`);
    if (!res.ok) throw new Error("News unavailable");
    const data = await res.json();
    if (data.source === "unavailable") throw new Error("Sources unavailable");
    return { news: data.news ?? [], fallback: false };
  } catch {
    return {
      news: FALLBACK_NEWS.filter(
        (item) =>
          (category === "all" || item.category === category) &&
          `${item.title} ${item.summary} ${item.tags.join(" ")}`
            .toLowerCase()
            .includes(search.toLowerCase()),
      ),
      fallback: true,
    };
  }
}

export default function News() {
  const [category, setCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<SortKey>("latest");
  const debouncedSearch = useDebouncedValue(search.trim());
  const bookmarks = useBookmarks("Article");

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ["news", category, debouncedSearch, sortBy],
    queryFn: () => fetchNews(category, debouncedSearch, sortBy),
    placeholderData: keepPreviousData,
    staleTime: 5 * 60 * 1000,
  });

  const news = data?.news ?? [];
  const clearFilters = () => {
    setCategory("all");
    setSearch("");
    setSortBy("latest");
  };

  return (
    <div className="max-w-7xl mx-auto py-6 space-y-6">
      <PageHeader
        title="Tech & Jobs News"
        description="Stay updated with latest tech news, job opportunities, and industry trends"
        actions={
          <Button
            variant="outline"
            className="gap-2"
            disabled={isFetching}
            onClick={async () => {
              await refetch();
            }}
          >
            <RefreshCw
              className={isFetching ? "h-4 w-4 animate-spin" : "h-4 w-4"}
            />
            Refresh
          </Button>
        }
      />

      {data?.fallback && (
        <div
          role="status"
          className="rounded-lg border border-amber-200 dark:border-amber-800/60 bg-amber-50 dark:bg-amber-950/50 p-4 text-sm text-amber-900 dark:text-amber-300"
        >
          The live feed is unavailable. These are illustrative examples, not
          current news. Use Refresh to try again.
        </div>
      )}
      <Card>
        <CardContent className="p-6 grid grid-cols-1 lg:grid-cols-[1fr_12rem_10rem] gap-4">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search news, companies, tech stack..."
          />
          <FilterSelect
            value={category}
            onChange={setCategory}
            options={CATEGORY_OPTIONS}
            placeholder="Category"
          />
          <FilterSelect
            value={sortBy}
            onChange={setSortBy}
            options={SORT_OPTIONS}
            placeholder="Sort by"
          />
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }, (_, i) => (
            <NewsCardSkeleton key={i} />
          ))}
        </div>
      ) : news.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No news found matching your criteria.</p>
          <p className="text-sm mb-4">
            Try adjusting your filters or search terms.
          </p>
          <Button variant="outline" onClick={clearFilters}>
            Clear Filters
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          <AnimatePresence>
            {news.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, delay: Math.min(index, 6) * 0.05 }}
              >
                <NewsCard
                  item={item}
                  bookmarked={bookmarks.isBookmarked(item.id)}
                  onToggleBookmark={() => bookmarks.toggle(item.id)}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
