import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function PATCH(req) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { newPassword, displayName } = await req.json();
  const trimmedDisplayName = typeof displayName === "string" ? displayName.trim() : "";
  const trimmedPassword = typeof newPassword === "string" ? newPassword.trim() : "";

  const data = {};

  if (typeof displayName !== "undefined") {
    if (trimmedDisplayName.length === 0) {
      return NextResponse.json({ error: "Display name cannot be empty" }, { status: 400 });
    }
    if (trimmedDisplayName.length > 30) {
      return NextResponse.json({ error: "Display name must be 30 characters or fewer" }, { status: 400 });
    }
    if (trimmedDisplayName !== user.displayName.trim()) {
      data.displayName = trimmedDisplayName;
    }
  }

  if (trimmedPassword.length > 0) {
    if (trimmedPassword.length < 4) {
      return NextResponse.json({ error: "Password too short" }, { status: 400 });
    }
    data.password = await bcrypt.hash(trimmedPassword, 10);
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
  }

  const updated = await prisma.user.update({ where: { id: user.id }, data });
  const { password, ...safe } = updated;
  return NextResponse.json({ user: safe });
}
