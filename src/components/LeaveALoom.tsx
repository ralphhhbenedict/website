import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Video,
  Mic,
  Square,
  Play,
  Pause,
  Send,
  RotateCcw,
  X,
  AlertCircle,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "@/components/ui/use-toast";
import {
  trackLoomStarted,
  trackLoomPaused,
  trackLoomResumed,
  trackLoomCompleted,
  trackLoomSubmitted,
  trackLoomError,
  trackTosAccepted,
  trackModalOpened,
  trackFormStarted,
} from "@/lib/mixpanel";

// State machine types
type RecordingState = "ENTRY" | "RECORDING" | "PAUSED" | "REVIEW" | "UPLOADING" | "SUBMITTED";
type RecordingMode = "audio" | "video";

// Constants
const MAX_DURATION_SECONDS = 300; // 5 minutes
const WARNING_THRESHOLD_SECONDS = 270; // 4:30 warning

interface LeaveALoomProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const LeaveALoom = ({ open, onOpenChange }: LeaveALoomProps) => {
  // State machine
  const [state, setState] = useState<RecordingState>("ENTRY");
  const [mode, setMode] = useState<RecordingMode>("video");

  // Recording state
  const [email, setEmail] = useState("");
  const [tosAccepted, setTosAccepted] = useState(false);
  const [tosAcceptedAt, setTosAcceptedAt] = useState<Date | null>(null);
  const [duration, setDuration] = useState(0);
  const [pauseCount, setPauseCount] = useState(0);
  const [showWarning, setShowWarning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Refs for media
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const recordedBlobRef = useRef<Blob | null>(null);

  // Format duration as MM:SS
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Cleanup media resources
  const cleanup = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current = null;
    }
    chunksRef.current = [];
  }, []);

  // Reset to initial state
  const reset = useCallback(() => {
    cleanup();
    setState("ENTRY");
    setDuration(0);
    setPauseCount(0);
    setShowWarning(false);
    setError(null);
    recordedBlobRef.current = null;
  }, [cleanup]);

  // Handle modal close
  useEffect(() => {
    if (!open) {
      reset();
    } else {
      trackModalOpened("leave_a_loom");
      // Prefill email from localStorage
      const savedEmail = localStorage.getItem("ralphhhbenedict_email");
      if (savedEmail) {
        setEmail(savedEmail);
      }
    }
  }, [open, reset]);

  // Start recording
  const startRecording = async () => {
    if (!tosAccepted) {
      setError("Please accept the Terms of Service to continue");
      return;
    }

    try {
      setError(null);
      trackLoomStarted(mode);
      trackFormStarted("leave_a_loom");

      // Get user media
      const constraints: MediaStreamConstraints = {
        audio: true,
        video: mode === "video" ? { facingMode: "user", width: 640, height: 480 } : false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      // Set up video preview
      if (videoRef.current && mode === "video") {
        videoRef.current.srcObject = stream;
        videoRef.current.muted = true;
        await videoRef.current.play().catch(console.error);
      }

      // Set up MediaRecorder
      const mimeType = MediaRecorder.isTypeSupported("video/webm;codecs=vp9")
        ? "video/webm;codecs=vp9"
        : MediaRecorder.isTypeSupported("video/webm")
        ? "video/webm"
        : "video/mp4";

      const recorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeType });
        recordedBlobRef.current = blob;
      };

      recorder.start(1000); // Collect data every second
      setState("RECORDING");

      // Start timer
      timerRef.current = setInterval(() => {
        setDuration((prev) => {
          const newDuration = prev + 1;

          // Show warning at 4:30
          if (newDuration >= WARNING_THRESHOLD_SECONDS && !showWarning) {
            setShowWarning(true);
          }

          // Auto-stop at 5:00
          if (newDuration >= MAX_DURATION_SECONDS) {
            stopRecording();
          }

          return newDuration;
        });
      }, 1000);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to access camera/microphone";
      setError(errorMessage);
      trackLoomError("media_access", errorMessage);
    }
  };

  // Pause recording
  const pauseRecording = () => {
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.pause();
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      setState("PAUSED");
      setPauseCount((prev) => prev + 1);
      trackLoomPaused(duration);
    }
  };

  // Resume recording
  const resumeRecording = () => {
    if (mediaRecorderRef.current?.state === "paused") {
      mediaRecorderRef.current.resume();
      setState("RECORDING");
      trackLoomResumed(pauseCount);

      // Restart timer
      timerRef.current = setInterval(() => {
        setDuration((prev) => {
          const newDuration = prev + 1;
          if (newDuration >= WARNING_THRESHOLD_SECONDS && !showWarning) {
            setShowWarning(true);
          }
          if (newDuration >= MAX_DURATION_SECONDS) {
            stopRecording();
          }
          return newDuration;
        });
      }, 1000);
    }
  };

  // Stop recording and go to review
  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }
    setState("REVIEW");
    trackLoomCompleted(mode, duration);

    // Set up playback
    setTimeout(() => {
      if (videoRef.current && recordedBlobRef.current) {
        videoRef.current.srcObject = null;
        videoRef.current.src = URL.createObjectURL(recordedBlobRef.current);
        videoRef.current.muted = false;
      }
    }, 100);
  };

  // Submit recording
  const submitRecording = async () => {
    if (!email || !recordedBlobRef.current || !tosAcceptedAt) {
      setError("Please enter your email");
      return;
    }

    setState("UPLOADING");
    const blob = recordedBlobRef.current;

    try {
      // Generate unique filename
      const timestamp = Date.now();
      const extension = mode === "video" ? "webm" : "webm";
      const filename = `intake_${timestamp}_${email.replace(/[^a-z0-9]/gi, "_")}.${extension}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from("intakes")
        .upload(filename, blob, {
          contentType: blob.type,
          upsert: false,
        });

      if (uploadError) {
        throw new Error(uploadError.message);
      }

      // Insert record into database
      const { error: dbError } = await supabase.from("intakes").insert([
        {
          email,
          mode,
          storage_path: filename,
          duration_seconds: duration,
          file_size_bytes: blob.size,
          status: "completed",
          tos_consent: true,
          tos_consent_at: tosAcceptedAt.toISOString(),
          user_agent: navigator.userAgent,
        },
      ]);

      if (dbError) {
        console.warn("Database insert error:", dbError);
        // Continue anyway - file is uploaded
      }

      // Save email for future use
      localStorage.setItem("ralphhhbenedict_email", email);

      setState("SUBMITTED");
      trackLoomSubmitted(mode, duration, blob.size);

      toast({
        title: "Message sent!",
        description: "I'll review your message and get back to you soon.",
      });

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Upload failed";
      setError(errorMessage);
      setState("REVIEW");
      trackLoomError("upload", errorMessage);
    }
  };

  // Handle ToS checkbox change
  const handleTosChange = (checked: boolean) => {
    setTosAccepted(checked);
    if (checked) {
      const now = new Date();
      setTosAcceptedAt(now);
      trackTosAccepted("leave_a_loom");
    } else {
      setTosAcceptedAt(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {mode === "video" ? <Video className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            Leave Me a Loom
          </DialogTitle>
          <DialogDescription>
            Walk me through your problem in up to 5 minutes. I'll get back to you async.
          </DialogDescription>
        </DialogHeader>

        {/* Entry State */}
        {state === "ENTRY" && (
          <div className="space-y-4">
            {/* Email Input */}
            <div className="space-y-2">
              <Label htmlFor="loom-email">Your Email *</Label>
              <Input
                id="loom-email"
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            {/* Mode Selection */}
            <div className="space-y-2">
              <Label>Recording Mode</Label>
              <div className="flex gap-2">
                <Button
                  variant={mode === "video" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setMode("video")}
                  className="flex-1"
                >
                  <Video className="w-4 h-4 mr-2" />
                  Video
                </Button>
                <Button
                  variant={mode === "audio" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setMode("audio")}
                  className="flex-1"
                >
                  <Mic className="w-4 h-4 mr-2" />
                  Audio Only
                </Button>
              </div>
            </div>

            {/* ToS Checkbox */}
            <div className="flex items-start space-x-3 p-3 bg-muted/50 rounded-lg">
              <Checkbox
                id="tos"
                checked={tosAccepted}
                onCheckedChange={handleTosChange}
              />
              <label
                htmlFor="tos"
                className="text-sm leading-relaxed cursor-pointer"
              >
                I agree to the{" "}
                <a
                  href="/terms"
                  target="_blank"
                  className="text-primary underline underline-offset-2"
                >
                  Terms of Service
                </a>
                {" "}and consent to having my recording stored and reviewed.
              </label>
            </div>

            {/* Error Display */}
            {error && (
              <div className="flex items-center gap-2 text-destructive text-sm">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}

            {/* Start Button */}
            <Button
              onClick={startRecording}
              disabled={!email || !tosAccepted}
              className="w-full"
              size="lg"
            >
              {mode === "video" ? (
                <Video className="w-5 h-5 mr-2" />
              ) : (
                <Mic className="w-5 h-5 mr-2" />
              )}
              Start Recording
            </Button>
          </div>
        )}

        {/* Recording / Paused State */}
        {(state === "RECORDING" || state === "PAUSED") && (
          <div className="space-y-4">
            {/* Video Preview */}
            <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
              {mode === "video" ? (
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover"
                  style={{ transform: "scaleX(-1)" }}
                  playsInline
                  autoPlay
                  muted
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <div className={`w-24 h-24 rounded-full ${state === "RECORDING" ? "bg-red-500 animate-pulse" : "bg-gray-500"} flex items-center justify-center`}>
                    <Mic className="w-12 h-12 text-white" />
                  </div>
                </div>
              )}

              {/* Recording Indicator */}
              {state === "RECORDING" && (
                <div className="absolute top-3 left-3 flex items-center gap-2 bg-red-600/90 text-white px-3 py-1 rounded-full text-sm font-medium">
                  <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                  REC
                </div>
              )}

              {/* Paused Indicator */}
              {state === "PAUSED" && (
                <div className="absolute top-3 left-3 flex items-center gap-2 bg-yellow-600/90 text-white px-3 py-1 rounded-full text-sm font-medium">
                  <Pause className="w-3 h-3" />
                  PAUSED
                </div>
              )}

              {/* Timer */}
              <div className={`absolute top-3 right-3 px-3 py-1 rounded-full text-sm font-mono font-bold ${
                showWarning ? "bg-yellow-500 text-black" : "bg-black/70 text-white"
              }`}>
                {formatDuration(duration)} / 5:00
              </div>
            </div>

            {/* Warning Message */}
            {showWarning && (
              <div className="flex items-center gap-2 text-yellow-600 text-sm bg-yellow-50 p-2 rounded">
                <AlertCircle className="w-4 h-4" />
                30 seconds remaining
              </div>
            )}

            {/* Controls */}
            <div className="flex gap-2">
              {state === "RECORDING" ? (
                <>
                  <Button
                    variant="outline"
                    onClick={pauseRecording}
                    className="flex-1"
                  >
                    <Pause className="w-4 h-4 mr-2" />
                    Pause
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={stopRecording}
                    className="flex-1"
                  >
                    <Square className="w-4 h-4 mr-2" />
                    Done
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="outline"
                    onClick={resumeRecording}
                    className="flex-1"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Resume
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={stopRecording}
                    className="flex-1"
                  >
                    <Square className="w-4 h-4 mr-2" />
                    Done
                  </Button>
                </>
              )}
            </div>
          </div>
        )}

        {/* Review State */}
        {state === "REVIEW" && (
          <div className="space-y-4">
            {/* Playback */}
            <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
              {mode === "video" ? (
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover"
                  controls
                  playsInline
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center gap-4">
                  <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center">
                    <Mic className="w-12 h-12 text-primary" />
                  </div>
                  <audio
                    ref={videoRef as React.RefObject<HTMLAudioElement>}
                    controls
                    className="w-3/4"
                  />
                </div>
              )}
            </div>

            {/* Duration Info */}
            <div className="text-center text-sm text-muted-foreground">
              Recording duration: {formatDuration(duration)}
            </div>

            {/* Error Display */}
            {error && (
              <div className="flex items-center gap-2 text-destructive text-sm">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={reset}
                className="flex-1"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Re-record
              </Button>
              <Button
                onClick={submitRecording}
                className="flex-1"
              >
                <Send className="w-4 h-4 mr-2" />
                Send to Ralph
              </Button>
            </div>
          </div>
        )}

        {/* Uploading State */}
        {state === "UPLOADING" && (
          <div className="py-12 flex flex-col items-center justify-center gap-4">
            <Loader2 className="w-12 h-12 text-primary animate-spin" />
            <p className="text-lg font-medium">Uploading your message...</p>
            <p className="text-sm text-muted-foreground">This may take a moment</p>
          </div>
        )}

        {/* Submitted State */}
        {state === "SUBMITTED" && (
          <div className="py-8 flex flex-col items-center justify-center gap-4">
            <CheckCircle2 className="w-16 h-16 text-green-500" />
            <p className="text-xl font-semibold">Message sent!</p>
            <p className="text-center text-muted-foreground">
              I'll review your message and get back to you at {email} soon.
            </p>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              <X className="w-4 h-4 mr-2" />
              Close
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default LeaveALoom;
