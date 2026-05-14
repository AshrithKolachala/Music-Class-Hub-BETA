import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Megaphone, Plus, Trash2 } from "lucide-react";
import { AppLayout } from "@/components/layout/app-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { getUpdates, createUpdate, deleteUpdate, type Update } from "@/lib/db/updates";
import { getStudents, type Student } from "@/lib/db/students";

export default function TeacherUpdates() {
  const [updates, setUpdates] = useState<Update[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [filterStudentId, setFilterStudentId] = useState<string>("all");
  const [selectedStudentId, setSelectedStudentId] = useState<string>("");
  const { toast } = useToast();
  const form = useForm({ defaultValues: { title: "", content: "" } });

  const fetchUpdates = async () => {
    const data = await getUpdates(filterStudentId !== "all" ? filterStudentId : undefined);
    setUpdates(data);
  };

  useEffect(() => { getStudents().then(d => setStudents(d)).catch(() => {}); }, []);
  useEffect(() => { fetchUpdates(); }, [filterStudentId]);

  const onSubmit = async (data: any) => {
    if (!selectedStudentId) { toast({ title: "Please select a student", variant: "destructive" }); return; }
    const student = students.find(s => s.id === selectedStudentId);
    if (!student) return;
    try {
      await createUpdate({
        studentId: selectedStudentId,
        studentName: student.name,
        title: data.title,
        content: data.content,
      });
      toast({ title: "Update sent" });
      setIsOpen(false);
      form.reset();
      setSelectedStudentId("");
      fetchUpdates();
    } catch {
      toast({ title: "Error sending update", variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this update?")) return;
    await deleteUpdate(id);
    fetchUpdates();
  };

  return (
    <AppLayout>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold">Updates</h1>
          <p className="text-muted-foreground mt-2">Send personal updates to individual students</p>
        </div>
        <Button onClick={() => setIsOpen(true)} className="gap-2 shadow-lg shadow-primary/20">
          <Plus className="w-4 h-4" /> New Update
        </Button>
      </div>

      <div className="mb-6 flex items-center gap-3">
        <Label className="text-sm text-muted-foreground shrink-0">Filter by student:</Label>
        <Select value={filterStudentId} onValueChange={setFilterStudentId}>
          <SelectTrigger className="w-[220px]">
            <SelectValue placeholder="All students" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Students</SelectItem>
            {students.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4">
        {updates.length === 0 ? (
          <div className="p-12 text-center border border-dashed rounded-xl border-border/50 text-muted-foreground bg-card/30 flex flex-col items-center">
            <Megaphone className="w-12 h-12 mb-4 text-muted-foreground/50" />
            <p className="text-lg font-medium">No updates sent yet</p>
          </div>
        ) : (
          updates.map(u => (
            <Card key={u.id} className="bg-card border-border/50 hover:border-primary/20 transition-colors">
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className="font-bold text-foreground">{u.title}</span>
                      <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">For: {u.studentName}</span>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">{u.content}</p>
                    <p className="text-xs text-muted-foreground mt-3">{format(new Date(u.createdAt), "MMM d, yyyy · h:mm a")}</p>
                  </div>
                  <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive shrink-0" onClick={() => handleDelete(u.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>Send Update to Student</DialogTitle>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label>Student</Label>
              <Select value={selectedStudentId} onValueChange={setSelectedStudentId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select student..." />
                </SelectTrigger>
                <SelectContent>
                  {students.map(s => <SelectItem key={s.id} value={s.id}>{s.name} ({s.studentId})</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Title</Label>
              <Input placeholder="e.g. Practice reminder" {...form.register("title", { required: true })} />
            </div>
            <div className="space-y-2">
              <Label>Message</Label>
              <Textarea rows={4} placeholder="Write your update..." {...form.register("content", { required: true })} />
            </div>
            <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "Sending..." : "Send Update"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
