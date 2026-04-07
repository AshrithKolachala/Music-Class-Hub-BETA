import { format } from "date-fns";
import { CalendarDays, Video, Music } from "lucide-react";
import { AppLayout } from "@/components/layout/app-layout";
import { useAppClasses } from "@/hooks/use-app-classes";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "wouter";

export default function StudentClasses() {
  const { classes } = useAppClasses();

  const sortedClasses = [...classes].sort((a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime());
  
  const upcomingClasses = sortedClasses.filter(c => c.status === "scheduled" || c.status === "ongoing").reverse();
  const pastClasses = sortedClasses.filter(c => c.status === "completed" || c.status === "cancelled");

  return (
    <AppLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold">My Classes</h1>
        <p className="text-muted-foreground mt-2">Your complete lesson history and schedule</p>
      </div>

      <div className="space-y-10">
        <section>
          <h2 className="text-xl font-display font-semibold mb-4 border-b border-border/50 pb-2">Upcoming & Ongoing</h2>
          <div className="grid gap-4">
            {upcomingClasses.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground bg-card/30 rounded-xl border border-dashed border-border/50">
                No upcoming classes.
              </div>
            ) : (
              upcomingClasses.map((c) => (
                <Card key={c.id} className={`bg-card hover:border-primary/30 transition-colors overflow-hidden relative ${c.status === 'ongoing' ? 'border-primary/50 shadow-md shadow-primary/5' : ''}`}>
                  {c.status === 'ongoing' && <div className="absolute top-0 left-0 w-1 h-full bg-primary" />}
                  <CardContent className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-6">
                      <div className="w-20 text-center shrink-0">
                        <div className="text-sm font-medium text-primary uppercase">
                          {format(new Date(c.scheduledAt), "MMM")}
                        </div>
                        <div className="text-3xl font-bold text-foreground">
                          {format(new Date(c.scheduledAt), "d")}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {format(new Date(c.scheduledAt), "h:mm a")}
                        </div>
                      </div>
                      <div className="w-px h-16 bg-border/50 hidden md:block" />
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-xl font-bold text-foreground">{c.title}</h3>
                          {c.status === 'ongoing' && (
                            <span className="px-2 py-0.5 rounded-full bg-primary/20 text-primary text-[10px] font-bold uppercase tracking-wider">Live</span>
                          )}
                        </div>
                        <p className="text-sm text-foreground/80 font-medium">{c.topic} • {c.durationMinutes}m</p>
                        {c.description && <p className="text-sm text-muted-foreground mt-2 line-clamp-1">{c.description}</p>}
                      </div>
                    </div>
                    
                    <Link href={`/call/${c.id}`} className="w-full md:w-auto mt-2 md:mt-0">
                      <Button className={`w-full gap-2 shadow-lg ${c.status === 'ongoing' ? 'animate-pulse shadow-primary/40' : 'shadow-primary/20'}`}>
                        <Video className="w-4 h-4" />
                        Join Class
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </section>

        <section>
          <h2 className="text-xl font-display font-semibold mb-4 border-b border-border/50 pb-2">Past Classes</h2>
          <div className="grid gap-4">
            {pastClasses.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                No past classes yet.
              </div>
            ) : (
              pastClasses.map((c) => (
                <Card key={c.id} className="bg-background/50 border-border/50 opacity-80 hover:opacity-100 transition-opacity">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-card border border-border flex items-center justify-center shrink-0">
                        <Music className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground flex items-center gap-2">
                          {c.title}
                          <span className={`text-[10px] px-2 py-0.5 rounded-full border ${c.status === 'cancelled' ? 'border-destructive/30 text-destructive' : 'border-border text-muted-foreground'}`}>
                            {c.status}
                          </span>
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(c.scheduledAt), "MMM d, yyyy")} • {c.topic}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </section>
      </div>
    </AppLayout>
  );
}
