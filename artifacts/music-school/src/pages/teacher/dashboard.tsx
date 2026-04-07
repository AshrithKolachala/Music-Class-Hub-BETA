import { motion } from "framer-motion";
import { format } from "date-fns";
import { Users, CalendarDays, Bell, PlayCircle } from "lucide-react";
import { AppLayout } from "@/components/layout/app-layout";
import { useAppClasses } from "@/hooks/use-app-classes";
import { useAppStudents } from "@/hooks/use-app-students";
import { useAppAnnouncements } from "@/hooks/use-app-announcements";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function TeacherDashboard() {
  const { classes } = useAppClasses();
  const { students } = useAppStudents();
  const { announcements } = useAppAnnouncements();

  const todayClasses = classes.filter(c => {
    const classDate = new Date(c.scheduledAt);
    const today = new Date();
    return classDate.toDateString() === today.toDateString() && c.status !== "cancelled";
  }).sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());

  const upcomingClass = todayClasses.find(c => c.status === "scheduled" && new Date(c.scheduledAt).getTime() > Date.now());

  return (
    <AppLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-display font-bold">Overview</h1>
          <p className="text-muted-foreground mt-2">Welcome back to the studio. Here's your day at a glance.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-gradient-to-br from-card to-card/50 border-border/50">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Students</p>
                <p className="text-2xl font-bold">{students.length}</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-card to-card/50 border-border/50">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                <CalendarDays className="w-6 h-6 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Classes Today</p>
                <p className="text-2xl font-bold">{todayClasses.length}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-card to-card/50 border-border/50">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center border border-accent/20">
                <Bell className="w-6 h-6 text-accent" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Announcements</p>
                <p className="text-2xl font-bold">{announcements.length}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Today's Schedule */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-display font-semibold">Today's Schedule</h2>
              <Link href="/teacher/classes">
                <Button variant="outline" size="sm">View All</Button>
              </Link>
            </div>
            
            {upcomingClass && (
              <Card className="bg-primary/5 border-primary/30 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                <CardContent className="p-6 relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                  <div>
                    <span className="inline-block px-3 py-1 rounded-full bg-primary/20 text-primary text-xs font-medium mb-3">
                      Up Next
                    </span>
                    <h3 className="text-2xl font-bold text-foreground">{upcomingClass.title}</h3>
                    <p className="text-muted-foreground mt-1">{upcomingClass.topic} • {upcomingClass.durationMinutes} mins</p>
                    <p className="text-foreground font-medium mt-3">
                      {format(new Date(upcomingClass.scheduledAt), "h:mm a")}
                    </p>
                  </div>
                  <Link href={`/call/${upcomingClass.id}`}>
                    <Button size="lg" className="w-full md:w-auto shadow-lg shadow-primary/20 gap-2">
                      <PlayCircle className="w-5 h-5" />
                      Start Class
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}

            <div className="space-y-4">
              {todayClasses.length === 0 ? (
                <div className="p-8 text-center border border-dashed rounded-xl border-border/50 text-muted-foreground bg-card/30">
                  No classes scheduled for today.
                </div>
              ) : (
                todayClasses.map(c => (
                  <motion.div 
                    key={c.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-4 rounded-xl border flex items-center justify-between ${c.id === upcomingClass?.id ? 'border-primary/50 bg-primary/5' : 'border-border/50 bg-card hover:border-border transition-colors'}`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-16 text-center shrink-0">
                        <p className="text-lg font-bold text-foreground">{format(new Date(c.scheduledAt), "h:mm")}</p>
                        <p className="text-xs text-muted-foreground uppercase">{format(new Date(c.scheduledAt), "a")}</p>
                      </div>
                      <div className="w-px h-10 bg-border/50" />
                      <div>
                        <p className="font-semibold text-foreground">{c.title}</p>
                        <p className="text-sm text-muted-foreground">{c.topic}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${
                        c.status === 'completed' ? 'border-green-500/30 text-green-500 bg-green-500/10' :
                        c.status === 'ongoing' ? 'border-blue-500/30 text-blue-500 bg-blue-500/10' :
                        'border-border text-muted-foreground'
                      }`}>
                        {c.status}
                      </span>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>

          {/* Quick Actions & Recent Announcements */}
          <div className="space-y-8">
            <Card className="border-border/50 bg-card">
              <CardContent className="p-6">
                <h2 className="text-lg font-display font-semibold mb-4">Quick Actions</h2>
                <div className="space-y-3">
                  <Link href="/teacher/classes">
                    <Button variant="secondary" className="w-full justify-start">Schedule a Class</Button>
                  </Link>
                  <Link href="/teacher/students">
                    <Button variant="outline" className="w-full justify-start">Add Student</Button>
                  </Link>
                  <Link href="/teacher/announcements">
                    <Button variant="outline" className="w-full justify-start">Post Announcement</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-display font-semibold">Pinned Info</h2>
              </div>
              <div className="space-y-4">
                {announcements.filter(a => a.isPinned).map(a => (
                  <div key={a.id} className="p-4 rounded-xl bg-card border border-primary/20 relative">
                    <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-primary" />
                    <p className="font-medium pr-6">{a.title}</p>
                    <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{a.content}</p>
                  </div>
                ))}
                {announcements.filter(a => a.isPinned).length === 0 && (
                  <p className="text-sm text-muted-foreground italic">No pinned announcements.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
