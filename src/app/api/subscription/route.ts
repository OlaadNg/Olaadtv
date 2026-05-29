import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthToken, verifyJwt } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const token = getAuthToken(request);
    if (!token) {
      return NextResponse.json({ subscription: null });
    }

    const payload = verifyJwt(token);
    const user = await prisma.user.findUnique({ where: { id: payload.userId } });
    const subscription = await prisma.subscription.findFirst({
      where: { userId: payload.userId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      subscriptionStatus: user?.subscriptionStatus || "FREE",
      subscription,
    });
  } catch (error) {
    return NextResponse.json({ subscriptionStatus: "FREE", subscription: null });
  }
}
