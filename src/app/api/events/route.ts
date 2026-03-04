import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateSlug } from "@/lib/utils";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, description, slots } = body;

    if (!title?.trim()) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    if (!slots?.length) {
      return NextResponse.json({ error: "At least one slot is required" }, { status: 400 });
    }

    // Generate a unique slug
    let slug = generateSlug(8);
    let attempts = 0;
    while (attempts < 5) {
      const existing = await (prisma as any).event.findUnique({ where: { slug } });
      if (!existing) break;
      slug = generateSlug(8);
      attempts++;
    }

    const event = await (prisma as any).event.create({
      data: {
        slug,
        title: title.trim(),
        description: description?.trim() || null,
        slots: {
          create: slots.map((s: { date: string; startTime: string; endTime: string }) => ({
            date: s.date,
            startTime: s.startTime,
            endTime: s.endTime,
          })),
        },
      },
    });

    return NextResponse.json({ slug: event.slug, id: event.id }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/events]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
