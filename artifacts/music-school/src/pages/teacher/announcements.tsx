import { useState } from "react";
import { format } from "date-fns";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Bell, Plus, Trash2, Pin } from "lucide-react";
import { AppLayout } from "@/components/layout/app-layout";
import { useAppAnnouncements } from "@/hooks/use-app-announcements";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";

const announcementSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
  isPinned: z.boolean().default(false),
});

export default function TeacherAnnouncements() {
  const { announcements, createAnnouncement, deleteAnnouncement } = useAppAnnouncements();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof announcementSchema>>({
    resolver: zodResolver(announcementSchema),
    defaultValues: { isPinned: false }
  });

  const onSubmit = async (data: z.infer<typeof announcementSchema>) => {
    try {
      await createAnnouncement({ data });
      toast({ title: "Announcement posted successfully" });
      setIsDialogOpen(false);
      form.reset();
    } catch (error) {
      toast({ title: "Error posting announcement", variant: "destructive" });
    }
  };

  return (
    <AppLayout>
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold">Announcements</h1>
          <p className="text-muted-foreground mt-2">Broadcast updates and materials to all your students</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="shadow-lg shadow-primary/20 gap-2 shrink-0">
              <Plus className="w-4 h-4" /> New Announcement
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Announcement</DialogTitle>
            </DialogHeader>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input placeholder="e.g. Winter Recital Information" {...form.register("title")} />
              </div>
              <div className="space-y-2">
                <Label>Message</Label>
                <Textarea rows={5} placeholder="Write your announcement here..." {...form.register("content")} />
              </div>
              <div className="flex items-center space-x-2 pt-2">
                <Checkbox 
                  id="isPinned" 
                  checked={form.watch("isPinned")}
                  onCheckedChange={(checked) => form.setValue("isPinned", checked as boolean)}
                />
                <Label htmlFor="isPinned" className="font-normal cursor-pointer">
                  Pin to top of student dashboards
                </Label>
              </div>
              <Button type="submit" className="w-full mt-4" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Posting..." : "Post Announcement"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-6 max-w-4xl">
        {announcements.length === 0 ? (
          <div className="p-12 text-center border border-dashed rounded-xl border-border/50 text-muted-foreground bg-card/30">
            <Bell className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
            <p className="text-lg font-medium">No announcements yet</p>
          </div>
        ) : (
          announcements.sort((a,b) => {
            if (a.isPinned && !b.isPinned) return -1;
            if (!a.isPinned && b.isPinned) return 1;
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          }).map((a) => (
            <Card key={a.id} className={`bg-card overflow-hidden transition-all ${a.isPinned ? 'border-primary/50 shadow-md shadow-primary/5' : 'border-border/50'}`}>
              {a.isPinned && <div className="h-1 w-full bg-gradient-to-r from-primary to-primary/50" />}
              <CardContent className="p-6">
                <div className="flex justify-between items-start gap-4 mb-3">
                  <div className="flex items-center gap-2">
                    {a.isPinned && <Pin className="w-4 h-4 text-primary fill-primary/20" />}
                    <h3 className="text-xl font-bold text-foreground">{a.title}</h3>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0"
                    onClick={() => {
                      if(confirm("Delete this announcement?")) {
                        deleteAnnouncement({ announcementId: a.id });
                      }
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-4">
                  {format(new Date(a.createdAt), "MMM d, yyyy • h:mm a")}
                </div>
                <div className="prose prose-invert max-w-none text-foreground/90">
                  {a.content.split('\n').map((paragraph, i) => (
                    <p key={i} className="mb-2 last:mb-0">{paragraph}</p>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </AppLayout>
  );
}
