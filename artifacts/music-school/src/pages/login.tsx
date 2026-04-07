import { useState } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useLocation } from "wouter";
import { Music, ArrowRight, UserSquare2, GraduationCap } from "lucide-react";
import { useAppAuth } from "@/hooks/use-app-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

const loginSchema = z.object({
  userId: z.string().min(1, "ID is required"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function Login() {
  const [role, setRole] = useState<"student" | "teacher">("student");
  const { login, isLoggingIn } = useAppAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    try {
      await login({ ...data, role });
      setLocation(`/${role}`);
      toast({
        title: "Welcome back!",
        description: "Successfully logged in.",
      });
    } catch (err: any) {
      toast({
        title: "Login Failed",
        description: err.message || "Invalid credentials. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen w-full flex relative overflow-hidden bg-background">
      {/* Decorative background Elements */}
      <div className="absolute inset-0 z-0">
        <img 
          src={`${import.meta.env.BASE_URL}images/hero-bg.png`} 
          alt="Elegant abstract background" 
          className="w-full h-full object-cover opacity-40 mix-blend-overlay"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
        <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] bg-primary/20 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[40%] h-[40%] bg-accent/20 blur-[120px] rounded-full" />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-6 z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="w-full max-w-md"
        >
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 mb-6 shadow-lg shadow-primary/5">
              <Music className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-3">
              Maestro Academy
            </h1>
            <p className="text-muted-foreground text-lg">
              Elevate your musical journey
            </p>
          </div>

          <Card className="bg-card/60 backdrop-blur-xl border-border/50 shadow-2xl">
            <CardContent className="p-8">
              {/* Role Toggle */}
              <div className="flex p-1 bg-background/50 rounded-lg mb-8 border border-border/50">
                <button
                  className={`flex-1 py-2.5 text-sm font-medium rounded-md transition-all flex items-center justify-center gap-2 ${role === "student" ? "bg-primary text-primary-foreground shadow-md" : "text-muted-foreground hover:text-foreground"}`}
                  onClick={() => setRole("student")}
                >
                  <GraduationCap className="w-4 h-4" />
                  Student
                </button>
                <button
                  className={`flex-1 py-2.5 text-sm font-medium rounded-md transition-all flex items-center justify-center gap-2 ${role === "teacher" ? "bg-primary text-primary-foreground shadow-md" : "text-muted-foreground hover:text-foreground"}`}
                  onClick={() => setRole("teacher")}
                >
                  <UserSquare2 className="w-4 h-4" />
                  Teacher
                </button>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="userId" className="text-foreground/80">
                    {role === "student" ? "Student ID" : "Teacher ID"}
                  </Label>
                  <Input 
                    id="userId" 
                    placeholder={role === "student" ? "e.g. STU-001" : "e.g. TEACHER-001"} 
                    className="bg-background/50 border-border focus:border-primary focus:ring-primary/20 h-12"
                    {...register("userId")}
                  />
                  {errors.userId && <p className="text-xs text-destructive mt-1">{errors.userId.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-foreground/80">Password</Label>
                  <Input 
                    id="password" 
                    type="password"
                    placeholder="••••••••" 
                    className="bg-background/50 border-border focus:border-primary focus:ring-primary/20 h-12"
                    {...register("password")}
                  />
                  {errors.password && <p className="text-xs text-destructive mt-1">{errors.password.message}</p>}
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-12 text-base font-semibold bg-gradient-to-r from-primary to-primary/80 hover:to-primary text-primary-foreground shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all hover:-translate-y-0.5"
                  disabled={isLoggingIn}
                >
                  {isLoggingIn ? "Signing in..." : "Sign In"}
                  {!isLoggingIn && <ArrowRight className="w-5 h-5 ml-2" />}
                </Button>

                {/* Demo Credentials-
                <div className="text-center mt-6">
                  <p className="text-xs text-muted-foreground">
                    Demo Credentials:<br/>
                    Teacher: TEACHER-001 / password@123<br/>
                    Student: STU-001 / password@123
                  </p>
                </div>*/}
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
