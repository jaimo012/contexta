"use client";

import { useRef, useCallback, useEffect } from "react";
import { useMeetingStore } from "@/store/useMeetingStore";
import { apiUrl } from "@/utils/apiUrl";

const VOLUME_THRESHOLD = 18;
const SILENCE_DEBOUNCE_MS = 1500;
const STT_TIMEOUT_MS = 15_000;
const MAX_STT_FAILURES = 5;
const CHUNK_DURATION_MS = 5000;

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
  const chunkTimerRef = useRef<number | null>(null);
  const lastSpeakTimeRef = useRef<number>(0);
  const mimeTypeRef = useRef<string>("");
  const hadSpeechInChunkRef = useRef<boolean>(false);
  const isStoppingRef = useRef<boolean>(false);
  const startChunkRecorderRef = useRef<(() => void) | null>(null);

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
        hadSpeechInChunkRef.current = true;
        setIsSpeaking(true);
      } else if (now - lastSpeakTimeRef.current > SILENCE_DEBOUNCE_MS) {
        setIsSpeaking(false);
      }

      rafIdRef.current = requestAnimationFrame(loop);
    };

    rafIdRef.current = requestAnimationFrame(loop);
  }, [setIsSpeaking]);

  const sendChunkToSTT = useCallback(async (chunk: Blob) => {
    // Check if STT is paused due to consecutive failures or network issues
    const { sttPaused } = useMeetingStore.getState();
    if (sttPaused) return;

    try {
      const ext = getChunkExtension(mimeTypeRef.current);
      const formData = new FormData();
      formData.append("audio", chunk, `chunk.${ext}`);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), STT_TIMEOUT_MS);

      const res = await fetch(apiUrl("/api/stt"), {
        method: "POST",
        body: formData,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      const data = await res.json();

      if (res.ok && data.text && data.text.trim() !== "") {
        addTranscript({
          id: generateId(),
          text: data.text,
          timestamp: Date.now(),
        });
        console.log(`[STT] "${data.text}"`);
      }

      // Success: reset error count
      const { sttErrorCount } = useMeetingStore.getState();
      if (sttErrorCount > 0) {
        useMeetingStore.getState().setSttErrorCount(0);
      }
    } catch (err) {
      const store = useMeetingStore.getState();
      const newCount = store.sttErrorCount + 1;
      store.setSttErrorCount(newCount);

      if (err instanceof Error && err.name === "AbortError") {
        console.warn("[STT] 요청 타임아웃 (15초 초과)");
      } else {
        console.error("[STT] 전송 실패:", err);
      }

      if (newCount >= MAX_STT_FAILURES) {
        store.setSttPaused(true);
        store.setLastError({
          type: "stt",
          message: `음성 인식이 ${MAX_STT_FAILURES}회 연속 실패하여 일시 중지되었습니다. 네트워크를 확인해 주세요.`,
          timestamp: Date.now(),
          retryable: true,
        });
        console.warn(`[STT] ${MAX_STT_FAILURES}회 연속 실패 — STT 일시 중지`);
      }
    }
  }, [addTranscript]);

  const startChunkRecorder = useCallback(() => {
    const stream = streamRef.current;
    if (!stream) return;

    const mimeType = mimeTypeRef.current;
    const recorderOptions: MediaRecorderOptions = {};
    if (mimeType) {
      recorderOptions.mimeType = mimeType;
    }

    let recorder: MediaRecorder;
    try {
      recorder = new MediaRecorder(stream, recorderOptions);
    } catch (err) {
      console.error("[STT] MediaRecorder 생성 실패:", err);
      return;
    }

    recorderRef.current = recorder;
    hadSpeechInChunkRef.current = false;

    recorder.ondataavailable = (e) => {
      // MediaRecorder stopped → this Blob is a complete, self-contained file
      // (contains container header + codec init data), so it can be decoded
      // independently by Deepgram.
      if (e.data.size > 0 && hadSpeechInChunkRef.current) {
        addAudioChunk(e.data);
        sendChunkToSTT(e.data);
      }
    };

    recorder.onstop = () => {
      // Keep the loop going as long as we're still recording (i.e. user
      // hasn't called stopRecording). Each new MediaRecorder produces a
      // fresh, independently decodable file.
      if (!isStoppingRef.current && streamRef.current) {
        startChunkRecorderRef.current?.();
      }
    };

    try {
      recorder.start(); // no timeslice → single complete blob on stop()
    } catch (err) {
      console.error("[STT] MediaRecorder 시작 실패:", err);
      return;
    }

    // Schedule stop to finalize this chunk after CHUNK_DURATION_MS
    chunkTimerRef.current = window.setTimeout(() => {
      if (recorderRef.current && recorderRef.current.state === "recording") {
        recorderRef.current.stop();
      }
    }, CHUNK_DURATION_MS);
  }, [addAudioChunk, sendChunkToSTT]);

  useEffect(() => {
    startChunkRecorderRef.current = startChunkRecorder;
  }, [startChunkRecorder]);

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

      mimeTypeRef.current = getSupportedMimeType();

      clearAudioChunks();
      isStoppingRef.current = false;
      setIsRecording(true);

      startChunkRecorder();
    } catch (err) {
      console.error("마이크 권한 요청 실패:", err);
      setMicGranted(false);
      alert("마이크 권한이 필요합니다. 설정에서 마이크 접근을 허용해 주세요.");
    }
  }, [setMicGranted, setIsRecording, clearAudioChunks, detectSound, startChunkRecorder]);

  const stopRecording = useCallback(() => {
    isStoppingRef.current = true;

    if (chunkTimerRef.current !== null) {
      clearTimeout(chunkTimerRef.current);
      chunkTimerRef.current = null;
    }

    if (rafIdRef.current !== null) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }

    if (recorderRef.current && recorderRef.current.state !== "inactive") {
      // Fire one last ondataavailable for any speech captured since the
      // last chunk boundary, then onstop will NOT restart because
      // isStoppingRef is true.
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
    hadSpeechInChunkRef.current = false;
    setIsRecording(false);
    setIsSpeaking(false);
  }, [setIsRecording, setIsSpeaking]);

  return { startRecording, stopRecording, analyserRef };
}
