import { motion } from "framer-motion";
import { format } from "date-fns";
import { CalendarDays, Bell, PlayCircle, Music } from "lucide-react";
import { AppLayout } from "@/components/layout/app-layout";
import { useAppClasses } from "@/hooks/use-app-classes";
import { useAppAnnouncements } from "@/hooks/use-app-announcements";
import { useAppAuth } from "@/hooks/use-app-auth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function StudentDashboard() {
  const { user } = useAppAuth();
  const { classes } = useAppClasses();
  const { announcements } = useAppAnnouncements();

  // Sort upcoming classes
  const upcomingClasses = classes
    .filter(c => c.status === "scheduled" && new Date(c.scheduledAt).getTime() > Date.now() - (60 * 60 * 1000)) // Include classes that just started
    .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());

  const nextClass = upcomingClasses[0];

  const pinnedAnnouncements = announcements.filter(a => a.isPinned);
  const recentAnnouncements = announcements.filter(a => !a.isPinned).slice(0, 3);

  return (
    <AppLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-display font-bold">Welcome back, {user?.name?.split(' ')[0]}</h1>
          <p className="text-muted-foreground mt-2">Ready for your next practice session?</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Area: Next Class & Schedule */}
          <div className="lg:col-span-2 space-y-8">
            {nextClass ? (
              <Card className="bg-gradient-to-br from-primary/10 via-card to-card border-primary/30 relative overflow-hidden shadow-xl shadow-primary/5">
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/20 rounded-full blur-[80px] pointer-events-none" />
                <CardContent className="p-8 relative z-10">
                  <div className="flex items-center gap-2 mb-6">
                    <span className="flex h-3 w-3 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
                    </span>
                    <span className="text-sm font-medium text-primary uppercase tracking-wider">Up Next</span>
                  </div>
                  
                  <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                      <h2 className="text-3xl font-bold text-foreground mb-2">{nextClass.title}</h2>
                      <p className="text-lg text-muted-foreground mb-4">{nextClass.topic} • {nextClass.durationMinutes} mins</p>
                      
                      <div className="flex items-center gap-4 text-foreground">
                        <div className="bg-background/50 backdrop-blur-sm border border-border px-4 py-2 rounded-lg">
                          <p className="text-sm text-muted-foreground mb-1">Date</p>
                          <p className="font-semibold">{format(new Date(nextClass.scheduledAt), "MMMM do, yyyy")}</p>
                        </div>
                        <div className="bg-background/50 backdrop-blur-sm border border-border px-4 py-2 rounded-lg">
                          <p className="text-sm text-muted-foreground mb-1">Time</p>
                          <p className="font-semibold">{format(new Date(nextClass.scheduledAt), "h:mm a")}</p>
                        </div>
                      </div>
                    </div>
                    
                    <Link href={`/call/${nextClass.id}`}>
                      <Button size="lg" className="w-full md:w-auto shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all hover:-translate-y-1 gap-2 h-14 px-8 text-lg rounded-xl">
                        <PlayCircle className="w-6 h-6" />
                        Join Class
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="bg-card border-dashed border-border/60">
                <CardContent className="p-12 text-center flex flex-col items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <Music className="w-8 h-8 text-primary" />
                  </div>
                  <h2 className="text-xl font-bold mb-2">No upcoming classes</h2>
                  <p className="text-muted-foreground">Your teacher hasn't scheduled your next class yet. Keep practicing!</p>
                </CardContent>
              </Card>
            )}

            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-display font-semibold">Future Classes</h3>
                <Link href="/student/classes" className="text-primary hover:underline text-sm font-medium">View Calendar</Link>
              </div>
              <div className="space-y-3">
                {upcomingClasses.slice(1, 4).map(c => (
                  <Card key={c.id} className="bg-background border-border/50 hover:border-border transition-colors">
                    <CardContent className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-14 text-center shrink-0">
                          <p className="text-sm text-muted-foreground">{format(new Date(c.scheduledAt), "MMM")}</p>
                          <p className="text-xl font-bold text-foreground">{format(new Date(c.scheduledAt), "d")}</p>
                        </div>
                        <div className="w-px h-10 bg-border/50" />
                        <div>
                          <p className="font-semibold">{c.title}</p>
                          <p className="text-sm text-muted-foreground">{format(new Date(c.scheduledAt), "h:mm a")} • {c.durationMinutes}m</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {upcomingClasses.length <= 1 && (
                  <p className="text-muted-foreground text-sm italic">No other upcoming classes scheduled.</p>
                )}
              </div>
            </div>
          </div>

          {/* Right Sidebar: Announcements */}
          <div>
            <h3 className="text-xl font-display font-semibold mb-4 flex items-center gap-2">
              <Bell className="w-5 h-5 text-primary" />
              Notice Board
            </h3>
            
            <div className="space-y-4">
              {pinnedAnnouncements.map(a => (
                <Card key={a.id} className="bg-primary/5 border-primary/30 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
                  <CardContent className="p-5">
                    <h4 className="font-bold text-foreground mb-2 pr-6">{a.title}</h4>
                    <p className="text-sm text-foreground/80 line-clamp-3">{a.content}</p>
                  </CardContent>
                </Card>
              ))}

              {recentAnnouncements.map(a => (
                <Card key={a.id} className="bg-card border-border/50">
                  <CardContent className="p-5">
                    <div className="text-xs text-primary mb-1 font-medium">{format(new Date(a.createdAt), "MMM d")}</div>
                    <h4 className="font-semibold text-foreground mb-1">{a.title}</h4>
                    <p className="text-sm text-muted-foreground line-clamp-2">{a.content}</p>
                  </CardContent>
                </Card>
              ))}

              {announcements.length === 0 && (
                <p className="text-muted-foreground text-sm italic">All quiet on the notice board.</p>
              )}
              
              {announcements.length > 0 && (
                <Link href="/student/announcements" className="block text-center text-sm font-medium text-primary hover:underline mt-4">
                  View all announcements
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
