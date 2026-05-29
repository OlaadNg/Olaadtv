"use client";

import { useEffect, useState } from "react";

interface UserItem {
  id: string;
  name: string;
  email: string;
  role: string;
  subscriptionStatus: string;
}

interface MovieItem {
  id: string;
  title: string;
  views: number;
  rating: number;
}

export default function AdminPage() {
  const [movies, setMovies] = useState<MovieItem[]>([]);
  const [users, setUsers] = useState<UserItem[]>([]);
  const [analytics, setAnalytics] = useState<{ totalViews: number; totalUsers: number; topMovies: MovieItem[] } | null>(null);
  const [form, setForm] = useState({ title: "", description: "", videoUrl: "", trailerUrl: "", thumbnail: "", genre: "", year: "2026", duration: "112", rating: "8.5", cast: "" });

  const loadData = async () => {
    const [moviesResponse, usersResponse, analyticsResponse] = await Promise.all([
      fetch("/api/admin/movies", { credentials: "include" }),
      fetch("/api/admin/users", { credentials: "include" }),
      fetch("/api/analytics", { credentials: "include" }),
    ]);

    const moviesData = await moviesResponse.json();
    const usersData = await usersResponse.json();
    const analyticsData = await analyticsResponse.json();

    setMovies(moviesData.movies || []);
    setUsers(usersData.users || []);
    setAnalytics(analyticsData);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    await fetch("/api/admin/movies", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        ...form,
        genre: form.genre.split(",").map((item) => item.trim()).filter(Boolean),
        cast: form.cast.split(",").map((item) => item.trim()).filter(Boolean),
        year: Number(form.year),
        duration: Number(form.duration),
        rating: Number(form.rating),
      }),
    });

    setForm({ title: "", description: "", videoUrl: "", trailerUrl: "", thumbnail: "", genre: "", year: "2026", duration: "112", rating: "8.5", cast: "" });
    loadData();
  };

  return (
    <main className="min-h-screen bg-[#020617] px-4 py-6 text-white">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-red-300">Admin</p>
            <h1 className="mt-2 text-3xl font-bold">Content management</h1>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <section className="rounded-3xl border border-white/10 bg-zinc-950/80 p-5">
            <p className="text-sm text-zinc-400">Total catalog</p>
            <p className="mt-2 text-3xl font-bold">{movies.length}</p>
          </section>
          <section className="rounded-3xl border border-white/10 bg-zinc-950/80 p-5">
            <p className="text-sm text-zinc-400">Total views</p>
            <p className="mt-2 text-3xl font-bold">{analytics?.totalViews || 0}</p>
          </section>
          <section className="rounded-3xl border border-white/10 bg-zinc-950/80 p-5">
            <p className="text-sm text-zinc-400">Registered users</p>
            <p className="mt-2 text-3xl font-bold">{analytics?.totalUsers || users.length}</p>
          </section>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <section className="rounded-3xl border border-white/10 bg-zinc-950/80 p-5">
            <div className="mb-4">
              <p className="text-sm uppercase tracking-[0.3em] text-red-300">Upload movie</p>
              <h2 className="mt-1 text-xl font-bold">Add a title to the library</h2>
            </div>
            <form onSubmit={handleSubmit} className="space-y-3">
              <input value={form.title} onChange={(e) => setForm((state) => ({ ...state, title: e.target.value }))} placeholder="Title" className="w-full rounded-xl border border-white/10 bg-[#020617] px-3 py-2" required />
              <textarea value={form.description} onChange={(e) => setForm((state) => ({ ...state, description: e.target.value }))} placeholder="Description" className="min-h-24 w-full rounded-xl border border-white/10 bg-[#020617] px-3 py-2" required />
              <input value={form.thumbnail} onChange={(e) => setForm((state) => ({ ...state, thumbnail: e.target.value }))} placeholder="Thumbnail URL" className="w-full rounded-xl border border-white/10 bg-[#020617] px-3 py-2" required />
              <input value={form.videoUrl} onChange={(e) => setForm((state) => ({ ...state, videoUrl: e.target.value }))} placeholder="Video URL" className="w-full rounded-xl border border-white/10 bg-[#020617] px-3 py-2" required />
              <input value={form.trailerUrl} onChange={(e) => setForm((state) => ({ ...state, trailerUrl: e.target.value }))} placeholder="Trailer URL" className="w-full rounded-xl border border-white/10 bg-[#020617] px-3 py-2" required />
              <input value={form.genre} onChange={(e) => setForm((state) => ({ ...state, genre: e.target.value }))} placeholder="Genres (comma separated)" className="w-full rounded-xl border border-white/10 bg-[#020617] px-3 py-2" required />
              <input value={form.cast} onChange={(e) => setForm((state) => ({ ...state, cast: e.target.value }))} placeholder="Cast (comma separated)" className="w-full rounded-xl border border-white/10 bg-[#020617] px-3 py-2" required />
              <div className="grid grid-cols-2 gap-2">
                <input value={form.year} onChange={(e) => setForm((state) => ({ ...state, year: e.target.value }))} type="number" placeholder="Year" className="rounded-xl border border-white/10 bg-[#020617] px-3 py-2" />
                <input value={form.duration} onChange={(e) => setForm((state) => ({ ...state, duration: e.target.value }))} type="number" placeholder="Duration" className="rounded-xl border border-white/10 bg-[#020617] px-3 py-2" />
              </div>
              <input value={form.rating} onChange={(e) => setForm((state) => ({ ...state, rating: e.target.value }))} type="number" step="0.1" placeholder="Rating" className="w-full rounded-xl border border-white/10 bg-[#020617] px-3 py-2" />
              <button className="w-full rounded-xl bg-red-600 px-4 py-3 text-sm font-bold">Publish title</button>
            </form>
          </section>

          <section className="rounded-3xl border border-white/10 bg-zinc-950/80 p-5">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-red-300">Analytics</p>
                <h2 className="mt-1 text-xl font-bold">Top viewed content</h2>
              </div>
            </div>
            <div className="space-y-3">
              {analytics?.topMovies.map((movie) => (
                <div key={movie.id} className="flex items-center justify-between rounded-2xl bg-white/5 px-4 py-3">
                  <div>
                    <p className="font-semibold">{movie.title}</p>
                    <p className="text-xs text-zinc-400">Rating {movie.rating.toFixed(1)}</p>
                  </div>
                  <span className="rounded-full bg-red-600/20 px-3 py-1 text-xs">{movie.views} views</span>
                </div>
              ))}
            </div>

            <div className="mt-6">
              <p className="text-sm uppercase tracking-[0.3em] text-red-300">Users</p>
              <div className="mt-3 space-y-2">
                {users.slice(0, 6).map((user) => (
                  <div key={user.id} className="flex items-center justify-between rounded-2xl bg-white/5 px-4 py-3">
                    <div>
                      <p className="font-semibold">{user.name}</p>
                      <p className="text-xs text-zinc-400">{user.email}</p>
                    </div>
                    <span className="rounded-full bg-white/10 px-3 py-1 text-xs">{user.role}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
