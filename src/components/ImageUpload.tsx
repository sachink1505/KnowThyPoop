"use client";

import { useRef, useState } from "react";
import { Camera, ImageIcon, ShieldCheck, X } from "lucide-react";
import { isNative } from "@/lib/native";

const MAX_BYTES = 5 * 1024 * 1024;
const ACCEPTED = ["image/jpeg", "image/png"];

class PermissionDeniedError extends Error {
  constructor(public kind: "camera" | "photos") {
    super(`${kind} permission denied`);
    this.name = "PermissionDeniedError";
  }
}

async function captureNative(source: "camera" | "gallery"): Promise<File | null> {
  // Dynamic import so the browser bundle never pulls in native-only code.
  const { Camera: CapCamera, CameraResultType, CameraSource } = await import(
    "@capacitor/camera"
  );

  // For camera source, explicitly request the camera permission.
  // For gallery on Android, the system file picker handles its own access —
  // checking the `photos` permission here returns inconsistent states, so we
  // let getPhoto handle it. For iOS photos permission, we still request it.
  if (source === "camera") {
    try {
      const current = await CapCamera.checkPermissions();
      if (current.camera !== "granted") {
        const requested = await CapCamera.requestPermissions({
          permissions: ["camera"],
        });
        if (requested.camera !== "granted") {
          throw new PermissionDeniedError("camera");
        }
      }
    } catch (e) {
      if (e instanceof PermissionDeniedError) throw e;
      // checkPermissions itself can throw on devices missing Play Services; fall through.
    }
  }

  const photo = await CapCamera.getPhoto({
    quality: 85,
    allowEditing: false,
    resultType: CameraResultType.DataUrl,
    source: source === "camera" ? CameraSource.Camera : CameraSource.Photos,
    saveToGallery: false,
    correctOrientation: true,
  });
  if (!photo.dataUrl) return null;
  const res = await fetch(photo.dataUrl);
  const blob = await res.blob();
  const type = blob.type || "image/jpeg";
  const ext = type === "image/png" ? "png" : "jpg";
  return new File([blob], `capture.${ext}`, { type });
}

type Props = {
  value: File | null;
  onChange: (file: File | null) => void;
};

export function ImageUpload({ value, onChange }: Props) {
  const cameraRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  function handleFile(file: File | undefined) {
    if (!file) return;
    if (!ACCEPTED.includes(file.type)) {
      setError("Only JPEG or PNG images are supported.");
      return;
    }
    if (file.size > MAX_BYTES) {
      setError("Image must be 5MB or smaller.");
      return;
    }
    setError("");
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(URL.createObjectURL(file));
    onChange(file);
  }

  async function handleNativePick(source: "camera" | "gallery") {
    try {
      const file = await captureNative(source);
      handleFile(file ?? undefined);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "";
      // User cancelled picker — silent.
      if (/cancel/i.test(msg)) return;
      if (err instanceof Error && err.name === "PermissionDeniedError") {
        setError(
          source === "camera"
            ? "Camera access denied. Enable it in Settings."
            : "Photos access denied. Enable it in Settings."
        );
        return;
      }
      setError(
        source === "camera"
          ? "Couldn't open the camera. Try the gallery instead."
          : "Couldn't open the gallery. Try again."
      );
    }
  }

  function handleRemove() {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setError("");
    onChange(null);
    if (cameraRef.current) cameraRef.current.value = "";
    if (galleryRef.current) galleryRef.current.value = "";
  }

  return (
    <div className="space-y-2">
      <p className="text-xs text-stone-500 leading-relaxed">
        Adding a picture helps analyse your poop health and suggest corrective
        action.
      </p>

      {value && previewUrl ? (
        <div className="relative w-full rounded-xl overflow-hidden border border-stone-200 bg-stone-100">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={previewUrl}
            alt="Selected preview"
            className="w-full h-56 object-cover"
          />
          <button
            type="button"
            onClick={handleRemove}
            className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center active:scale-95 transition-transform"
            aria-label="Remove image"
          >
            <X className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() =>
              isNative()
                ? handleNativePick("gallery")
                : galleryRef.current?.click()
            }
            className="absolute bottom-2 right-2 px-3 h-8 rounded-full bg-white/90 text-stone-700 text-xs font-medium active:scale-95 transition-transform"
          >
            Replace
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() =>
              isNative()
                ? handleNativePick("camera")
                : cameraRef.current?.click()
            }
            className="h-24 rounded-xl border-2 border-dashed border-stone-200 bg-white flex flex-col items-center justify-center gap-1 hover:border-amber-300 active:scale-95 transition-all"
          >
            <Camera className="w-5 h-5 text-stone-500" />
            <span className="text-xs font-medium text-stone-600">
              Take photo
            </span>
          </button>
          <button
            type="button"
            onClick={() =>
              isNative()
                ? handleNativePick("gallery")
                : galleryRef.current?.click()
            }
            className="h-24 rounded-xl border-2 border-dashed border-stone-200 bg-white flex flex-col items-center justify-center gap-1 hover:border-amber-300 active:scale-95 transition-all"
          >
            <ImageIcon className="w-5 h-5 text-stone-500" />
            <span className="text-xs font-medium text-stone-600">
              Upload from gallery
            </span>
          </button>
        </div>
      )}

      <input
        ref={cameraRef}
        type="file"
        accept="image/jpeg,image/png"
        capture="environment"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
      <input
        ref={galleryRef}
        type="file"
        accept="image/jpeg,image/png"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />

      {error && <p className="text-xs text-red-500">{error}</p>}

      <div className="flex items-start gap-2 bg-stone-50 rounded-xl p-3 border border-stone-100">
        <ShieldCheck className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
        <p className="text-xs text-stone-500 leading-relaxed">
          Images are private and encrypted. Never shared or used without
          consent.
        </p>
      </div>
    </div>
  );
}
