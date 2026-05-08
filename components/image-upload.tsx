/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useRef } from "react";
import { createBrowserSupabase } from "@/lib/supabase/client";
import { safeMessage, logError } from "@/lib/errors";
import { initials } from "@/lib/format";

const MAX_BYTES = 2 * 1024 * 1024; // 2MB
const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml"];

type Props = {
  bucket: "avatars" | "company-logos" | "banners";
  ownerUserId: string;
  currentPath: string | null;
  fallbackText: string;
  shape?: "circle" | "rounded";
  size?: number;
  onUploaded: (newPath: string) => Promise<void> | void;
};

/**
 * Reusable image upload sa preview, validacijom, loading state i errorima.
 * Path konvencija: {bucket}/{ownerUserId}/{timestamp}.ext
 * Vlasnik može upisati samo pod svoj user folder (RLS).
 */
export function ImageUpload({
  bucket, ownerUserId, currentPath, fallbackText,
  shape = "circle", size = 88, onUploaded
}: Props) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const supabase = createBrowserSupabase();
  const publicUrl = currentPath
    ? supabase.storage.from(bucket).getPublicUrl(currentPath).data.publicUrl
    : null;

  async function handleFile(file: File) {
    setError("");

    if (!ALLOWED.includes(file.type)) {
      setError("Dozvoljeni formati: JPG, PNG, WebP, GIF, SVG.");
      return;
    }
    if (file.size > MAX_BYTES) {
      setError("Slika je prevelika. Maksimalno 2 MB.");
      return;
    }

    setUploading(true);
    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const path = `${ownerUserId}/${Date.now()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(path, file, { upsert: false, cacheControl: "3600" });

    if (uploadError) {
      logError(`ImageUpload.${bucket}`, uploadError);
      setError(safeMessage(uploadError, "save"));
      setUploading(false);
      return;
    }

    // Ako postoji stari, obriši ga (best-effort)
    if (currentPath && currentPath !== path) {
      supabase.storage.from(bucket).remove([currentPath]).catch(() => {});
    }

    try {
      await onUploaded(path);
    } catch (e) {
      logError(`ImageUpload.${bucket}.onUploaded`, e as { message?: string });
      setError("Slika je upload-ovana ali nije sačuvana u profilu. Osvježi stranicu.");
    }

    setUploading(false);
  }

  const dim = `${size}px`;
  const radius = shape === "circle" ? "50%" : "16px";

  return (
    <div className="image-upload">
      <div
        className="image-upload-preview"
        style={{ width: dim, height: dim, borderRadius: radius }}
        aria-label={publicUrl ? "Trenutna slika" : "Inicijali"}
      >
        {publicUrl ? (
          <img src={publicUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: radius }} />
        ) : (
          <span>{initials(fallbackText) || "?"}</span>
        )}
        {uploading && <div className="image-upload-overlay">↑</div>}
      </div>

      <div className="image-upload-actions">
        <input
          ref={inputRef}
          type="file"
          accept={ALLOWED.join(",")}
          style={{ display: "none" }}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
            e.target.value = "";
          }}
        />
        <button
          type="button"
          className="btn ghost sm"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? "Slanje..." : publicUrl ? "Promijeni sliku" : "Otpremi sliku"}
        </button>
        {publicUrl && !uploading && (
          <button
            type="button"
            className="btn ghost sm"
            onClick={async () => {
              setUploading(true);
              await supabase.storage.from(bucket).remove([currentPath!]).catch(() => {});
              await onUploaded("");
              setUploading(false);
            }}
          >
            Ukloni
          </button>
        )}
      </div>

      <p className="hint" style={{ margin: 0 }}>JPG, PNG, WebP. Max 2 MB.</p>
      {error && <p className="notice error" role="alert" style={{ marginTop: 6 }}>{error}</p>}
    </div>
  );
}

/**
 * Pomoćni helper za prikaz avatar slike — koristi se u kartama i listama.
 * Pošto su bucket-i public, koristimo public URL bez auth-a.
 */
export function AvatarImage({
  bucket, path, fallback, size = 40, shape = "circle"
}: {
  bucket: "avatars" | "company-logos" | "banners";
  path: string | null | undefined;
  fallback: string;
  size?: number;
  shape?: "circle" | "rounded";
}) {
  const supabase = createBrowserSupabase();
  const url = path ? supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl : null;
  const radius = shape === "circle" ? "50%" : "10px";
  const dim = `${size}px`;

  return (
    <div
      className="avatar-image"
      style={{ width: dim, height: dim, borderRadius: radius, fontSize: Math.round(size * 0.36) }}
      aria-label={fallback}
    >
      {url ? (
        <img src={url} alt={fallback} style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: radius }} />
      ) : (
        <span>{initials(fallback) || "?"}</span>
      )}
    </div>
  );
}
