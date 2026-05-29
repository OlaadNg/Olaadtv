import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthToken, verifyJwt } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const token = getAuthToken(request);
    if (!token) {
      return NextResponse.json({ watchlist: [] });
    }

    const payload = verifyJwt(token);
    const user = await prisma.user.findUnique({ where: { id: payload.userId } });
    const watchlist = Array.isArray(user?.watchlist) ? user?.watchlist : [];
    return NextResponse.json({ watchlist });
  } catch (error) {
    return NextResponse.json({ watchlist: [] });
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = getAuthToken(request);
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = verifyJwt(token);
    const { movieId } = await request.json();
    const user = await prisma.user.findUnique({ where: { id: payload.userId } });

    if (!user || !movieId) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const current: string[] = Array.isArray(user.watchlist)
      ? (user.watchlist as string[])
      : [];
    const next = current.includes(movieId)
      ? current.filter((item) => item !== movieId)
      : [...current, movieId];

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: { watchlist: next },
    });

    return NextResponse.json({ watchlist: updated.watchlist });
  } catch (error) {
    return NextResponse.json({ error: "Invalid request" }, { status: 500 });
  }
}
