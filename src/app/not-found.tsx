import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#020617] px-4 text-white">
      <div className="rounded-3xl border border-white/10 bg-zinc-950/80 p-8 text-center">
        <p className="text-sm uppercase tracking-[0.3em] text-red-300">404</p>
        <h1 className="mt-2 text-3xl font-bold">Page not found</h1>
        <p className="mt-2 text-sm text-zinc-400">The content you are looking for has been moved or does not exist.</p>
        <Link href="/" className="mt-5 inline-flex rounded-full bg-red-600 px-4 py-2 text-sm font-bold">Return home</Link>
      </div>
    </main>
  );
}
