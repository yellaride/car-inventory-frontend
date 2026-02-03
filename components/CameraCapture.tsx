'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Camera, Video, Square, Loader2 } from 'lucide-react';

type CaptureMode = 'photo' | 'video';

interface CameraCaptureProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCapture: (file: File) => void;
  /** 'photo' = only photo, 'video' = only video, 'both' = show both options */
  mode?: 'photo' | 'video' | 'both';
}

export function CameraCapture({
  open,
  onOpenChange,
  onCapture,
  mode = 'both',
}: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRecording, setIsRecording] = useState(false);

  const startCamera = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: mode !== 'photo',
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err: any) {
      setError(err?.message?.includes('Permission') ? 'Camera permission denied.' : 'Could not access camera.');
    } finally {
      setLoading(false);
    }
  }, [mode]);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  useEffect(() => {
    if (open) {
      startCamera();
    }
    return () => {
      stopCamera();
    };
  }, [open, startCamera, stopCamera]);

  const capturePhoto = () => {
    const video = videoRef.current;
    if (!video || !streamRef.current || video.readyState < 2) return;

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0);

    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const file = new File([blob], `camera-${Date.now()}.jpg`, { type: 'image/jpeg' });
        onCapture(file);
        onOpenChange(false);
      },
      'image/jpeg',
      0.92
    );
  };

  const startRecording = () => {
    const video = videoRef.current;
    if (!video || !streamRef.current) return;

    const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
      ? 'video/webm;codecs=vp9'
      : 'video/webm';
    const recorder = new MediaRecorder(streamRef.current, { mimeType, videoBitsPerSecond: 2500000 });
    mediaRecorderRef.current = recorder;
    chunksRef.current = [];

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };
    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: mimeType.split(';')[0] });
      const ext = mimeType.includes('webm') ? 'webm' : 'mp4';
      const file = new File([blob], `camera-video-${Date.now()}.${ext}`, { type: blob.type });
      onCapture(file);
      onOpenChange(false);
    };

    recorder.start(1000);
    setIsRecording(true);
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current = null;
    }
    setIsRecording(false);
  };

  const handleClose = (open: boolean) => {
    if (!open && isRecording) stopRecording();
    stopCamera();
    setError(null);
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-xl p-0 overflow-hidden">
        <DialogHeader className="p-4 pb-0">
          <DialogTitle>Camera</DialogTitle>
        </DialogHeader>

        <div className="relative bg-black aspect-video">
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="h-10 w-10 animate-spin text-white" />
            </div>
          )}
          {error && (
            <div className="absolute inset-0 flex items-center justify-center p-4 text-center text-white bg-black/80">
              <p>{error}</p>
            </div>
          )}
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
            style={{ display: loading || error ? 'none' : 'block' }}
          />
          {isRecording && (
            <div className="absolute top-3 left-3 flex items-center gap-2 bg-red-600 text-white text-sm font-medium px-2 py-1 rounded">
              <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
              Recording...
            </div>
          )}
        </div>

        <DialogFooter className="p-4 flex-row justify-center gap-3 sm:justify-center">
          {(mode === 'photo' || mode === 'both') && (
            <Button
              onClick={capturePhoto}
              disabled={loading || !!error || isRecording}
              className="gap-2"
            >
              <Camera className="h-4 w-4" />
              Take Photo
            </Button>
          )}
          {(mode === 'video' || mode === 'both') && (
            <>
              {!isRecording ? (
                <Button
                  onClick={startRecording}
                  disabled={loading || !!error}
                  variant="secondary"
                  className="gap-2"
                >
                  <Video className="h-4 w-4" />
                  Record Video
                </Button>
              ) : (
                <Button onClick={stopRecording} variant="destructive" className="gap-2">
                  <Square className="h-4 w-4" />
                  Stop
                </Button>
              )}
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
