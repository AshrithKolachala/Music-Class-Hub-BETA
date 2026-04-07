import { useState, useEffect } from "react";
import { Megaphone } from "lucide-react";
import { AppLayout } from "@/components/layout/app-layout";
import { Card, CardContent } from "@/components/ui/card";
import { format } from "date-fns";

const BASE = import.meta.env.BASE_URL;

type Update = { id: number; title: string; content: string; createdAt: string };

export default function StudentUpdates() {
  const [updates, setUpdates] = useState<Update[]>([]);

  useEffect(() => {
    fetch(`${BASE}api/updates`, { credentials: "include" })
      .then(r => r.json()).then(setUpdates).catch(() => {});
  }, []);

  return (
    <AppLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold">Updates</h1>
        <p className="text-muted-foreground mt-2">Personal messages from your teacher</p>
      </div>

      <div className="grid gap-4">
        {updates.length === 0 ? (
          <div className="p-12 text-center border border-dashed rounded-xl border-border/50 text-muted-foreground bg-card/30 flex flex-col items-center">
            <Megaphone className="w-12 h-12 mb-4 text-muted-foreground/50" />
            <p className="text-lg font-medium">No updates yet</p>
            <p className="text-sm mt-1">Your teacher will post personal updates here.</p>
          </div>
        ) : (
          [...updates].reverse().map(u => (
            <Card key={u.id} className="bg-card border-border/50 hover:border-primary/20 transition-colors">
              <CardContent className="p-5">
                <h3 className="font-bold text-foreground text-lg mb-2">{u.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{u.content}</p>
                <p className="text-xs text-muted-foreground mt-3">{format(new Date(u.createdAt), "MMM d, yyyy · h:mm a")}</p>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </AppLayout>
  );
}
