import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
  });

  return NextResponse.json({ categories });
}

export async function POST(request: NextRequest) {
  const { name } = await request.json();
  if (!name) {
    return NextResponse.json({ error: "Category name required" }, { status: 400 });
  }

  const category = await prisma.category.create({ data: { name } });
  return NextResponse.json({ category });
}
