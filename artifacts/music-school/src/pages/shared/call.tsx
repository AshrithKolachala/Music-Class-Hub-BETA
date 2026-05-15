import { useEffect, useRef, useState } from "react";
import { useParams, useLocation } from "wouter";
import { ArrowLeft, Video, Mic, Music2, ExternalLink, Clock, BookOpen, Circle, Square, Upload, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAppClasses } from "@/hooks/use-app-classes";
import { useAppAuth } from "@/hooks/use-app-auth";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { uploadRecordingBlob, createRecordingDoc, formatDuration } from "@/lib/db/recordings";

type RecordingState = "idle" | "recording" | "uploading" | "done";

export default function Call() {
  const params = useParams();
  const classId = params.id || "";
  const [, setLocation] = useLocation();
  const { classes, updateClass } = useAppClasses();
  const { user } = useAppAuth();
  const { toast } = useToast();

  // Recording state
  const [recordingState, setRecordingState] = useState<RecordingState>("idle");
  const [displayDuration, setDisplayDuration] = useState(0);
  const [uploadStatus, setUploadStatus] = useState("");

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const durationRef = useRef(0);

  const classInfo = classes.find((c) => c.id === classId);

  const roomName = classInfo
    ? `SangeetaVarshini-${classId}-${classInfo.title.replace(/\s+/g, "")}`
    : `SangeetaVarshini-${classId}`;

  const jitsiUrl = `https://meet.jit.si/${roomName}#config.prejoinPageEnabled=false&config.disableDeepLinking=true&userInfo.displayName=${encodeURIComponent(user?.name || "")}&config.enableNoisyMicDetection=false&config.enableNoAudioDetection=false&config.audioQuality.stereo=true&config.disableAP=true`;

  useEffect(() => {
    if (user?.role === "teacher" && classInfo && classInfo.status === "scheduled") {
      updateClass({ classId, data: { status: "ongoing" } });
    }
  }, [user, classInfo, classId]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop());
    };
  }, []);

  const handleJoin = () => {
    window.open(jitsiUrl, "_blank", "noopener,noreferrer");
  };

  const handleEndClass = async () => {
    if (confirm("Mark this class as completed?")) {
      await updateClass({ classId, data: { status: "completed" } });
      setLocation(`/${user?.role}/classes`);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true,
      });
      streamRef.current = stream;

      const mimeType = MediaRecorder.isTypeSupported("video/webm;codecs=vp9,opus")
        ? "video/webm;codecs=vp9,opus"
        : MediaRecorder.isTypeSupported("video/webm;codecs=vp8,opus")
        ? "video/webm;codecs=vp8,opus"
        : "video/webm";

      const recorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];
      durationRef.current = 0;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        if (timerRef.current) clearInterval(timerRef.current);
        streamRef.current?.getTracks().forEach((t) => t.stop());

        setRecordingState("uploading");
        setUploadStatus("Preparing recording…");

        const blob = new Blob(chunksRef.current, { type: mimeType });
        const timestamp = Date.now();
        const filename = `${classId}-${timestamp}.webm`;

        try {
          setUploadStatus("Uploading to storage…");
          const url = await uploadRecordingBlob(blob, filename);

          setUploadStatus("Saving details…");
          await createRecordingDoc({
            classId,
            classTitle: classInfo?.title ?? "Class",
            studentId: classInfo?.studentId ?? null,
            url,
            filename,
            durationSeconds: durationRef.current,
            sizeBytes: blob.size,
            recordedBy: user?.name ?? "Teacher",
          });

          setRecordingState("done");
          setUploadStatus("Recording saved!");
          toast({ title: "Recording saved successfully!" });

          setTimeout(() => {
            setRecordingState("idle");
            setDisplayDuration(0);
            durationRef.current = 0;
            setUploadStatus("");
          }, 3000);
        } catch (err) {
          console.error("Upload error:", err);
          setRecordingState("idle");
          setUploadStatus("");
          toast({
            title: "Upload failed. Check Firebase Storage rules.",
            variant: "destructive",
          });
        }
      };

      // If user stops screen share from browser UI
      stream.getVideoTracks()[0]?.addEventListener("ended", () => {
        if (mediaRecorderRef.current?.state === "recording") {
          mediaRecorderRef.current.stop();
        }
      });

      recorder.start(1000);
      setRecordingState("recording");
      setDisplayDuration(0);

      timerRef.current = setInterval(() => {
        durationRef.current += 1;
        setDisplayDuration((d) => d + 1);
      }, 1000);
    } catch (err: any) {
      if (err?.name !== "NotAllowedError") {
        toast({
          title: "Could not start recording.",
          variant: "destructive",
        });
      }
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.stop();
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
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

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-lg space-y-6">
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

          {/* Recording controls — teacher only */}
          {user?.role === "teacher" && (
            <Card className="bg-card border-border/50">
              <CardContent className="p-5">
                <p className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wide">
                  Session Recording
                </p>

                {recordingState === "idle" && (
                  <div className="space-y-2">
                    <Button
                      onClick={startRecording}
                      className="w-full gap-2 bg-red-600 hover:bg-red-700 text-white"
                    >
                      <Circle className="w-4 h-4 fill-white" />
                      Start Recording
                    </Button>
                    <p className="text-xs text-muted-foreground text-center">
                      Select the Jitsi tab or your screen to record the class session.
                    </p>
                  </div>
                )}

                {recordingState === "recording" && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                        <span className="text-sm font-medium text-red-400">Recording</span>
                      </div>
                      <span className="text-sm font-mono text-red-400">
                        {formatDuration(displayDuration)}
                      </span>
                    </div>
                    <Button
                      onClick={stopRecording}
                      variant="outline"
                      className="w-full gap-2 border-red-500/50 text-red-400 hover:bg-red-500/10"
                    >
                      <Square className="w-4 h-4 fill-current" />
                      Stop Recording
                    </Button>
                  </div>
                )}

                {recordingState === "uploading" && (
                  <div className="flex items-center justify-center gap-3 py-3 text-muted-foreground">
                    <Upload className="w-4 h-4 animate-bounce" />
                    <span className="text-sm">{uploadStatus}</span>
                  </div>
                )}

                {recordingState === "done" && (
                  <div className="flex items-center justify-center gap-3 py-3 text-green-400">
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-sm font-medium">{uploadStatus}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
