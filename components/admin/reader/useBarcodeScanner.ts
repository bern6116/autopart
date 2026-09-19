"use client";
// ── useBarcodeScanner ─────────────────────────────────────────
// Encapsulates ZXing camera scanning + BarcodeDetector fallback.
// Fully cleans up on unmount — no memory leaks, no stale streams.

import { useRef, useState, useCallback, useEffect } from "react";
import type { RefObject } from "react";

// ── BarcodeDetector Web API type shim ─────────────────────────
// The BarcodeDetector API (Chrome 83+, Edge 83+, Safari 17.4+) is
// not in TypeScript's default lib yet. We declare just enough here.
interface BarcodeDetectorResult {
  rawValue: string;
  format: string;
}
interface BarcodeDetectorAPI {
  detect(source: HTMLVideoElement | HTMLImageElement | ImageBitmap): Promise<BarcodeDetectorResult[]>;
}
interface BarcodeDetectorConstructor {
  new(options?: { formats?: string[] }): BarcodeDetectorAPI;
}
// Augment Window so we can safely access window.BarcodeDetector
declare global {
  interface Window {
    BarcodeDetector?: BarcodeDetectorConstructor;
  }
}

export type ScannerStatus =
  | "idle"
  | "requesting"
  | "ready"
  | "scanning"
  | "detected"
  | "error"
  | "denied"
  | "unavailable";

export interface UseBarcodeScanner {
  videoRef: RefObject<HTMLVideoElement | null>;
  status: ScannerStatus;
  lastCode: string;
  errorMessage: string;
  facingMode: "environment" | "user";
  startScanner: () => Promise<void>;
  stopScanner: () => void;
  switchCamera: () => void;
  resetDetected: () => void;
}

// Debounce: same code won't fire twice within this window (ms)
const DEBOUNCE_MS = 2000;

export function useBarcodeScanner(
  onDetected: (code: string) => void
): UseBarcodeScanner {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const zxingRef = useRef<import("@zxing/library").BrowserMultiFormatReader | null>(null);
  const lastCodeRef = useRef<string>("");
  const lastTimeRef = useRef<number>(0);
  const animFrameRef = useRef<number>(0);
  const detectorRef = useRef<BarcodeDetectorAPI | null>(null);

  const [status, setStatus] = useState<ScannerStatus>("idle");
  const [lastCode, setLastCode] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [facingMode, setFacingMode] = useState<"environment" | "user">("environment");

  // Safe check — only run client-side
  const hasBarcodeDetector =
    typeof window !== "undefined" && typeof window.BarcodeDetector !== "undefined";

  // ── Debounced detect callback ─────────────────────────────
  const handleCode = useCallback(
    (code: string) => {
      if (!code) return;
      const now = Date.now();
      if (code === lastCodeRef.current && now - lastTimeRef.current < DEBOUNCE_MS) return;
      lastCodeRef.current = code;
      lastTimeRef.current = now;
      setLastCode(code);
      setStatus("detected");
      onDetected(code);
    },
    [onDetected]
  );

  // ── BarcodeDetector RAF loop (Chrome/Edge/Safari native) ──
  const startDetectorLoop = useCallback(() => {
    if (!hasBarcodeDetector || !window.BarcodeDetector) return;

    if (!detectorRef.current) {
      try {
        detectorRef.current = new window.BarcodeDetector({
          formats: [
            "ean_13", "ean_8", "upc_a", "upc_e",
            "code_128", "code_39", "itf", "qr_code",
          ],
        });
      } catch {
        // API present but format list unsupported — try empty formats
        try {
          detectorRef.current = new window.BarcodeDetector();
        } catch {
          return; // Fallback to ZXing
        }
      }
    }

    const loop = async () => {
      if (!videoRef.current || !detectorRef.current) return;
      if (videoRef.current.readyState >= 2) {
        try {
          const results = await detectorRef.current.detect(videoRef.current);
          if (results.length > 0) handleCode(results[0].rawValue);
        } catch {
          // Frame not ready yet — continue looping
        }
      }
      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);
  }, [hasBarcodeDetector, handleCode]);

  // ── ZXing fallback (Firefox, older browsers) ──────────────
  const startZXing = useCallback(async () => {
    try {
      const { BrowserMultiFormatReader, NotFoundException } = await import("@zxing/library");
      const reader = new BrowserMultiFormatReader();
      zxingRef.current = reader;

      if (!videoRef.current || !streamRef.current) return;

      videoRef.current.srcObject = streamRef.current;
      await videoRef.current.play();

      reader.decodeFromStream(streamRef.current, videoRef.current, (result, err) => {
        if (result) handleCode(result.getText());
        // NotFoundException fires every frame with no barcode — suppress it
        if (err && !(err instanceof NotFoundException)) {
          console.warn("[BarcodeReader] ZXing decode error:", err);
        }
      });
    } catch (err) {
      console.error("[BarcodeReader] ZXing init error:", err);
      setStatus("error");
      setErrorMessage("Scanner initialization failed. Try refreshing the page.");
    }
  }, [handleCode]);

  // ── Start scanner ─────────────────────────────────────────
  const startScanner = useCallback(async () => {
    setStatus("requesting");
    setErrorMessage("");

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      setStatus("scanning");

      if (hasBarcodeDetector) {
        startDetectorLoop();
      } else {
        await startZXing();
      }
    } catch (err) {
      const e = err as DOMException;
      if (e.name === "NotAllowedError" || e.name === "PermissionDeniedError") {
        setStatus("denied");
        setErrorMessage("Camera access was denied. Please allow camera permission and try again.");
      } else if (e.name === "NotFoundError" || e.name === "DevicesNotFoundError") {
        setStatus("unavailable");
        setErrorMessage("No camera found on this device.");
      } else if (e.name === "NotReadableError" || e.name === "TrackStartError") {
        setStatus("unavailable");
        setErrorMessage("Camera is already in use by another application.");
      } else {
        setStatus("error");
        setErrorMessage("Could not start the camera. Please try again.");
      }
      console.error("[BarcodeReader] getUserMedia error:", err);
    }
  }, [facingMode, hasBarcodeDetector, startDetectorLoop, startZXing]);

  // ── Stop scanner ──────────────────────────────────────────
  const stopScanner = useCallback(() => {
    cancelAnimationFrame(animFrameRef.current);

    if (zxingRef.current) {
      try { zxingRef.current.reset(); } catch { /* ignore */ }
      zxingRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setStatus("idle");
  }, []);

  // ── Switch camera front/back ──────────────────────────────
  const switchCamera = useCallback(() => {
    stopScanner();
    setFacingMode((m) => (m === "environment" ? "user" : "environment"));
    setStatus("idle");
  }, [stopScanner]);

  const resetDetected = useCallback(() => setStatus("scanning"), []);

  // ── Full cleanup on unmount ───────────────────────────────
  useEffect(() => {
    return () => {
      cancelAnimationFrame(animFrameRef.current);
      if (zxingRef.current) { try { zxingRef.current.reset(); } catch { /* ignore */ } }
      if (streamRef.current) { streamRef.current.getTracks().forEach((t) => t.stop()); }
    };
  }, []);

  return {
    videoRef, status, lastCode, errorMessage, facingMode,
    startScanner, stopScanner, switchCamera, resetDetected,
  };
}
