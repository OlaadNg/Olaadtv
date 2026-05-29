"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
        credentials: "include",
      });

      const data = await response.json();
      if (!response.ok) {
        setError(data.error || "Registration failed");
        return;
      }

      router.push("/");
    } catch (error) {
      setError("Unable to create account right now.");
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#020617] px-4 py-10">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-zinc-950/85 p-8 shadow-2xl">
        <div className="mb-6">
          <p className="text-sm uppercase tracking-[0.3em] text-red-300">OlaadTv</p>
          <h1 className="mt-2 text-3xl font-bold">Create an account</h1>
          <p className="mt-1 text-sm text-zinc-400">Start your premium streaming membership and build your watchlist.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-200">Name</label>
            <input
              value={form.name}
              onChange={(e) => setForm((state) => ({ ...state, name: e.target.value }))}
              type="text"
              className="w-full rounded-xl border border-white/10 bg-[#030712] px-4 py-3 text-sm outline-none"
              placeholder="Your name"
              required
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-200">Email</label>
            <input
              value={form.email}
              onChange={(e) => setForm((state) => ({ ...state, email: e.target.value }))}
              type="email"
              className="w-full rounded-xl border border-white/10 bg-[#030712] px-4 py-3 text-sm outline-none"
              placeholder="you@example.com"
              required
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-200">Password</label>
            <input
              value={form.password}
              onChange={(e) => setForm((state) => ({ ...state, password: e.target.value }))}
              type="password"
              className="w-full rounded-xl border border-white/10 bg-[#030712] px-4 py-3 text-sm outline-none"
              placeholder="Create a password"
              required
            />
          </div>

          {error && <p className="rounded-xl bg-red-500/10 px-3 py-2 text-sm text-red-200">{error}</p>}

          <button type="submit" className="w-full rounded-xl bg-red-600 px-4 py-3 text-sm font-bold">Create account</button>
        </form>

        <div className="mt-5 flex items-center justify-between text-sm text-zinc-400">
          <Link href="/login" className="text-red-200">Already have an account?</Link>
          <Link href="/" className="text-zinc-200">Back home</Link>
        </div>
      </div>
    </main>
  );
}
