import { motion } from "framer-motion";
import { BookOpen, Brain, ExternalLink, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ResearchPaper } from "@/data/projects";

export default function ResearchPapers({
  papers,
}: {
  papers: ResearchPaper[];
}) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {papers.map((paper, index) => (
          <motion.div
            key={paper.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <PaperCard paper={paper} />
          </motion.div>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            AI Research Insights
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-purple-50 dark:bg-purple-950/50 rounded-lg">
            <h4 className="font-semibold text-purple-800 dark:text-purple-300 mb-2">
              🔥 Trending Research Areas
            </h4>
            <p className="text-sm text-purple-700 dark:text-purple-300">
              Vision Transformers and Quantum ML are dominating recent
              publications with 40%+ growth.
            </p>
          </div>
          <div className="p-4 bg-blue-50 dark:bg-blue-950/50 rounded-lg">
            <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">
              📊 Industry Applications
            </h4>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              Healthcare and finance sectors are leading in AI research adoption
              and funding.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function PaperCard({ paper }: { paper: ResearchPaper }) {
  return (
    <Card className="h-full">
      <CardContent className="p-6">
        <div className="flex items-center gap-2 mb-3">
          <BookOpen className="h-4 w-4 text-purple-600 dark:text-purple-300" />
          <Badge
            variant="outline"
            className="bg-purple-100 dark:bg-purple-950/50 text-purple-800 dark:text-purple-300"
          >
            {paper.category.toUpperCase()}
          </Badge>
          <span className="flex items-center gap-1 text-sm text-muted-foreground ml-auto">
            <Star className="h-3 w-3" />
            {paper.citations} citations
          </span>
        </div>

        <h3 className="text-lg font-semibold mb-2">{paper.title}</h3>

        <div className="text-sm text-muted-foreground mb-3">
          <div>{paper.authors.join(", ")}</div>
          <div>{paper.institution}</div>
          <div>{new Date(paper.publishDate).toLocaleDateString()}</div>
        </div>

        <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
          {paper.abstract}
        </p>

        {paper.keyFindings.length > 0 && (
          <div className="mb-4">
            <div className="text-sm font-medium mb-2">🔬 Key Findings</div>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc pl-5 marker:text-purple-600 dark:marker:text-purple-300">
              {paper.keyFindings.slice(0, 2).map((finding) => (
                <li key={finding}>{finding}</li>
              ))}
            </ul>
          </div>
        )}

        {paper.practicalApplications.length > 0 && (
          <div className="mb-4">
            <div className="text-sm font-medium mb-2">💡 Applications</div>
            <div className="flex flex-wrap gap-1">
              {paper.practicalApplications.slice(0, 3).map((app) => (
                <Badge key={app} variant="secondary" className="text-xs">
                  {app}
                </Badge>
              ))}
            </div>
          </div>
        )}

        <Button size="sm" asChild>
          <a href={paper.url} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="h-4 w-4 mr-1" />
            View Paper
          </a>
        </Button>
      </CardContent>
    </Card>
  );
}
