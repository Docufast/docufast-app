"use client";

import { useRef, useState } from "react";

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

export default function FileUpload({
  label,
  onFileSelect,
  onUploadComplete,
  accept,
}: {
  label?: string;
  onFileSelect?: (file: File | null) => void;
  onUploadComplete?: (key: string) => void;
  accept?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploaded, setUploaded] = useState(false);

  async function handleFile(selected: File | null) {
    setFile(selected);
    setUploaded(false);
    setUploadError(null);
    onFileSelect?.(selected);

    if (!selected) return;
    if (!API_URL) {
      setUploadError("Upload service isn't configured yet.");
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", selected);

      const res = await fetch(`${API_URL}/upload`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Upload failed.");
      }

      setUploaded(true);
      onUploadComplete?.(data.key);
    } catch (err: any) {
      setUploadError(err.message || "Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0] || null)}
      />

      {!file ? (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            const dropped = e.dataTransfer.files?.[0];
            if (dropped) handleFile(dropped);
          }}
          className={`w-full rounded-input border-4 border-dashed border-brand-black px-3 py-6 text-center text-sm transition-colors ${
            dragging ? "bg-brand-yellow/20" : "text-brand-gray"
          }`}
        >
          {label || "Click or drag a file here"}
        </button>
      ) : (
        <div className="flex items-center justify-between rounded-input border-4 border-brand-black px-3 py-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-brand-black">{file.name}</p>
            <p className="text-xs text-brand-gray">
              {formatSize(file.size)}
              {uploading && " · Uploading…"}
              {uploaded && " · Uploaded ✓"}
            </p>
            {uploadError && <p className="text-xs text-brand-error">{uploadError}</p>}
          </div>
          <button
            type="button"
            onClick={() => handleFile(null)}
            className="ml-3 shrink-0 rounded-card border-2 border-brand-black px-2 py-1 text-xs font-bold uppercase"
          >
            Replace
          </button>
        </div>
      )}
    </div>
  );
}
