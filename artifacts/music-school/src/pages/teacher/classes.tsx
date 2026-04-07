import { useState } from "react";
import { format } from "date-fns";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { CalendarDays, Plus, MoreVertical, Video, Trash2, Edit2 } from "lucide-react";
import { AppLayout } from "@/components/layout/app-layout";
import { useAppClasses } from "@/hooks/use-app-classes";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link } from "wouter";
import { ClassStatus } from "@workspace/api-client-react";

const classSchema = z.object({
  title: z.string().min(1, "Title is required"),
  topic: z.string().min(1, "Topic is required"),
  scheduledAt: z.string().min(1, "Date and time are required"),
  durationMinutes: z.coerce.number().min(15).max(240),
  description: z.string().optional(),
});

export default function TeacherClasses() {
  const { classes, createClass, deleteClass, updateClass } = useAppClasses();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof classSchema>>({
    resolver: zodResolver(classSchema),
    defaultValues: { durationMinutes: 60 }
  });

  const onSubmit = async (data: z.infer<typeof classSchema>) => {
    try {
      const isoDate = new Date(data.scheduledAt).toISOString();
      if (editingId) {
        await updateClass({ classId: editingId, data: { ...data, scheduledAt: isoDate } });
        toast({ title: "Class updated successfully" });
      } else {
        await createClass({ data: { ...data, scheduledAt: isoDate } });
        toast({ title: "Class scheduled successfully" });
      }
      setIsDialogOpen(false);
      form.reset();
      setEditingId(null);
    } catch (error) {
      toast({ title: "Error saving class", variant: "destructive" });
    }
  };

  const handleEdit = (c: any) => {
    // format to datetime-local expected format: YYYY-MM-DDTHH:mm
    const dateStr = new Date(c.scheduledAt).toISOString().slice(0, 16);
    form.reset({
      title: c.title,
      topic: c.topic,
      scheduledAt: dateStr,
      durationMinutes: c.durationMinutes,
      description: c.description || ""
    });
    setEditingId(c.id);
    setIsDialogOpen(true);
  };

  const handleStatusChange = async (id: number, status: ClassStatus) => {
    await updateClass({ classId: id, data: { status } });
    toast({ title: `Status updated to ${status}` });
  };

  return (
    <AppLayout>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold">Class Schedule</h1>
          <p className="text-muted-foreground mt-2">Manage your upcoming lessons</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) {
            form.reset();
            setEditingId(null);
          }
        }}>
          <DialogTrigger asChild>
            <Button className="shadow-lg shadow-primary/20 gap-2">
              <Plus className="w-4 h-4" /> Schedule Class
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>{editingId ? "Edit Class" : "Schedule New Class"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input placeholder="e.g. Advanced Piano Masterclass" {...form.register("title")} />
                {form.formState.errors.title && <p className="text-xs text-destructive">{form.formState.errors.title.message}</p>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Date & Time</Label>
                  <Input type="datetime-local" {...form.register("scheduledAt")} />
                </div>
                <div className="space-y-2">
                  <Label>Duration (mins)</Label>
                  <Input type="number" {...form.register("durationMinutes")} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Instrument / Topic</Label>
                <Input placeholder="e.g. Piano - Jazz Improvisation" {...form.register("topic")} />
              </div>
              <div className="space-y-2">
                <Label>Description (Optional)</Label>
                <Textarea placeholder="Any specific notes or materials to bring..." {...form.register("description")} />
              </div>
              <Button type="submit" className="w-full mt-4" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Saving..." : "Save Class"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {classes.length === 0 ? (
          <div className="p-12 text-center border border-dashed rounded-xl border-border/50 text-muted-foreground bg-card/30 flex flex-col items-center">
            <CalendarDays className="w-12 h-12 mb-4 text-muted-foreground/50" />
            <p className="text-lg font-medium">No classes scheduled</p>
            <p className="text-sm mt-1">Click the button above to schedule your first class.</p>
          </div>
        ) : (
          classes.map((c) => (
            <Card key={c.id} className="bg-card hover:border-primary/30 transition-colors group overflow-hidden relative">
              {c.status === 'ongoing' && <div className="absolute top-0 left-0 w-1 h-full bg-blue-500" />}
              {c.status === 'completed' && <div className="absolute top-0 left-0 w-1 h-full bg-green-500" />}
              <CardContent className="p-0">
                <div className="flex flex-col md:flex-row md:items-center p-6 gap-6">
                  {/* Time Box */}
                  <div className="flex flex-row md:flex-col items-center md:items-start gap-3 md:gap-0 min-w-[120px]">
                    <div className="text-sm font-medium text-primary">
                      {format(new Date(c.scheduledAt), "MMM d, yyyy")}
                    </div>
                    <div className="text-2xl font-bold text-foreground mt-1">
                      {format(new Date(c.scheduledAt), "h:mm")} <span className="text-sm text-muted-foreground font-normal">{format(new Date(c.scheduledAt), "a")}</span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1 bg-secondary px-2 py-0.5 rounded-sm">
                      {c.durationMinutes} mins
                    </div>
                  </div>

                  {/* Divider hidden on mobile */}
                  <div className="hidden md:block w-px h-16 bg-border/50 mx-2" />

                  {/* Info */}
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-foreground">{c.title}</h3>
                    <p className="text-sm text-muted-foreground font-medium mt-1">{c.topic}</p>
                    {c.description && <p className="text-sm text-muted-foreground mt-2 line-clamp-1">{c.description}</p>}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-3 w-full md:w-auto justify-end">
                    <div className="mr-auto md:mr-4">
                      <Select 
                        value={c.status} 
                        onValueChange={(val) => handleStatusChange(c.id, val as ClassStatus)}
                      >
                        <SelectTrigger className="w-[130px] h-9 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="scheduled">Scheduled</SelectItem>
                          <SelectItem value="ongoing">Ongoing</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Link href={`/call/${c.id}`}>
                      <Button variant={c.status === 'ongoing' ? "default" : "secondary"} size="sm" className="gap-2 shrink-0">
                        <Video className="w-4 h-4" />
                        Join
                      </Button>
                    </Link>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="shrink-0">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(c)}>
                          <Edit2 className="w-4 h-4 mr-2" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => {
                          if (confirm("Are you sure you want to delete this class?")) {
                            deleteClass({ classId: c.id });
                          }
                        }} className="text-destructive">
                          <Trash2 className="w-4 h-4 mr-2" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </AppLayout>
  );
}
