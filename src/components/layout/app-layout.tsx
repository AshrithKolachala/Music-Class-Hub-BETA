import { ReactNode, useState } from "react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Users,
  CalendarDays,
  Bell,
  LogOut,
  KeyRound,
  ClipboardList,
  Megaphone,
  Film,
  Menu,
  X,
} from "lucide-react";
import { useAppAuth } from "@/hooks/use-app-auth";
import { Button } from "@/components/ui/button";
import { NotificationBell } from "@/components/ui/notification-bell";
import { cn } from "@/lib/utils";

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const [location] = useLocation();
  const { user, logout } = useAppAuth();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const role = user?.role || "student";
  const basePath = `/${role}`;

  const navItems =
    role === "teacher"
      ? [
          { name: "Dashboard", href: basePath, icon: LayoutDashboard },
          { name: "My Students", href: `${basePath}/students`, icon: Users },
          { name: "Schedule", href: `${basePath}/classes`, icon: CalendarDays },
          { name: "Class Logs", href: `${basePath}/class-logs`, icon: ClipboardList },
          { name: "Updates", href: `${basePath}/updates`, icon: Megaphone },
          { name: "Announcements", href: `${basePath}/announcements`, icon: Bell },
          { name: "Recordings", href: `${basePath}/recordings`, icon: Film },
        ]
      : [
          { name: "Dashboard", href: basePath, icon: LayoutDashboard },
          { name: "My Classes", href: `${basePath}/classes`, icon: CalendarDays },
          { name: "Class Logs", href: `${basePath}/class-logs`, icon: ClipboardList },
          { name: "Updates", href: `${basePath}/updates`, icon: Megaphone },
          { name: "Announcements", href: `${basePath}/announcements`, icon: Bell },
          { name: "Recordings", href: `${basePath}/recordings`, icon: Film },
          { name: "My Account", href: `${basePath}/account`, icon: KeyRound },
        ];

  const SidebarContent = () => (
    <>
      {/* Header */}
      <div className="p-6 pb-2 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-display font-bold text-primary flex items-center gap-2">
            <span className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center border border-primary/50 shrink-0">
              <span className="text-primary text-sm">S</span>
            </span>
            Sangeetavarshini
          </h1>
          <p className="text-xs text-muted-foreground mt-1 tracking-wide uppercase">
            Music Academy
          </p>
        </div>
        {/* Close button — mobile only */}
        <button
          className="md:hidden text-muted-foreground hover:text-foreground p-1"
          onClick={() => setMobileNavOpen(false)}
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive =
            location === item.href ||
            (location.startsWith(item.href) && item.href !== basePath);
          return (
            <Link key={item.name} href={item.href}>
              <div
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 cursor-pointer group relative overflow-hidden",
                  isActive
                    ? "text-primary bg-primary/10 font-medium"
                    : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                )}
                onClick={() => setMobileNavOpen(false)}
              >
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="absolute inset-0 bg-primary/10 border border-primary/20 rounded-xl"
                    initial={false}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <item.icon
                  className={cn(
                    "w-5 h-5 relative z-10 transition-colors shrink-0",
                    isActive ? "text-primary" : "group-hover:text-primary"
                  )}
                />
                <span className="relative z-10 text-sm">{item.name}</span>
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-border/50">
        <div className="mb-4 px-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-foreground">{user?.name}</p>
            <p className="text-xs text-muted-foreground capitalize">{user?.role}</p>
          </div>
          {role === "student" && <NotificationBell />}
        </div>
        <Button
          variant="ghost"
          className="w-full justify-start text-muted-foreground hover:text-destructive hover:bg-destructive/10"
          onClick={() => {
            setMobileNavOpen(false);
            logout();
          }}
        >
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </Button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      {/* ── Mobile top bar ── */}
      <header className="md:hidden sticky top-0 z-30 bg-card border-b border-border/50 px-4 h-14 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <button
            className="text-muted-foreground hover:text-foreground"
            onClick={() => setMobileNavOpen(true)}
            aria-label="Open navigation"
          >
            <Menu className="w-5 h-5" />
          </button>
          <span className="font-bold text-primary text-base">Sangeetavarshini</span>
        </div>
        {role === "student" && <NotificationBell />}
      </header>

      {/* ── Mobile drawer backdrop ── */}
      <AnimatePresence>
        {mobileNavOpen && (
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden fixed inset-0 bg-black/60 z-40"
            onClick={() => setMobileNavOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* ── Sidebar (desktop: static, mobile: slide-in drawer) ── */}
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-64 bg-card border-r border-border/50 flex-col shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileNavOpen && (
          <motion.aside
            key="drawer"
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "tween", duration: 0.25 }}
            className="md:hidden fixed inset-y-0 left-0 z-50 w-72 bg-card border-r border-border/50 flex flex-col"
          >
            <SidebarContent />
          </motion.aside>
        )}
      </AnimatePresence>

      {/* ── Main content ── */}
      <main className="flex-1 min-w-0 overflow-x-hidden relative">
        <div className="absolute top-0 left-0 right-0 h-[500px] bg-gradient-to-b from-primary/5 to-transparent pointer-events-none -z-10" />
        <div className="p-4 sm:p-6 md:p-8 lg:p-10 max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
