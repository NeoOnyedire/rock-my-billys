import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function POST(req, { params }) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Admins only" }, { status: 403 });
  }

  const updated = await prisma.user.update({
    where: { id: Number(params.id) },
    data: { isGuest: false },
  });

  return NextResponse.json({ user: updated });
}
