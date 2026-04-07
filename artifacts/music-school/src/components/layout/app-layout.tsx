import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { 
  LayoutDashboard, 
  Users, 
  CalendarDays, 
  Bell, 
  LogOut,
  Video,
  KeyRound
} from "lucide-react";
import { useAppAuth } from "@/hooks/use-app-auth";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const [location] = useLocation();
  const { user, logout } = useAppAuth();

  const role = user?.role || "student";
  const basePath = `/${role}`;

  const navItems = role === "teacher" ? [
    { name: "Dashboard", href: basePath, icon: LayoutDashboard },
    { name: "My Students", href: `${basePath}/students`, icon: Users },
    { name: "Schedule", href: `${basePath}/classes`, icon: CalendarDays },
    { name: "Announcements", href: `${basePath}/announcements`, icon: Bell },
  ] : [
    { name: "Dashboard", href: basePath, icon: LayoutDashboard },
    { name: "My Classes", href: `${basePath}/classes`, icon: CalendarDays },
    { name: "Announcements", href: `${basePath}/announcements`, icon: Bell },
    { name: "My Account", href: `${basePath}/account`, icon: KeyRound },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-card border-r border-border/50 flex flex-col shrink-0 relative z-20">
        <div className="p-6 pb-2">
          <h1 className="text-2xl font-display font-bold text-primary flex items-center gap-2">
            <span className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center border border-primary/50">
              <span className="text-primary text-sm">M</span>
            </span>
            Maestro
          </h1>
          <p className="text-xs text-muted-foreground mt-1 tracking-wide uppercase">Music Academy</p>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2">
          {navItems.map((item) => {
            const isActive = location === item.href || (location.startsWith(item.href) && item.href !== basePath);
            return (
              <Link key={item.name} href={item.href}>
                <div className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 cursor-pointer group relative overflow-hidden",
                  isActive 
                    ? "text-primary bg-primary/10 font-medium" 
                    : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                )}>
                  {isActive && (
                    <motion.div 
                      layoutId="sidebar-active"
                      className="absolute inset-0 bg-primary/10 border border-primary/20 rounded-xl"
                      initial={false}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                  <item.icon className={cn("w-5 h-5 relative z-10 transition-colors", isActive ? "text-primary" : "group-hover:text-primary")} />
                  <span className="relative z-10">{item.name}</span>
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border/50">
          <div className="mb-4 px-4">
            <p className="text-sm font-medium text-foreground">{user?.name}</p>
            <p className="text-xs text-muted-foreground capitalize">{user?.role}</p>
          </div>
          <Button 
            variant="ghost" 
            className="w-full justify-start text-muted-foreground hover:text-destructive hover:bg-destructive/10"
            onClick={() => logout()}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 max-w-[100vw] overflow-x-hidden relative">
        {/* Subtle background glow effect */}
        <div className="absolute top-0 left-0 right-0 h-[500px] bg-gradient-to-b from-primary/5 to-transparent pointer-events-none -z-10" />
        
        <div className="p-6 md:p-8 lg:p-10 max-w-6xl mx-auto min-h-[calc(100vh-2rem)]">
          {children}
        </div>
      </main>
    </div>
  );
}
