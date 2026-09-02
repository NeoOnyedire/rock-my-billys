
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function PATCH(req, { params }) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Admins only" }, { status: 403 });
  }

  const { status } = await req.json();
  if (!["OPEN", "COMPLETED"].includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const matchday = await prisma.matchday.update({
    where: { id: Number(params.id) },
    data: { status },
  });

  return NextResponse.json({ matchday });
}

export async function DELETE(req, { params }) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Admins only" }, { status: 403 });
  }

  await prisma.fixture.deleteMany({ where: { matchdayId: Number(params.id) } });
  await prisma.matchday.delete({ where: { id: Number(params.id) } });

  return NextResponse.json({ ok: true });
}
