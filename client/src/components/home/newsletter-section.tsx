import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toastSuccess } from "@/hooks/use-toast";
import { Reveal, Section } from "./section";

export default function NewsletterSection() {
  const [email, setEmail] = useState("");

  const subscribe = (e: FormEvent) => {
    e.preventDefault();
    toastSuccess("Subscribed", "Thank you for subscribing!");
    setEmail("");
  };

  return (
    <Section>
      <Reveal className="text-center">
        <Card className="max-w-2xl mx-auto">
          <CardContent className="p-8">
            <h2 className="text-2xl font-bold mb-4">Stay Updated</h2>
            <p className="text-muted-foreground mb-6">Get the latest tech trends and AI insights delivered to your inbox</p>
            <form onSubmit={subscribe} className="flex flex-col sm:flex-row gap-4">
              <Input
                type="email"
                placeholder="Enter your email"
                aria-label="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="flex-1"
              />
              <Button type="submit">Subscribe</Button>
            </form>
          </CardContent>
        </Card>
      </Reveal>
    </Section>
  );
}
