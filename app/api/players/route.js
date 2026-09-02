import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

const MONKEY_BREEDS = [
  "orangutan", "chimpanzee", "gorilla", "baboon", "macaque",
  "mandrill", "capuchin", "gibbon", "marmoset", "tamarin",
  "howler", "spidermonkey", "colobus", "langur", "lemur",
];

function randomPassword() {
  const breed = MONKEY_BREEDS[Math.floor(Math.random() * MONKEY_BREEDS.length)];
  const num = Math.floor(Math.random() * 90) + 10;
  return `${breed}${num}`;
}

export async function GET() {
  const users = await prisma.user.findMany({
    orderBy: [{ isGuest: "asc" }, { elo: "desc" }],
    select: {
      id: true, username: true, displayName: true, role: true,
      isGuest: true, isActive: true, elo: true, wins: true, losses: true, streak: true,
    },
  });
  return NextResponse.json({ users });
}

export async function POST(req) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Admins only" }, { status: 403 });
  }

  const { displayName, isGuest } = await req.json();
  if (!displayName) return NextResponse.json({ error: "displayName required" }, { status: 400 });

  const username = displayName.toLowerCase().trim().replace(/[^a-z0-9]/g, "");
  if (!username) return NextResponse.json({ error: "Invalid name" }, { status: 400 });

  const existing = await prisma.user.findUnique({ where: { username } });
  if (existing) return NextResponse.json({ error: "That username already exists" }, { status: 409 });

  const plainPassword = randomPassword();
  const hashed = await bcrypt.hash(plainPassword, 10);

  const created = await prisma.user.create({
    data: {
      username,
      displayName,
      password: hashed,
      role: "PLAYER",
      isGuest: isGuest !== false,
      elo: 1000,
    },
  });

  return NextResponse.json({
    user: { id: created.id, username: created.username, displayName: created.displayName, isGuest: created.isGuest },
    plainPassword, // shown once to the admin so they can hand it out
  });
}
