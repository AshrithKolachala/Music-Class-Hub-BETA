import { useState, useEffect, useRef } from "react";
import { Film, Play, Pause, X } from "lucide-react";
import { AppLayout } from "@/components/layout/app-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAppAuth } from "@/hooks/use-app-auth";
import { format } from "date-fns";
import {
  getStudentRecordings,
  formatDuration,
  formatSize,
  type Recording,
} from "@/lib/db/recordings";

export default function StudentRecordings() {
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [loading, setLoading] = useState(true);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const { user } = useAppAuth();

  useEffect(() => {
    if (!user?.studentId) return;
    getStudentRecordings(user.studentId)
      .then(setRecordings)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user?.studentId]);

  const handlePlay = (r: Recording) => {
    setPlayingId(r.id);
    setTimeout(() => {
      videoRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 100);
  };

  const playingRecording = recordings.find((r) => r.id === playingId);

  return (
    <AppLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold">Class Recordings</h1>
        <p className="text-muted-foreground mt-2">
          Replay your past class sessions
        </p>
      </div>

      {/* Video Player */}
      {playingRecording && (
        <Card className="mb-6 border-primary/30 bg-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="font-semibold">{playingRecording.classTitle}</p>
                <p className="text-xs text-muted-foreground">
                  {format(new Date(playingRecording.recordedAt), "MMM d, yyyy · h:mm a")} ·{" "}
                  {formatDuration(playingRecording.durationSeconds)}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setPlayingId(null)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            <video
              ref={videoRef}
              src={playingRecording.url}
              controls
              autoPlay
              className="w-full rounded-lg bg-black max-h-[480px]"
            />
          </CardContent>
        </Card>
      )}

      <div className="grid gap-3">
        {loading ? (
          <div className="p-12 text-center text-muted-foreground">Loading...</div>
        ) : recordings.length === 0 ? (
          <div className="p-12 text-center border border-dashed rounded-xl border-border/50 text-muted-foreground bg-card/30 flex flex-col items-center">
            <Film className="w-12 h-12 mb-4 opacity-30" />
            <p className="text-lg font-medium">No recordings yet</p>
            <p className="text-sm mt-1">
              Your teacher will upload recordings after class sessions.
            </p>
          </div>
        ) : (
          recordings.map((r) => (
            <Card
              key={r.id}
              className={`bg-card border-border/50 transition-colors ${
                playingId === r.id ? "border-primary/40" : "hover:border-primary/20"
              }`}
            >
              <CardContent className="p-5">
                <div className="flex items-center gap-4">
                  <div
                    className="w-12 h-12 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 cursor-pointer hover:bg-primary/20 transition-colors"
                    onClick={() =>
                      playingId === r.id ? setPlayingId(null) : handlePlay(r)
                    }
                  >
                    {playingId === r.id ? (
                      <Pause className="w-5 h-5 text-primary" />
                    ) : (
                      <Play className="w-5 h-5 text-primary" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground truncate">
                      {r.classTitle}
                    </p>
                    <div className="flex items-center gap-3 mt-1 flex-wrap">
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(r.recordedAt), "MMM d, yyyy · h:mm a")}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatDuration(r.durationSeconds)}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatSize(r.sizeBytes)}
                      </span>
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-1.5 text-muted-foreground hover:text-foreground shrink-0"
                    onClick={() =>
                      playingId === r.id ? setPlayingId(null) : handlePlay(r)
                    }
                  >
                    {playingId === r.id ? (
                      <><Pause className="w-4 h-4" /> Close</>
                    ) : (
                      <><Play className="w-4 h-4" /> Play</>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </AppLayout>
  );
}
