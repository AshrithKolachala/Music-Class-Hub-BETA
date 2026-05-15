import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { ClipboardList, Plus, Trash2 } from "lucide-react";
import { AppLayout } from "@/components/layout/app-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { getClassLogs, createClassLog, deleteClassLog, type ClassLog } from "@/lib/db/class-logs";
import { getStudents, type Student } from "@/lib/db/students";
import { createNotification } from "@/lib/db/notifications";

export default function TeacherClassLogs() {
  const [logs, setLogs] = useState<ClassLog[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [filterStudentId, setFilterStudentId] = useState<string>("all");
  const [selectedStudentId, setSelectedStudentId] = useState<string>("");
  const { toast } = useToast();
  const form = useForm({ defaultValues: { classDate: "", timeStarted: "", timeEnded: "", timeTaken: "", whatTaught: "", homework: "" } });

  const fetchLogs = async () => {
    const data = await getClassLogs(filterStudentId !== "all" ? filterStudentId : undefined);
    setLogs(data);
  };

  const fetchStudents = async () => {
    const data = await getStudents();
    setStudents(data);
  };

  useEffect(() => { fetchStudents(); }, []);
  useEffect(() => { fetchLogs(); }, [filterStudentId]);

  const onSubmit = async (data: any) => {
    if (!selectedStudentId) { toast({ title: "Please select a student", variant: "destructive" }); return; }
    const student = students.find(s => s.id === selectedStudentId);
    if (!student) return;
    try {
      await createClassLog({
        studentId: selectedStudentId,
        studentName: student.name,
        studentCode: student.studentId,
        classDate: data.classDate,
        timeStarted: data.timeStarted,
        timeEnded: data.timeEnded,
        timeTaken: data.timeTaken,
        whatTaught: data.whatTaught,
        homework: data.homework,
      });

      await createNotification({
        studentId: selectedStudentId,
        type: "class_log",
        title: `Class log added — ${data.classDate}`,
        message: `What was covered: ${data.whatTaught}${data.homework ? `. Homework: ${data.homework}` : ""}`,
      });

      toast({ title: "Class log added" });
      setIsOpen(false);
      form.reset();
      setSelectedStudentId("");
      fetchLogs();
    } catch {
      toast({ title: "Error adding log", variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this log?")) return;
    await deleteClassLog(id);
    fetchLogs();
  };

  return (
    <AppLayout>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold">Class Logs</h1>
          <p className="text-muted-foreground mt-2">Record what was taught in each session</p>
        </div>
        <Button onClick={() => setIsOpen(true)} className="gap-2 shadow-lg shadow-primary/20">
          <Plus className="w-4 h-4" /> Add Log
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
        {logs.length === 0 ? (
          <div className="p-12 text-center border border-dashed rounded-xl border-border/50 text-muted-foreground bg-card/30 flex flex-col items-center">
            <ClipboardList className="w-12 h-12 mb-4 text-muted-foreground/50" />
            <p className="text-lg font-medium">No class logs yet</p>
          </div>
        ) : (
          logs.map(log => (
            <Card key={log.id} className="bg-card border-border/50 hover:border-primary/20 transition-colors">
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="font-bold text-lg">{log.studentName}</span>
                      <span className="text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded">{log.studentCode}</span>
                      <span className="text-sm text-primary font-medium">{log.classDate}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-3 text-sm text-muted-foreground">
                      <span>Start: <span className="text-foreground font-medium">{log.timeStarted}</span></span>
                      <span>End: <span className="text-foreground font-medium">{log.timeEnded}</span></span>
                      <span>Duration: <span className="text-foreground font-medium">{log.timeTaken}</span></span>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">What was taught</p>
                      <p className="text-sm text-foreground">{log.whatTaught}</p>
                    </div>
                    {log.homework && (
                      <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Homework</p>
                        <p className="text-sm text-foreground">{log.homework}</p>
                      </div>
                    )}
                  </div>
                  <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive shrink-0" onClick={() => handleDelete(log.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle>Add Class Log</DialogTitle>
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
              <Label>Class Date</Label>
              <Input type="date" {...form.register("classDate", { required: true })} />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-2">
                <Label>Time Started</Label>
                <Input type="time" {...form.register("timeStarted", { required: true })} />
              </div>
              <div className="space-y-2">
                <Label>Time Ended</Label>
                <Input type="time" {...form.register("timeEnded", { required: true })} />
              </div>
              <div className="space-y-2">
                <Label>Time Taken</Label>
                <Input placeholder="e.g. 1h 15m" {...form.register("timeTaken", { required: true })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>What was taught</Label>
              <Textarea rows={3} placeholder="Topics, exercises, songs covered..." {...form.register("whatTaught", { required: true })} />
            </div>
            <div className="space-y-2">
              <Label>Homework (Optional)</Label>
              <Textarea rows={2} placeholder="Practice assignments for next session..." {...form.register("homework")} />
            </div>
            <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "Saving..." : "Save Log"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
