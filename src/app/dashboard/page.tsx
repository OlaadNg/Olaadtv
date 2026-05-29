"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface MovieItem {
  id: string;
  title: string;
  thumbnail: string;
  genre: string[];
}

export default function DashboardPage() {
  const [user, setUser] = useState<{ name: string; email: string; subscriptionStatus: string } | null>(null);
  const [watchlist, setWatchlist] = useState<MovieItem[]>([]);
  const [history, setHistory] = useState<{ movieId: string; progress: number; duration: number }[]>([]);
  const [subscription, setSubscription] = useState<{ planType: string; status: string } | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const [meResponse, watchlistResponse, historyResponse, subscriptionResponse] = await Promise.all([
        fetch("/api/auth/me", { credentials: "include" }),
        fetch("/api/watchlist", { credentials: "include" }),
        fetch("/api/history", { credentials: "include" }),
        fetch("/api/subscription", { credentials: "include" }),
      ]);

      const meData = await meResponse.json();
      const watchlistData = await watchlistResponse.json();
      const historyData = await historyResponse.json();
      const subscriptionData = await subscriptionResponse.json();

      setUser(meData.user);
      setSubscription(subscriptionData.subscription);

      if (watchlistData.watchlist?.length) {
        const movies = await Promise.all(
          watchlistData.watchlist.map(async (movieId: string) => {
            const response = await fetch(`/api/movies/${movieId}`);
            const data = await response.json();
            return data.movie;
          })
        );
        setWatchlist(movies);
      }

      if (historyData.history?.length) {
        const mapped = await Promise.all(
          historyData.history.map(async (entry: { movieId: string; progress: number; duration: number }) => {
            const response = await fetch(`/api/movies/${entry.movieId}`);
            const data = await response.json();
            return { ...entry, movie: data.movie };
          })
        );
        setHistory(mapped);
      }
    };

    fetchData();
  }, []);

  return (
    <main className="min-h-screen bg-[#020617] px-4 py-6 text-white">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-red-300">My account</p>
            <h1 className="mt-2 text-3xl font-bold">User dashboard</h1>
          </div>
          <Link href="/" className="rounded-full border border-white/10 px-4 py-2 text-sm">Back home</Link>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <section className="rounded-3xl border border-white/10 bg-zinc-950/80 p-5">
            <p className="text-sm text-zinc-400">Profile</p>
            <h2 className="mt-2 text-2xl font-bold">{user?.name || "Viewer"}</h2>
            <p className="mt-1 text-sm text-zinc-300">{user?.email || "user@example.com"}</p>
          </section>

          <section className="rounded-3xl border border-white/10 bg-zinc-950/80 p-5">
            <p className="text-sm text-zinc-400">Subscription</p>
            <p className="mt-2 text-3xl font-bold uppercase">{subscription?.planType || user?.subscriptionStatus || "FREE"}</p>
            <p className="mt-1 text-sm text-zinc-300">Status: {subscription?.status || "ACTIVE"}</p>
          </section>

          <section className="rounded-3xl border border-white/10 bg-zinc-950/80 p-5">
            <p className="text-sm text-zinc-400">Continue watching</p>
            <p className="mt-2 text-3xl font-bold">{history.length}</p>
            <p className="mt-1 text-sm text-zinc-300">Saved titles in watch history</p>
          </section>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <section className="rounded-3xl border border-white/10 bg-zinc-950/80 p-5">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-red-300">Watchlist</p>
                <h2 className="mt-1 text-xl font-bold">Saved for later</h2>
              </div>
            </div>
            <div className="space-y-3">
              {watchlist.map((movie) => (
                <Link key={movie.id} href={`/movie/${movie.id}`} className="flex items-center gap-3 rounded-2xl bg-white/5 p-3">
                  <img src={movie.thumbnail} alt={movie.title} className="h-16 w-12 rounded-lg object-cover" />
                  <div className="flex-1">
                    <p className="font-semibold">{movie.title}</p>
                    <p className="text-xs text-zinc-400">{movie.genre.join(" • ")}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          <section className="rounded-3xl border border-white/10 bg-zinc-950/80 p-5">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-red-300">History</p>
                <h2 className="mt-1 text-xl font-bold">Resume playback</h2>
              </div>
            </div>
            <div className="space-y-3">
              {history.map((entry: { movieId: string; progress: number; duration: number; movie?: MovieItem }) => (
                <Link key={entry.movieId} href={`/watch/${entry.movieId}`} className="flex items-center gap-3 rounded-2xl bg-white/5 p-3">
                  <img src={entry.movie?.thumbnail} alt={entry.movie?.title} className="h-16 w-12 rounded-lg object-cover" />
                  <div className="flex-1">
                    <p className="font-semibold">{entry.movie?.title || "Movie"}</p>
                    <p className="text-xs text-zinc-400">{Math.round((entry.progress / Math.max(entry.duration, 1)) * 100)}% watched</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
