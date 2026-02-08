"use client";

import { useMemo, useState } from "react";

export default function PhotoCard({
  filename,
  alt = "",
  className = "",
}) {
  const [loaded, setLoaded] = useState(false);

  const resolvedProjectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "";
  const resolvedBucket =
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ||
    (resolvedProjectId ? `${resolvedProjectId}.appspot.com` : "");

  const { thumbUrl, fullUrl } = useMemo(() => {
    const safeName = filename.endsWith(".avif") ? filename : `${filename}.avif`;
    const base = `https://firebasestorage.googleapis.com/v0/b/${resolvedBucket}/o`;

    const buildUrl = (folder) => {
      const path = `${folder}/${safeName}`;
      return `${base}/${encodeURIComponent(path)}?alt=media`;
    };

    return {
      thumbUrl: buildUrl("thumbnails"),
      fullUrl: buildUrl("images"),
    };
  }, [filename, resolvedBucket]);

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <img
        src={thumbUrl}
        alt={alt}
        className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${
          loaded ? "opacity-0" : "opacity-100 blur-xl scale-110"
        }`}
        aria-hidden={alt ? "false" : "true"}
      />
      <img
        src={fullUrl}
        alt={alt}
        className={`h-full w-full object-cover transition-opacity duration-700 ${
          loaded ? "opacity-100" : "opacity-0"
        }`}
        loading="lazy"
        onLoad={() => setLoaded(true)}
      />
    </div>
  );
}
