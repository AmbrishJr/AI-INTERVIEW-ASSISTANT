import { Button } from "@/components/ui/button";
export default function NewsletterSection() {
  return (
    <section className="max-w-7xl mx-auto px-6 py-12 flex flex-wrap items-center justify-between gap-6">
      <div>
        <h2 className="text-lg font-semibold">Keep in touch</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Email updates aren’t available yet. Explore the news feed for now.
        </p>
      </div>
      <Button variant="outline" disabled>
        Newsletter coming soon
      </Button>
    </section>
  );
}
