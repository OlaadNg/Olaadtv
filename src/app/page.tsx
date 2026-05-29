"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  BadgePercent,
  BookMarked,
  Clapperboard,
  Flame,
  History,
  Play,
  Search,
  Sparkles,
  Star,
  UserRound,
} from "lucide-react";

interface Movie {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  trailerUrl: string;
  thumbnail: string;
  genre: string[];
  year: number;
  cast: string[];
  duration: number;
  views: number;
  rating: number;
  language: string;
  isSeries: boolean;
  episodeCount: number;
  featured: boolean;
}

interface HistoryEntry {
  movieId: string;
  progress: number;
  duration: number;
}

const skeletonCards = Array.from({ length: 6 }, (_, idx) => idx);

export default function Home() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [watchlistIds, setWatchlistIds] = useState<string[]>([]);
  const [user, setUser] = useState<{ name: string; role: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterGenre, setFilterGenre] = useState("All");
  const [sortBy, setSortBy] = useState("trending");
  const [currentSlide, setCurrentSlide] = useState(0);

  const featuredMovies = useMemo(() => movies.filter((movie) => movie.featured), [movies]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [moviesResponse, categoriesResponse, historyResponse, meResponse, watchlistResponse] = await Promise.all([
        fetch(`/api/movies?limit=24&sort=${sortBy}${search ? `&search=${encodeURIComponent(search)}` : ""}${filterGenre !== "All" ? `&genre=${encodeURIComponent(filterGenre)}` : ""}`, { credentials: "include" }),
        fetch("/api/categories", { credentials: "include" }),
        fetch("/api/history", { credentials: "include" }),
        fetch("/api/auth/me", { credentials: "include" }),
        fetch("/api/watchlist", { credentials: "include" }),
      ]);

      const moviesData = await moviesResponse.json();
      const categoriesData = await categoriesResponse.json();
      const historyData = await historyResponse.json();
      const meData = await meResponse.json();
      const watchlistData = await watchlistResponse.json();

      setMovies(moviesData.movies || []);
      setCategories((categoriesData.categories || []).map((category: { name: string }) => category.name));
      setHistory(historyData.history || []);
      setUser(meData.user);
      setWatchlistIds(watchlistData.watchlist || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [search, filterGenre, sortBy]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % Math.max(1, featuredMovies.length));
    }, 5000);
    return () => clearInterval(interval);
  }, [featuredMovies.length]);
  const trendingMovies = [...movies].sort((a, b) => b.views - a.views).slice(0, 10);
  const newReleases = [...movies].sort((a, b) => b.year - a.year).slice(0, 10);
  const topRated = [...movies].sort((a, b) => b.rating - a.rating).slice(0, 10);
  const recommended = [...movies]
    .filter((movie) => movie.genre.some((item) => featuredMovies[0]?.genre.includes(item)))
    .slice(0, 10);

  const progressHistory = history
    .map((entry) => ({
      ...entry,
      movie: movies.find((movie) => movie.id === entry.movieId),
    }))
    .filter((item) => item.movie);

  const toggleWatchlist = async (movieId: string) => {
    try {
      const response = await fetch("/api/watchlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ movieId }),
        credentials: "include",
      });
      const data = await response.json();
      setWatchlistIds(data.watchlist || []);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <main className="min-h-screen">
      <section className="border-b border-white/10 bg-[#020617]/70 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-red-600/90 px-3 py-2 text-sm font-bold">OT</div>
            <div>
              <p className="text-lg font-bold">OlaadTv</p>
              <p className="text-xs text-zinc-400">Premium African streaming</p>
            </div>
          </div>
          <nav className="hidden items-center gap-6 text-sm text-zinc-300 md:flex">
            <a href="#trending" className="hover:text-white">Trending</a>
            <a href="#new" className="hover:text-white">New</a>
            <a href="#top" className="hover:text-white">Top Rated</a>
          </nav>
          <div className="flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3 rounded-full bg-white/5 px-3 py-2 text-sm">
                <UserRound className="h-4 w-4" />
                <span>{user.name}</span>
              </div>
            ) : (
              <>
                <Link href="/login" className="rounded-full border border-white/20 px-4 py-2 text-sm font-medium">Sign in</Link>
                <Link href="/register" className="rounded-full bg-red-600 px-4 py-2 text-sm font-medium">Start free</Link>
              </>
            )}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[1.4fr_0.6fr]">
          <motion.div
            key={featuredMovies[currentSlide]?.id || "hero"}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative min-h-[420px] overflow-hidden rounded-[28px] border border-white/10 bg-zinc-950/80 p-6"
            style={{
              backgroundImage: `linear-gradient(rgba(3,7,18,0.35), rgba(3,7,18,0.82)), url(${featuredMovies[currentSlide]?.thumbnail || ""})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent" />
            <div className="relative z-10 flex h-full flex-col justify-between">
              <div className="flex items-center gap-3 text-xs uppercase tracking-[0.28em] text-red-200">
                <Flame className="h-4 w-4" />
                Featured premiere
              </div>
              <div className="max-w-2xl">
                <p className="mb-3 inline-flex rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-red-100">{featuredMovies[currentSlide]?.year || "2026"}</p>
                <h1 className="text-4xl font-black sm:text-5xl lg:text-6xl">{featuredMovies[currentSlide]?.title || "OlaadTv Originals"}</h1>
                <p className="mt-4 max-w-xl text-sm text-zinc-200 sm:text-base">
                  {featuredMovies[currentSlide]?.description || "The finest African stories, premium originals, and curated masterpieces."}
                </p>
                <div className="mt-4 flex flex-wrap gap-2 text-xs text-zinc-200">
                  {(featuredMovies[currentSlide]?.genre || ["Drama", "Action"]).map((genre) => (
                    <span key={genre} className="rounded-full bg-red-600/70 px-3 py-1">{genre}</span>
                  ))}
                </div>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <Link href={`/watch/${featuredMovies[currentSlide]?.id || ""}`} className="inline-flex items-center gap-2 rounded-full bg-red-600 px-5 py-3 text-sm font-bold hover:bg-red-500">
                  <Play className="h-4 w-4" />
                  Watch now
                </Link>
                <Link href={`/movie/${featuredMovies[currentSlide]?.id || ""}`} className="inline-flex items-center gap-2 rounded-full border border-white/20 px-5 py-3 text-sm font-bold text-white">
                  <Clapperboard className="h-4 w-4" />
                  View details
                </Link>
              </div>
            </div>
          </motion.div>

          <div className="grid gap-3">
            <div className="rounded-3xl border border-white/10 bg-zinc-950/80 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-zinc-400">Premium access</p>
                  <h2 className="mt-1 text-2xl font-bold">{user ? "Member dashboard" : "Begin your trial"}</h2>
                </div>
                <BadgePercent className="h-6 w-6 text-red-400" />
              </div>
              <p className="mt-3 text-sm text-zinc-300">Unlock timeless African cinema, exclusive originals, and HD streams with curated recommendations.</p>
              <div className="mt-4 grid gap-2">
                <div className="rounded-2xl bg-white/5 p-3 text-sm">
                  <p className="font-semibold">Free trial</p>
                  <p className="text-zinc-400">7 days access to curated premieres</p>
                </div>
                <div className="rounded-2xl bg-white/5 p-3 text-sm">
                  <p className="font-semibold">Monthly</p>
                  <p className="text-zinc-400">Premium library, family profiles, and watchlists</p>
                </div>
                <div className="rounded-2xl bg-white/5 p-3 text-sm">
                  <p className="font-semibold">Yearly</p>
                  <p className="text-zinc-400">Best value for binge-ready streaming</p>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-zinc-950/80 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-zinc-400">Continue watching</p>
                  <h2 className="mt-1 text-xl font-bold">Pick up where you left off</h2>
                </div>
                <History className="h-5 w-5 text-red-400" />
              </div>
              <div className="mt-4 space-y-3">
                {progressHistory.length > 0 ? (
                  progressHistory.slice(0, 3).map((item) => (
                    <Link key={item.movieId} href={`/watch/${item.movieId}`} className="block rounded-2xl bg-white/5 p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold">{item.movie?.title}</p>
                          <p className="text-xs text-zinc-400">{Math.round((item.progress / Math.max(item.duration, 1)) * 100)}% watched</p>
                        </div>
                        <Play className="h-4 w-4" />
                      </div>
                    </Link>
                  ))
                ) : (
                  <div className="rounded-2xl bg-white/5 p-4 text-sm text-zinc-400">No watch progress yet. Start with a featured title.</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search titles, genres, or moods"
                className="w-full rounded-full border border-white/10 bg-[#020617] px-10 py-3 text-sm outline-none"
              />
            </div>
            <select value={filterGenre} onChange={(e) => setFilterGenre(e.target.value)} className="rounded-full border border-white/10 bg-[#020617] px-4 py-3 text-sm">
              <option value="All">All genres</option>
              {categories.map((category) => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="rounded-full border border-white/10 bg-[#020617] px-4 py-3 text-sm">
              <option value="trending">Trending</option>
              <option value="newest">Newest</option>
              <option value="rating">Top rated</option>
              <option value="oldest">Oldest</option>
            </select>
          </div>
        </div>
      </section>

      {loading ? (
        <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
            {skeletonCards.map((card) => (
              <div key={card} className="animate-pulse rounded-2xl bg-white/5 p-3">
                <div className="h-40 rounded-xl bg-white/10" />
                <div className="mt-3 h-4 w-3/4 rounded bg-white/10" />
                <div className="mt-2 h-3 w-1/2 rounded bg-white/10" />
              </div>
            ))}
          </div>
        </section>
      ) : (
        <>
          <section id="trending" className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-red-300">Trending now</p>
                <h2 className="mt-1 text-2xl font-bold">Audience favorites</h2>
              </div>
              <span className="rounded-full bg-red-600/20 px-3 py-1 text-xs text-red-200">{trendingMovies.length} titles</span>
            </div>
            <div className="-mx-2 flex snap-x gap-4 overflow-x-auto px-2 pb-2">
              {trendingMovies.map((movie) => (
                <MovieCard
                  key={movie.id}
                  movie={movie}
                  isSaved={watchlistIds.includes(movie.id)}
                  onToggleWatchlist={() => toggleWatchlist(movie.id)}
                />
              ))}
            </div>
          </section>

          <section id="new" className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-red-300">New releases</p>
                <h2 className="mt-1 text-2xl font-bold">Fresh premieres</h2>
              </div>
              <span className="rounded-full bg-amber-500/20 px-3 py-1 text-xs text-amber-200">Curated weekly</span>
            </div>
            <div className="-mx-2 flex snap-x gap-4 overflow-x-auto px-2 pb-2">
              {newReleases.map((movie) => (
                <MovieCard
                  key={movie.id}
                  movie={movie}
                  isSaved={watchlistIds.includes(movie.id)}
                  onToggleWatchlist={() => toggleWatchlist(movie.id)}
                />
              ))}
            </div>
          </section>

          <section id="top" className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-red-300">Top rated</p>
                <h2 className="mt-1 text-2xl font-bold">Critics and subscribers love</h2>
              </div>
              <span className="rounded-full bg-green-500/20 px-3 py-1 text-xs text-green-200">Highest score</span>
            </div>
            <div className="-mx-2 flex snap-x gap-4 overflow-x-auto px-2 pb-2">
              {topRated.map((movie) => (
                <MovieCard
                  key={movie.id}
                  movie={movie}
                  isSaved={watchlistIds.includes(movie.id)}
                  onToggleWatchlist={() => toggleWatchlist(movie.id)}
                />
              ))}
            </div>
          </section>

          <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-red-300">Recommended for you</p>
                <h2 className="mt-1 text-2xl font-bold">Personal picks based on taste</h2>
              </div>
              <span className="rounded-full bg-cyan-500/20 px-3 py-1 text-xs text-cyan-200">AI vibe match</span>
            </div>
            <div className="-mx-2 flex snap-x gap-4 overflow-x-auto px-2 pb-2">
              {recommended.map((movie) => (
                <MovieCard
                  key={movie.id}
                  movie={movie}
                  isSaved={watchlistIds.includes(movie.id)}
                  onToggleWatchlist={() => toggleWatchlist(movie.id)}
                />
              ))}
            </div>
          </section>
        </>
      )}
    </main>
  );
}

function MovieCard({ movie, isSaved, onToggleWatchlist }: { movie: Movie; isSaved: boolean; onToggleWatchlist: () => void }) {
  return (
    <motion.article
      whileHover={{ y: -4 }}
      className="min-w-[220px] max-w-[220px] snap-start rounded-3xl border border-white/10 bg-zinc-950/80 p-3"
    >
      <div className="relative overflow-hidden rounded-2xl">
        <img
          src={movie.thumbnail}
          alt={movie.title}
          loading="lazy"
          className="h-64 w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
        <button
          onClick={onToggleWatchlist}
          className={`absolute right-2 top-2 rounded-full p-2 ${isSaved ? "bg-red-600" : "bg-black/70"}`}
        >
          <BookMarked className="h-4 w-4" />
        </button>
      </div>
      <div className="mt-3">
        <div className="flex items-center justify-between text-xs text-zinc-300">
          <span>{movie.year}</span>
          <span className="flex items-center gap-1"><Star className="h-3.5 w-3.5 text-amber-400" /> {movie.rating.toFixed(1)}</span>
        </div>
        <Link href={`/movie/${movie.id}`} className="mt-2 block text-base font-bold hover:text-red-200">{movie.title}</Link>
        <p className="mt-1 line-clamp-2 text-xs text-zinc-400">{movie.description}</p>
        <div className="mt-3 flex items-center justify-between text-[10px] uppercase tracking-[0.25em] text-zinc-500">
          <span>{movie.genre.join(" • ")}</span>
          <span>{movie.duration}m</span>
        </div>
      </div>
    </motion.article>
  );
}
