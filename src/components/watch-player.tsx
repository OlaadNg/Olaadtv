"use client";

import { useEffect, useState } from "react";

interface Movie {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  trailerUrl: string;
  thumbnail: string;
  genre: string[];
  year: number;
  duration: number;
  rating: number;
  isSeries: boolean;
  episodeCount: number;
}

export default function WatchPlayer({ movie, initialProgress }: { movie: Movie; initialProgress: number }) {
  const [progress, setProgress] = useState(initialProgress);

  useEffect(() => {
    setProgress(initialProgress);
  }, [initialProgress]);

  const updateHistory = async (currentTime: number) => {
    setProgress(currentTime);
    await fetch("/api/history", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ movieId: movie.id, progress: currentTime, duration: movie.duration }),
      credentials: "include",
    });
  };

  return (
    <div>
      <div className="rounded-[30px] border border-white/10 bg-zinc-950/85 p-3">
        <video
          controls
          className="aspect-video w-full rounded-[24px] bg-black"
          onTimeUpdate={(event) => updateHistory(event.currentTarget.currentTime || 0)}
          onLoadedMetadata={(event) => {
            if (initialProgress > 0) {
              event.currentTarget.currentTime = initialProgress;
            }
          }}
        >
          <source src={movie.videoUrl} type="video/mp4" />
        </video>
      </div>
      <div className="mt-4 rounded-2xl bg-white/5 p-3 text-sm">
        <p className="font-semibold">Continue progress</p>
        <p className="mt-1 text-zinc-300">{Math.round(progress)} seconds watched</p>
      </div>
    </div>
  );
}
