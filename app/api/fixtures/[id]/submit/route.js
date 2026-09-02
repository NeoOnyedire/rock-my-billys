
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { WIN_TYPE_MULTIPLIERS } from "@/lib/elo";

export async function POST(req, { params }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const fixtureId = Number(params.id);
  const { winnerId, winType } = await req.json();

  if (!winnerId || !winType || !WIN_TYPE_MULTIPLIERS[winType]) {
    return NextResponse.json({ error: "Missing or invalid winnerId/winType" }, { status: 400 });
  }

  const fixture = await prisma.fixture.findUnique({ where: { id: fixtureId } });
  if (!fixture) return NextResponse.json({ error: "Fixture not found" }, { status: 404 });

  const isParticipant = fixture.playerAId === user.id || fixture.playerBId === user.id;
  if (!isParticipant && user.role !== "ADMIN") {
    return NextResponse.json({ error: "Not your fixture, monkey." }, { status: 403 });
  }

  if (fixture.status === "APPROVED") {
    return NextResponse.json({ error: "This result is already locked in." }, { status: 400 });
  }

  if (Number(winnerId) !== fixture.playerAId && Number(winnerId) !== fixture.playerBId) {
    return NextResponse.json({ error: "Winner must be one of the two players in this fixture" }, { status: 400 });
  }

  const updated = await prisma.fixture.update({
    where: { id: fixtureId },
    data: {
      winnerId: Number(winnerId),
      winType,
      status: "SUBMITTED",
      submittedBy: user.id,
    },
  });

  return NextResponse.json({ fixture: updated });
}
