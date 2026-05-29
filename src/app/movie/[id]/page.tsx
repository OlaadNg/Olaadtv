import Link from "next/link";
import { motion } from "framer-motion";

interface Movie {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  genre: string[];
  year: number;
  cast: string[];
  duration: number;
  rating: number;
  trailerUrl: string;
  videoUrl: string;
  language: string;
  views: number;
  isSeries: boolean;
}

async function getMovie(id: string) {
  const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || ""}/api/movies/${id}`, {
    cache: "no-store",
  });
  const data = await response.json();
  return data.movie as Movie;
}

async function getRelatedMovies() {
  const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || ""}/api/movies?limit=12`, {
    cache: "no-store",
  });
  const data = await response.json();
  return data.movies as Movie[];
}

export default async function MoviePage({ params }: { params: { id: string } }) {
  const movie = await getMovie(params.id);
  const related = (await getRelatedMovies()).filter((entry) => entry.id !== movie.id).slice(0, 6);

  return (
    <main className="min-h-screen bg-[#020617] text-white">
      <section className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="overflow-hidden rounded-[30px] border border-white/10 bg-zinc-950/80">
            <img src={movie.thumbnail} alt={movie.title} className="h-96 w-full object-cover" />
          </div>
          <div className="rounded-[30px] border border-white/10 bg-zinc-950/80 p-6">
            <p className="text-sm uppercase tracking-[0.3em] text-red-300">Now streaming</p>
            <h1 className="mt-2 text-4xl font-bold">{movie.title}</h1>
            <p className="mt-3 text-sm text-zinc-300">{movie.description}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {movie.genre.map((genre) => (
                <span key={genre} className="rounded-full bg-red-600/80 px-3 py-1 text-xs">{genre}</span>
              ))}
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl bg-white/5 p-3 text-sm"><p className="text-zinc-400">Year</p><p className="mt-1 font-bold">{movie.year}</p></div>
              <div className="rounded-2xl bg-white/5 p-3 text-sm"><p className="text-zinc-400">Duration</p><p className="mt-1 font-bold">{movie.duration} min</p></div>
              <div className="rounded-2xl bg-white/5 p-3 text-sm"><p className="text-zinc-400">Language</p><p className="mt-1 font-bold">{movie.language}</p></div>
              <div className="rounded-2xl bg-white/5 p-3 text-sm"><p className="text-zinc-400">Rating</p><p className="mt-1 font-bold">{movie.rating.toFixed(1)} / 10</p></div>
            </div>
            <div className="mt-5">
              <p className="text-sm uppercase tracking-[0.3em] text-red-300">Cast</p>
              <p className="mt-2 text-sm text-zinc-200">{movie.cast.join(" • ")}</p>
            </div>
            <div className="mt-6 flex gap-3">
              <Link href={`/watch/${movie.id}`} className="rounded-full bg-red-600 px-5 py-3 text-sm font-bold">Play now</Link>
              <a href={movie.trailerUrl} target="_blank" rel="noreferrer" className="rounded-full border border-white/10 px-5 py-3 text-sm font-bold">Watch trailer</a>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-2 sm:px-6 lg:px-8">
        <div className="mb-4">
          <p className="text-sm uppercase tracking-[0.3em] text-red-300">Related titles</p>
          <h2 className="mt-1 text-2xl font-bold">More like this</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {related.map((entry) => (
            <motion.article key={entry.id} whileHover={{ y: -4 }} className="overflow-hidden rounded-3xl border border-white/10 bg-zinc-950/80">
              <img src={entry.thumbnail} alt={entry.title} className="h-44 w-full object-cover" />
              <div className="p-4">
                <p className="font-bold">{entry.title}</p>
                <p className="mt-1 text-xs text-zinc-400">{entry.genre.join(" • ")} • {entry.year}</p>
                <Link href={`/movie/${entry.id}`} className="mt-3 inline-flex rounded-full bg-red-600 px-4 py-2 text-xs font-bold">View</Link>
              </div>
            </motion.article>
          ))}
        </div>
      </section>
    </main>
  );
}
