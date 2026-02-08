"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { getStorage, listAll, ref } from "firebase/storage";
import { firebaseApp } from "../lib/firebaseClient";

const getBucket = () => {
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "";
  return (
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ||
    (projectId ? `${projectId}.appspot.com` : "")
  );
};

const buildUrl = (bucket, folder, filename) => {
  const safeName = filename.endsWith(".avif") ? filename : `${filename}.avif`;
  const base = `https://firebasestorage.googleapis.com/v0/b/${bucket}/o`;
  const path = `${folder}/${safeName}`;
  return `${base}/${encodeURIComponent(path)}?alt=media`;
};

function SphereImage({ fullUrl, size, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="globe-card"
      style={{ width: size, border: "none", background: "transparent", padding: 0 }}
    >
      <img src={fullUrl} alt="" className="globe-image" loading="lazy" />
    </button>
  );
}

export default function Gallery({ folder = "images" }) {
  const [filenames, setFilenames] = useState([]);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState(null);
  const [viewport, setViewport] = useState({ width: 0, height: 0 });
  const globeRef = useRef(null);
  const angleRef = useRef(0);
  const lastTimeRef = useRef(0);

  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "";

  const sortedFilenames = useMemo(() => {
    return [...filenames].sort((a, b) => a.localeCompare(b));
  }, [filenames]);

  useEffect(() => {
    const updateViewport = () => {
      setViewport({ width: window.innerWidth, height: window.innerHeight });
    };

    updateViewport();
    window.addEventListener("resize", updateViewport);

    let active = true;

    const loadPhotos = async () => {
      if (!projectId) {
        setError("Missing NEXT_PUBLIC_FIREBASE_PROJECT_ID.");
        return;
      }

      try {
        const storage = getStorage(firebaseApp);
        const listRef = ref(storage, folder);
        const result = await listAll(listRef);

        if (!active) return;
        setFilenames(result.items.map((item) => item.name));
      } catch (err) {
        if (!active) return;
        setError("Failed to load photos from storage.");
      }
    };

    loadPhotos();

    return () => {
      active = false;
      window.removeEventListener("resize", updateViewport);
    };
  }, [folder, projectId]);

  useEffect(() => {
    let frameId;

    const baseSpeed = 360 / 70;
    const slowSpeed = 360 / 140;

    const tick = (time) => {
      if (!lastTimeRef.current) {
        lastTimeRef.current = time;
      }

      const delta = (time - lastTimeRef.current) / 1000;
      lastTimeRef.current = time;

      const speed = selected ? slowSpeed : baseSpeed;
      angleRef.current = (angleRef.current + delta * speed) % 360;

      if (globeRef.current) {
        globeRef.current.style.setProperty(
          "--globe-angle",
          `${angleRef.current}deg`
        );
      }

      frameId = requestAnimationFrame(tick);
    };

    frameId = requestAnimationFrame(tick);

    return () => {
      if (frameId) cancelAnimationFrame(frameId);
    };
  }, [selected]);

  const globeData = useMemo(() => {
    const count = sortedFilenames.length;
    if (!count) return [];

    const radius = Math.max(140, Math.min(viewport.width, 1000) * 0.32);
    const goldenAngle = Math.PI * (3 - Math.sqrt(5));

    return sortedFilenames.map((filename, index) => {
      const t = (index + 0.5) / count;
      const y = 1 - 2 * t;
      const radiusAtY = Math.sqrt(1 - y * y);
      const theta = goldenAngle * index;
      const x = Math.cos(theta) * radiusAtY;
      const z = Math.sin(theta) * radiusAtY;
      const depth = (z + 1) / 2;
      const scale = 0.75 + depth * 0.35;
      const opacity = 0.55 + depth * 0.45;

      return {
        filename,
        x: x * radius,
        y: y * radius,
        z: z * radius,
        scale,
        opacity,
        zIndex: Math.round(depth * 1000),
      };
    });
  }, [sortedFilenames, viewport.width]);

  const itemSize = useMemo(() => {
    if (viewport.width < 640) return 72;
    if (viewport.width < 1024) return 96;
    return 140;
  }, [viewport.width]);

  const bucket = getBucket();
  const selectedUrl = selected?.fullUrl || "";

  return (
    <section className="mx-auto w-full max-w-6xl px-4">
      {error ? (
        <p className="text-sm text-red-600">{error}</p>
      ) : (
        <div className="globe-scene">
          <div className="globe" ref={globeRef}>
            {globeData.map((item) => {
              const fullUrl = buildUrl(bucket, "images", item.filename);

              return (
                <div
                  key={item.filename}
                  className="globe-item"
                  style={{
                    transform: `translate3d(${item.x}px, ${item.y}px, ${item.z}px) scale(${item.scale})`,
                    opacity: item.opacity,
                    zIndex: item.zIndex,
                  }}
                >
                  <SphereImage
                    fullUrl={fullUrl}
                    size={itemSize}
                    onClick={() =>
                      setSelected({
                        filename: item.filename,
                        fullUrl,
                      })
                    }
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {selected
        ? createPortal(
            <div
              style={{
                position: "fixed",
                inset: 0,
                zIndex: 9999,
                display: "grid",
                placeItems: "center",
                background: "rgba(0, 0, 0, 0.7)",
                padding: "16px",
              }}
              onClick={() => setSelected(null)}
              role="dialog"
              aria-modal="true"
            >
              <button
                type="button"
                aria-label="Close"
                onClick={() => setSelected(null)}
                style={{
                  position: "fixed",
                  top: "20px",
                  right: "20px",
                  width: "48px",
                  height: "48px",
                  border: "none",
                  background: "transparent",
                  color: "#ffffff",
                  fontSize: "34px",
                  fontWeight: 300,
                  lineHeight: 1,
                  cursor: "pointer",
                }}
              >
                ×
              </button>
              <div
                style={{
                  width: "min(1200px, 100%)",
                  display: "grid",
                  gridTemplateColumns: "auto 280px",
                  gap: "28px",
                  alignItems: "stretch",
                  background: "transparent",
                  padding: 0,
                  height: "min(70vh, 640px)",
                }}
                onClick={(event) => event.stopPropagation()}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    height: "100%",
                    width: "auto",
                    maxWidth: "100%",
                  }}
                >
                  {selectedUrl ? (
                    <img
                      src={selectedUrl}
                      alt=""
                      style={{
                        width: "auto",
                        height: "100%",
                        maxHeight: "70vh",
                        maxWidth: "100%",
                        borderRadius: "0",
                        objectFit: "cover",
                        background: "transparent",
                      }}
                    />
                  ) : (
                    <p style={{ fontSize: "14px", color: "#dc2626" }}>
                      Missing image URL.
                    </p>
                  )}
                </div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    height: "100%",
                    color: "#e5e7eb",
                    textAlign: "right",
                    alignItems: "flex-end",
                  }}
                >
                  <p
                    style={{
                      fontSize: "20px",
                      lineHeight: 1.6,
                      opacity: 0.9,
                      fontWeight: 400,
                      margin: 0,
                    }}
                  >
                    PLACEHOLDER
                  </p>
                  <div>
                    <div
                      style={{
                        fontSize: "38px",
                        fontStyle: "normal",
                        fontWeight: 700,
                      }}
                    >
                      Sunburn
                    </div>
                    <div style={{ fontSize: "26px", opacity: 0.85, fontWeight: 400 }}>
                      @ The Hague, 2025
                    </div>
                  </div>
                </div>
              </div>
            </div>,
            document.body
          )
        : null}
    </section>
  );
}
