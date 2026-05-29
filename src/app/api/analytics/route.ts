import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthToken, verifyJwt } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const token = getAuthToken(request);
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const payload = verifyJwt(token);
    if (payload.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const [movies, users] = await Promise.all([
      prisma.movie.findMany({ orderBy: { views: "desc" }, take: 10 }),
      prisma.user.findMany({ orderBy: { createdAt: "desc" } }),
    ]);

    const totalViews = movies.reduce((sum, movie) => sum + movie.views, 0);
    const totalUsers = users.length;

    return NextResponse.json({
      totalViews,
      totalUsers,
      topMovies: movies,
    });
  } catch (error) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
