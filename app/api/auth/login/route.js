import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { signSession, setSessionCookie } from "@/lib/auth";

export async function POST(req) {
  const { username, password } = await req.json();

  if (!username || !password) {
    return NextResponse.json({ error: "Username and password required" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { username: username.toLowerCase().trim() } });

  if (!user || !user.isActive) {
    return NextResponse.json({ error: "The Monkey doesn't recognize you. Check your details." }, { status: 401 });
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    return NextResponse.json({ error: "Wrong password, monkey. Try again." }, { status: 401 });
  }

  const token = signSession({ userId: user.id, role: user.role, username: user.username });
  setSessionCookie(token);

  return NextResponse.json({
    user: { id: user.id, username: user.username, displayName: user.displayName, role: user.role },
  });
}
