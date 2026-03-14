"use client";

import { useRef, useCallback } from "react";
import { useMeetingStore } from "@/store/useMeetingStore";
import { apiUrl } from "@/utils/apiUrl";

const VOLUME_THRESHOLD = 18;
const SILENCE_DEBOUNCE_MS = 1500;

const AudioContextCompat =
  typeof window !== "undefined"
    ? window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    : null;

function getSupportedMimeType(): string {
  if (typeof MediaRecorder === "undefined") return "";
  const candidates = [
    "audio/webm;codecs=opus",
    "audio/webm",
    "audio/mp4",
    "audio/aac",
    "audio/ogg;codecs=opus",
  ];
  for (const mime of candidates) {
    if (MediaRecorder.isTypeSupported(mime)) return mime;
  }
  return "";
}

function generateId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

function getChunkExtension(mimeType: string): string {
  if (mimeType.includes("webm")) return "webm";
  if (mimeType.includes("mp4") || mimeType.includes("aac")) return "mp4";
  if (mimeType.includes("ogg")) return "ogg";
  return "bin";
}

export function useAudioRecorder() {
  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const rafIdRef = useRef<number | null>(null);
  const lastSpeakTimeRef = useRef<number>(0);
  const mimeTypeRef = useRef<string>("");

  const isSendingRef = useRef(false);

  const setMicGranted = useMeetingStore((s) => s.setMicGranted);
  const setIsRecording = useMeetingStore((s) => s.setIsRecording);
  const setIsSpeaking = useMeetingStore((s) => s.setIsSpeaking);
  const addAudioChunk = useMeetingStore((s) => s.addAudioChunk);
  const clearAudioChunks = useMeetingStore((s) => s.clearAudioChunks);
  const addTranscript = useMeetingStore((s) => s.addTranscript);

  const detectSound = useCallback(() => {
    const analyser = analyserRef.current;
    if (!analyser) return;

    const dataArray = new Uint8Array(analyser.frequencyBinCount);

    const loop = () => {
      if (!analyserRef.current) return;

      analyser.getByteFrequencyData(dataArray);

      let sum = 0;
      for (let i = 0; i < dataArray.length; i++) {
        sum += dataArray[i];
      }
      const average = sum / dataArray.length;

      const now = Date.now();

      if (average >= VOLUME_THRESHOLD) {
        lastSpeakTimeRef.current = now;
        setIsSpeaking(true);
      } else if (now - lastSpeakTimeRef.current > SILENCE_DEBOUNCE_MS) {
        setIsSpeaking(false);
      }

      rafIdRef.current = requestAnimationFrame(loop);
    };

    rafIdRef.current = requestAnimationFrame(loop);
  }, [setIsSpeaking]);

  const sendChunkToSTT = useCallback(async (chunk: Blob) => {
    if (isSendingRef.current) return;
    isSendingRef.current = true;

    try {
      const ext = getChunkExtension(mimeTypeRef.current);
      const formData = new FormData();
      formData.append("audio", chunk, `chunk.${ext}`);

      const res = await fetch(apiUrl("/api/stt"), { method: "POST", body: formData });
      const data = await res.json();

      if (res.ok && data.text && data.text.trim() !== "") {
        addTranscript({
          id: generateId(),
          text: data.text,
          timestamp: Date.now(),
        });
        console.log(`[STT] "${data.text}"`);
      }
    } catch (err) {
      console.error("[STT] 전송 실패:", err);
    } finally {
      isSendingRef.current = false;
    }
  }, [addTranscript]);

  const startRecording = useCallback(async () => {
    if (!AudioContextCompat) {
      alert("이 환경에서는 오디오 기능을 지원하지 않습니다.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      setMicGranted(true);

      const audioContext = new AudioContextCompat();
      audioContextRef.current = audioContext;

      if (audioContext.state === "suspended") {
        await audioContext.resume();
      }

      const source = audioContext.createMediaStreamSource(stream);
      sourceRef.current = source;

      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 512;
      analyserRef.current = analyser;

      source.connect(analyser);

      detectSound();

      const mimeType = getSupportedMimeType();
      mimeTypeRef.current = mimeType;

      const recorderOptions: MediaRecorderOptions = {};
      if (mimeType) {
        recorderOptions.mimeType = mimeType;
      }

      const recorder = new MediaRecorder(stream, recorderOptions);
      recorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        const speaking = useMeetingStore.getState().isSpeaking;
        if (e.data.size > 0 && speaking) {
          addAudioChunk(e.data);
          sendChunkToSTT(e.data);
        }
      };

      clearAudioChunks();
      recorder.start(1000);
      setIsRecording(true);
    } catch (err) {
      console.error("마이크 권한 요청 실패:", err);
      setMicGranted(false);
      alert("마이크 권한이 필요합니다. 설정에서 마이크 접근을 허용해 주세요.");
    }
  }, [setMicGranted, setIsRecording, addAudioChunk, clearAudioChunks, detectSound, sendChunkToSTT]);

  const stopRecording = useCallback(() => {
    if (rafIdRef.current !== null) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }

    if (recorderRef.current && recorderRef.current.state !== "inactive") {
      recorderRef.current.stop();
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    sourceRef.current = null;
    analyserRef.current = null;
    recorderRef.current = null;
    mimeTypeRef.current = "";
    setIsRecording(false);
    setIsSpeaking(false);
  }, [setIsRecording, setIsSpeaking]);

  return { startRecording, stopRecording, analyserRef };
}
