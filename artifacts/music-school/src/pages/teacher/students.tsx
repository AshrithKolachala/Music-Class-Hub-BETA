import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Users, Trash2, UserPlus, Eye, EyeOff, KeyRound } from "lucide-react";
import { AppLayout } from "@/components/layout/app-layout";
import { useAppStudents } from "@/hooks/use-app-students";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

const studentSchema = z.object({
  name: z.string().min(2, "Name is required"),
  instrument: z.string().min(2, "Instrument is required"),
});

const passwordSchema = z.object({
  newPassword: z.string().min(4, "Password must be at least 4 characters"),
});

type StudentFormValues = z.infer<typeof studentSchema>;
type PasswordFormValues = z.infer<typeof passwordSchema>;

function StudentCard({ student, onDelete, onPasswordChange }: {
  student: any;
  onDelete: () => void;
  onPasswordChange: (studentId: number, newPassword: string) => Promise<void>;
}) {
  const [showPassword, setShowPassword] = useState(false);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const { toast } = useToast();

  const form = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { newPassword: "" },
  });

  const onSubmitPassword = async (data: PasswordFormValues) => {
    try {
      await onPasswordChange(student.id, data.newPassword);
      toast({ title: "Password updated successfully" });
      setIsPasswordDialogOpen(false);
      form.reset();
    } catch {
      toast({ title: "Failed to update password", variant: "destructive" });
    }
  };

  return (
    <Card className="bg-card hover:shadow-xl hover:shadow-black/20 transition-all border-border/50 group">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center text-primary font-bold text-lg">
            {student.name.charAt(0)}
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive hover:bg-destructive/10 -mr-2 -mt-2"
            onClick={onDelete}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>

        <h3 className="text-xl font-bold text-foreground">{student.name}</h3>
        <p className="text-sm text-primary font-medium mt-1">{student.instrument}</p>

        <div className="mt-4 space-y-2">
          <div className="p-3 rounded-lg bg-background border border-border/50 flex items-center justify-between">
            <span className="text-xs text-muted-foreground uppercase tracking-wider">Login ID</span>
            <code className="text-sm font-mono text-foreground font-semibold">{student.studentId}</code>
          </div>

          <div className="p-3 rounded-lg bg-background border border-border/50 flex items-center justify-between gap-2">
            <span className="text-xs text-muted-foreground uppercase tracking-wider">Password</span>
            <div className="flex items-center gap-2">
              <code className="text-sm font-mono text-foreground font-semibold">
                {showPassword ? student.password : "••••••••"}
              </code>
              <button
                onClick={() => setShowPassword(!showPassword)}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="w-full mt-4 gap-2">
              <KeyRound className="w-3.5 h-3.5" /> Change Password
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Change Password for {student.name}</DialogTitle>
            </DialogHeader>
            <form onSubmit={form.handleSubmit(onSubmitPassword)} className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label>New Password</Label>
                <Input
                  type="text"
                  placeholder="Enter new password"
                  {...form.register("newPassword")}
                />
                {form.formState.errors.newPassword && (
                  <p className="text-xs text-destructive">{form.formState.errors.newPassword.message}</p>
                )}
              </div>
              <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Updating..." : "Update Password"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}

export default function TeacherStudents() {
  const { students, createStudent, deleteStudent, changeStudentPassword } = useAppStudents();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const form = useForm<StudentFormValues>({
    resolver: zodResolver(studentSchema),
  });

  const onSubmit = async (data: StudentFormValues) => {
    try {
      await createStudent({ data });
      toast({ title: "Student added successfully" });
      setIsDialogOpen(false);
      form.reset();
    } catch {
      toast({ title: "Error adding student", variant: "destructive" });
    }
  };

  return (
    <AppLayout>
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold">My Students</h1>
          <p className="text-muted-foreground mt-2">Manage your student roster, login IDs, and passwords</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 shrink-0">
              <UserPlus className="w-4 h-4" /> Add Student
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Student</DialogTitle>
            </DialogHeader>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Student Full Name</Label>
                <Input placeholder="e.g. Mozart Amadeus" {...form.register("name")} />
                {form.formState.errors.name && (
                  <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Primary Instrument</Label>
                <Input placeholder="e.g. Piano, Violin, Vocals" {...form.register("instrument")} />
                {form.formState.errors.instrument && (
                  <p className="text-xs text-destructive">{form.formState.errors.instrument.message}</p>
                )}
              </div>
              <div className="bg-primary/5 p-4 rounded-lg border border-primary/20 text-sm text-muted-foreground">
                A unique Student ID will be generated automatically. Default password: <code className="text-primary bg-background px-1 rounded">password@123</code>
              </div>
              <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Adding..." : "Add Student"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {students.length === 0 ? (
          <div className="col-span-full p-12 text-center border border-dashed rounded-xl border-border/50 text-muted-foreground bg-card/30">
            <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
            <p className="text-lg font-medium">No students yet</p>
            <p className="text-sm mt-1">Add your first student to get started.</p>
          </div>
        ) : (
          students.map((student) => (
            <StudentCard
              key={student.id}
              student={student}
              onDelete={() => {
                if (confirm(`Remove ${student.name} from your roster?`)) {
                  deleteStudent({ studentId: student.id });
                }
              }}
              onPasswordChange={changeStudentPassword}
            />
          ))
        )}
      </div>
    </AppLayout>
  );
}
