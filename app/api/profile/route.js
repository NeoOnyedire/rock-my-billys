import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function PATCH(req) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { newPassword, displayName } = await req.json();

  const data = {};
  if (displayName && displayName.trim().length > 0) data.displayName = displayName.trim();
  if (newPassword) {
    if (newPassword.length < 4) {
      return NextResponse.json({ error: "Password too short" }, { status: 400 });
    }
    data.password = await bcrypt.hash(newPassword, 10);
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
  }

  const updated = await prisma.user.update({ where: { id: user.id }, data });
  const { password, ...safe } = updated;
  return NextResponse.json({ user: safe });
}
