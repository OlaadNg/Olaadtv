import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { comparePassword, hashPassword, signJwt } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, password } = body;

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "User already exists" }, { status: 409 });
    }

    const hashedPassword = await hashPassword(password);
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "USER",
        subscriptionStatus: "FREE",
      },
    });

    await prisma.subscription.create({
      data: {
        userId: user.id,
        planType: "FREE",
        status: "ACTIVE",
        expiryDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
      },
    });

    const token = signJwt({ userId: user.id, email: user.email, role: user.role });
    const response = NextResponse.json({ user: { ...user, password: undefined } });
    response.cookies.set("auth_token", token, {
      httpOnly: true,
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });
    return response;
  } catch (error) {
    return NextResponse.json({ error: "Registration failed" }, { status: 500 });
  }
}
