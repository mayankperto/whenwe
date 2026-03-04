import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { participantName, votes } = body;

    if (!participantName?.trim()) {
      return NextResponse.json(
        { error: "Participant name is required" },
        { status: 400 }
      );
    }

    if (!Array.isArray(votes) || votes.length === 0) {
      return NextResponse.json(
        { error: "Votes array is required" },
        { status: 400 }
      );
    }

    const name = participantName.trim();

    // Upsert each vote
    const results = await Promise.all(
      votes.map(({ slotId, available }: { slotId: string; available: boolean }) =>
        (prisma as any).vote.upsert({
          where: {
            slotId_participantName: {
              slotId,
              participantName: name,
            },
          },
          create: {
            slotId,
            participantName: name,
            available,
          },
          update: {
            available,
          },
        })
      )
    );

    return NextResponse.json({ count: results.length }, { status: 200 });
  } catch (err) {
    console.error("[POST /api/votes]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
