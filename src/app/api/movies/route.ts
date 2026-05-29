import { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const search = searchParams.get("search") || "";
  const genre = searchParams.get("genre") || "";
  const year = searchParams.get("year") || "";
  const sort = searchParams.get("sort") || "views";
  const page = Number(searchParams.get("page") || "1");
  const limit = Number(searchParams.get("limit") || "12");

  const where: Record<string, unknown> = {};

  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
    ];
  }

  if (genre) {
    where.genre = { has: genre };
  }

  if (year) {
    where.year = Number(year);
  }

  const orderBy: Prisma.MovieOrderByWithRelationInput =
    sort === "newest"
      ? { year: "desc" as Prisma.SortOrder }
      : sort === "oldest"
        ? { year: "asc" as Prisma.SortOrder }
        : sort === "rating"
          ? { rating: "desc" as Prisma.SortOrder }
          : sort === "trending"
            ? { views: "desc" as Prisma.SortOrder }
            : { views: "desc" as Prisma.SortOrder };

  const [movies, total] = await Promise.all([
    prisma.movie.findMany({
      where,
      orderBy,
      take: limit,
      skip: (page - 1) * limit,
      include: { category: true },
    }),
    prisma.movie.count({ where }),
  ]);

  return NextResponse.json({ movies, total, page, limit });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const movie = await prisma.movie.create({ data: body });
    return NextResponse.json({ movie }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create movie" }, { status: 500 });
  }
}
