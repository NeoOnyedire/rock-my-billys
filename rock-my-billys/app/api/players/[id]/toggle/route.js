import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function POST(req, { params }) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Admins only" }, { status: 403 });
  }

  const target = await prisma.user.findUnique({ where: { id: Number(params.id) } });
  if (!target) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const updated = await prisma.user.update({
    where: { id: target.id },
    data: { isActive: !target.isActive },
  });

  return NextResponse.json({ user: updated });
}
