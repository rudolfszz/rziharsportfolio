"use client";

import { useEffect, useMemo, useState } from "react";
import { getStorage, listAll, ref } from "firebase/storage";
import { firebaseApp } from "../lib/firebaseClient";
import PhotoCard from "./PhotoCard";

export default function Gallery({ folder = "images" }) {
  const [filenames, setFilenames] = useState([]);
  const [error, setError] = useState("");

  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "";

  const sortedFilenames = useMemo(() => {
    return [...filenames].sort((a, b) => a.localeCompare(b));
  }, [filenames]);

  useEffect(() => {
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
    };
  }, [folder, projectId]);

  return (
    <section className="mx-auto w-full max-w-5xl px-4 py-12">
      {error ? (
        <p className="text-sm text-red-600">{error}</p>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {sortedFilenames.map((filename) => (
            <PhotoCard
              key={filename}
              filename={filename}
              alt={""}
              className="aspect-video w-full rounded-2xl bg-neutral-200"
            />
          ))}
        </div>
      )}
    </section>
  );
}
