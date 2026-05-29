import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthToken, verifyJwt } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const token = getAuthToken(request);
    if (!token) {
      return NextResponse.json({ history: [] });
    }

    const payload = verifyJwt(token);
    const user = await prisma.user.findUnique({ where: { id: payload.userId } });
    const history = Array.isArray(user?.watchHistory) ? user.watchHistory : [];
    return NextResponse.json({ history });
  } catch (error) {
    return NextResponse.json({ history: [] });
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = getAuthToken(request);
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = verifyJwt(token);
    const { movieId, progress, duration } = await request.json();
    if (!movieId) {
      return NextResponse.json({ error: "Missing movieId" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { id: payload.userId } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const currentHistory: Array<{ movieId: string; progress: number; duration: number; updatedAt?: string }> = Array.isArray(user.watchHistory)
      ? (user.watchHistory as Array<{ movieId: string; progress: number; duration: number; updatedAt?: string }>)
      : [];
    const existingIndex = currentHistory.findIndex((entry) => entry.movieId === movieId);
    const entry = { movieId, progress: progress ?? 0, duration: duration ?? 0, updatedAt: new Date().toISOString() };

    const updatedHistory = existingIndex >= 0
      ? currentHistory.map((item: { movieId: string }, index: number) => index === existingIndex ? entry : item)
      : [...currentHistory, entry];

    await prisma.user.update({
      where: { id: user.id },
      data: { watchHistory: updatedHistory },
    });

    return NextResponse.json({ history: updatedHistory });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update history" }, { status: 500 });
  }
}
