import { Switch, Route, Router as WouterRouter, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Spinner } from "@/components/ui/spinner";
import NotFound from "@/pages/not-found";

import Login from "@/pages/login";
import TeacherDashboard from "@/pages/teacher/dashboard";
import TeacherClasses from "@/pages/teacher/classes";
import TeacherStudents from "@/pages/teacher/students";
import TeacherAnnouncements from "@/pages/teacher/announcements";
import TeacherClassLogs from "@/pages/teacher/class-logs";
import TeacherUpdates from "@/pages/teacher/updates";
import StudentDashboard from "@/pages/student/dashboard";
import StudentClasses from "@/pages/student/classes";
import StudentAccount from "@/pages/student/account";
import StudentClassLogs from "@/pages/student/class-logs";
import StudentUpdates from "@/pages/student/updates";
import Call from "@/pages/shared/call";

import { useAppAuth } from "@/hooks/use-app-auth";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

function ProtectedRoute({ component: Component, allowedRole }: { component: any, allowedRole?: string }) {
  const { user, isLoadingUser, isAuthenticated } = useAppAuth();

  if (isLoadingUser) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-background">
        <Spinner className="w-8 h-8" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Redirect to="/" />;
  }

  if (allowedRole && user?.role !== allowedRole) {
    return <Redirect to={`/${user?.role}`} />;
  }

  return <Component />;
}

function Router() {
  const { isAuthenticated, user, isLoadingUser } = useAppAuth();

  if (isLoadingUser) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-background">
        <Spinner className="w-8 h-8" />
      </div>
    );
  }

  return (
    <Switch>
      {/* Public / Auth */}
      <Route path="/">
        {isAuthenticated ? <Redirect to={`/${user?.role}`} /> : <Login />}
      </Route>

      {/* Teacher Routes */}
      <Route path="/teacher">
        <ProtectedRoute component={TeacherDashboard} allowedRole="teacher" />
      </Route>
      <Route path="/teacher/classes">
        <ProtectedRoute component={TeacherClasses} allowedRole="teacher" />
      </Route>
      <Route path="/teacher/students">
        <ProtectedRoute component={TeacherStudents} allowedRole="teacher" />
      </Route>
      <Route path="/teacher/announcements">
        <ProtectedRoute component={TeacherAnnouncements} allowedRole="teacher" />
      </Route>
      <Route path="/teacher/class-logs">
        <ProtectedRoute component={TeacherClassLogs} allowedRole="teacher" />
      </Route>
      <Route path="/teacher/updates">
        <ProtectedRoute component={TeacherUpdates} allowedRole="teacher" />
      </Route>

      {/* Student Routes */}
      <Route path="/student">
        <ProtectedRoute component={StudentDashboard} allowedRole="student" />
      </Route>
      <Route path="/student/classes">
        <ProtectedRoute component={StudentClasses} allowedRole="student" />
      </Route>
      <Route path="/student/account">
        <ProtectedRoute component={StudentAccount} allowedRole="student" />
      </Route>
      <Route path="/student/announcements">
        <ProtectedRoute component={TeacherAnnouncements} />
      </Route>
      <Route path="/student/class-logs">
        <ProtectedRoute component={StudentClassLogs} allowedRole="student" />
      </Route>
      <Route path="/student/updates">
        <ProtectedRoute component={StudentUpdates} allowedRole="student" />
      </Route>

      {/* Shared Routes */}
      <Route path="/call/:id">
        <ProtectedRoute component={Call} />
      </Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
