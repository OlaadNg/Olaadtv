import Link from "next/link";
import WatchPlayer from "@/components/watch-player";

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

async function getMovie(id: string) {
  const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || ""}/api/movies/${id}`, {
    cache: "no-store",
  });
  const data = await response.json();
  return data.movie as Movie;
}

async function getHistory() {
  const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || ""}/api/history`, {
    cache: "no-store",
    credentials: "include",
  });
  const data = await response.json();
  return data.history || [];
}

export default async function WatchPage({ params }: { params: { id: string } }) {
  const movie = await getMovie(params.id);
  const history = await getHistory();
  const match = history.find((entry: { movieId: string; progress: number }) => entry.movieId === movie.id);
  const progress = match?.progress || 0;

  return (
    <main className="min-h-screen bg-[#020617] text-white">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-red-300">Now playing</p>
            <h1 className="mt-1 text-3xl font-bold">{movie.title}</h1>
          </div>
          <Link href="/" className="rounded-full border border-white/10 px-4 py-2 text-sm">Back home</Link>
        </div>

        <WatchPlayer movie={movie} initialProgress={progress} />

        <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_0.5fr]">
          <section className="rounded-3xl border border-white/10 bg-zinc-950/80 p-5">
            <p className="text-sm uppercase tracking-[0.3em] text-red-300">Synopsis</p>
            <p className="mt-2 text-sm text-zinc-300">{movie.description}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {movie.genre.map((genre) => (
                <span key={genre} className="rounded-full bg-red-600/80 px-3 py-1 text-xs">{genre}</span>
              ))}
            </div>
          </section>

          <section className="rounded-3xl border border-white/10 bg-zinc-950/80 p-5">
            <p className="text-sm uppercase tracking-[0.3em] text-red-300">Playback controls</p>
            <div className="mt-3 space-y-2 text-sm text-zinc-300">
              <p>• Adaptive stream and HD playback ready</p>
              <p>• Resume progress automatically saved</p>
              <p>• Calendar-ready for continued watching</p>
            </div>
            <div className="mt-4 rounded-2xl bg-white/5 p-3 text-sm">
              <p className="font-semibold">Continue progress</p>
              <p className="mt-1 text-zinc-300">{Math.round(progress)} seconds watched</p>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
