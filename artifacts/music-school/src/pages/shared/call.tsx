import { useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { ArrowLeft, Video, Mic, Music2, ExternalLink, Clock, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAppClasses } from "@/hooks/use-app-classes";
import { useAppAuth } from "@/hooks/use-app-auth";
import { format } from "date-fns";

export default function Call() {
  const params = useParams();
  const classId = params.id ? parseInt(params.id) : 0;
  const [, setLocation] = useLocation();
  const { classes, updateClass } = useAppClasses();
  const { user } = useAppAuth();

  const classInfo = classes.find(c => c.id === classId);

  const roomName = classInfo
    ? `MaestroAcademy-${classId}-${classInfo.title.replace(/\s+/g, "")}`
    : `MaestroAcademy-${classId}`;

  const jitsiUrl = `https://meet.jit.si/${roomName}#config.prejoinPageEnabled=false&config.disableDeepLinking=true&userInfo.displayName=${encodeURIComponent(user?.name || "")}&config.enableNoisyMicDetection=false&config.enableNoAudioDetection=false&config.audioQuality.stereo=true&config.disableAP=true`;

  useEffect(() => {
    if (user?.role === "teacher" && classInfo && classInfo.status === "scheduled") {
      updateClass({ classId, data: { status: "ongoing" } });
    }
  }, [user, classInfo, classId]);

  const handleJoin = () => {
    window.open(jitsiUrl, "_blank", "noopener,noreferrer");
  };

  const handleEndClass = async () => {
    if (confirm("Mark this class as completed?")) {
      await updateClass({ classId, data: { status: "completed" } });
      setLocation("/teacher/classes");
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="border-b border-border/50 bg-card px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLocation(`/${user?.role}/classes`)}
            className="text-muted-foreground"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="font-bold text-lg">{classInfo?.title ?? "Loading..."}</h1>
            <p className="text-xs text-muted-foreground">{classInfo?.topic}</p>
          </div>
        </div>
        {user?.role === "teacher" && classInfo && (
          <Button variant="destructive" size="sm" onClick={handleEndClass}>
            End Class
          </Button>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-lg space-y-6">

          {/* Class Info Card */}
          {classInfo && (
            <Card className="bg-card border-border/50">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
                    <Music2 className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-lg">{classInfo.title}</p>
                    <p className="text-sm text-primary">{classInfo.topic}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span>{format(new Date(classInfo.scheduledAt), "MMM d, h:mm a")}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <BookOpen className="w-4 h-4" />
                    <span>{classInfo.durationMinutes} minutes</span>
                  </div>
                </div>
                {classInfo.description && (
                  <p className="text-sm text-muted-foreground border-t border-border/50 pt-3">
                    {classInfo.description}
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          {/* Join Card */}
          <Card className="bg-card border-primary/20 border-2">
            <CardContent className="p-8 text-center space-y-6">
              <div className="w-20 h-20 rounded-full bg-primary/10 border-2 border-primary/30 flex items-center justify-center mx-auto">
                <Video className="w-10 h-10 text-primary" />
              </div>

              <div>
                <h2 className="text-xl font-bold">Ready to join?</h2>
                <p className="text-muted-foreground text-sm mt-2">
                  The class room opens in a new tab. Make sure your microphone and camera are ready.
                </p>
              </div>

              <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Mic className="w-3.5 h-3.5 text-primary" /> High-quality audio
                </span>
                <span className="flex items-center gap-1.5">
                  <Video className="w-3.5 h-3.5 text-primary" /> HD video
                </span>
              </div>

              <Button
                size="lg"
                className="w-full text-base font-semibold shadow-lg shadow-primary/20 gap-2"
                onClick={handleJoin}
              >
                <ExternalLink className="w-5 h-5" />
                Join Class Room
              </Button>

              <p className="text-xs text-muted-foreground">
                Room: <code className="text-primary">{roomName}</code>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
