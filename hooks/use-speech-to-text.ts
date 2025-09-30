'use client';

import { useState, useRef, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

export const useSpeechToText = () => {
  const { toast } = useToast();
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const transcribeAudio = useCallback(async (audioBlob: Blob): Promise<string | null> => {
    setIsProcessing(true);
    try {
      const response = await new Promise<{ text: string }>(resolve =>
        setTimeout(() => resolve({ text: 'This is a demo transcription.' }), 1500)
      );
      const transcript = response.text?.trim();
      if (!transcript) {
        toast({ title: 'No Speech Detected', description: 'Please try speaking more clearly', variant: 'destructive' });
        return null;
      }
      return transcript;
    } catch (error) {
      console.error('Transcription failed:', error);
      toast({ title: 'Transcription Failed', description: 'Could not process voice note. Please check your backend connection.', variant: 'destructive' });
      return null;
    } finally {
      setIsProcessing(false);
    }
  }, [toast]);

  const startRecording = useCallback(async (): Promise<boolean> => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, sampleRate: 16000 } });
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm;codecs=opus' });
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      mediaRecorder.ondataavailable = e => { if (e.data.size > 0) audioChunksRef.current.push(e.data); };
      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const transcript = await transcribeAudio(audioBlob);
        if (transcript) toast({ title: 'Voice Note Transcribed', description: 'Your speech has been converted to text!' });
        stream.getTracks().forEach(t => t.stop());
      };
      mediaRecorder.start(1000);
      setIsRecording(true);
      toast({ title: 'Recording Started', description: 'Speak clearly into your microphone...' });
      return true;
    } catch (error) {
      console.error('Failed to start recording:', error);
      toast({ title: 'Recording Failed', description: 'Could not access microphone. Please check permissions.', variant: 'destructive' });
      return false;
    }
  }, [transcribeAudio, toast]);

  const stopRecording = useCallback((): Promise<string | null> => {
    return new Promise(resolve => {
      if (mediaRecorderRef.current && isRecording) {
        const mediaRecorder = mediaRecorderRef.current;
        const handleStop = async () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          const transcript = await transcribeAudio(audioBlob);
          resolve(transcript);
          mediaRecorder.removeEventListener('stop', handleStop);
        };
        mediaRecorder.addEventListener('stop', handleStop);
        mediaRecorder.stop();
        setIsRecording(false);
        toast({ title: 'Recording Stopped', description: 'Processing your voice note...' });
      } else resolve(null);
    });
  }, [isRecording, transcribeAudio, toast]);

  const toggleRecording = useCallback(async (): Promise<string | null> => {
    if (isRecording) return await stopRecording();
    await startRecording();
    return null;
  }, [isRecording, startRecording, stopRecording]);

  return { isRecording, isProcessing, startRecording, stopRecording, toggleRecording };
};


