import { useState, useEffect } from "react";
import { ClipboardList } from "lucide-react";
import { AppLayout } from "@/components/layout/app-layout";
import { Card, CardContent } from "@/components/ui/card";
import { useAppAuth } from "@/hooks/use-app-auth";
import { getClassLogs, type ClassLog } from "@/lib/db/class-logs";

export default function StudentClassLogs() {
  const [logs, setLogs] = useState<ClassLog[]>([]);
  const { user } = useAppAuth();

  useEffect(() => {
    if (user?.studentId) {
      getClassLogs(user.studentId).then(setLogs).catch(() => {});
    }
  }, [user?.studentId]);

  return (
    <AppLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold">Class Logs</h1>
        <p className="text-muted-foreground mt-2">A record of your lessons and homework</p>
      </div>

      <div className="grid gap-4">
        {logs.length === 0 ? (
          <div className="p-12 text-center border border-dashed rounded-xl border-border/50 text-muted-foreground bg-card/30 flex flex-col items-center">
            <ClipboardList className="w-12 h-12 mb-4 text-muted-foreground/50" />
            <p className="text-lg font-medium">No class logs yet</p>
            <p className="text-sm mt-1">Your teacher will add logs after each session.</p>
          </div>
        ) : (
          logs.map(log => (
            <Card key={log.id} className="bg-card border-border/50 hover:border-primary/20 transition-colors">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="font-bold text-lg text-primary">{log.classDate}</span>
                  <div className="flex gap-3 text-sm text-muted-foreground">
                    <span>{log.timeStarted} – {log.timeEnded}</span>
                    <span>({log.timeTaken})</span>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1 font-semibold">What we covered</p>
                  <p className="text-sm text-foreground leading-relaxed">{log.whatTaught}</p>
                </div>
                {log.homework && (
                  <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                    <p className="text-xs text-primary uppercase tracking-wide mb-1 font-semibold">Homework</p>
                    <p className="text-sm text-foreground leading-relaxed">{log.homework}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </AppLayout>
  );
}
