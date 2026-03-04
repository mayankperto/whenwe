import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const event = await (prisma as any).event.findUnique({
      where: { slug },
      include: {
        slots: {
          orderBy: [{ date: "asc" }, { startTime: "asc" }],
          include: {
            votes: {
              where: { available: true },
              orderBy: { createdAt: "asc" },
            },
          },
        },
      },
    });

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    return NextResponse.json(event);
  } catch (err) {
    console.error("[GET /api/events/[slug]]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
