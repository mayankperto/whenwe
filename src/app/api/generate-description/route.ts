import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const { title } = await req.json();

    if (!title?.trim()) {
      return NextResponse.json({ error: "Title required" }, { status: 400 });
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      // Fallback: return a generic description if no API key
      return NextResponse.json({
        description: `Join us for ${title}. Please mark your availability on the dates below so we can find the best time that works for everyone.`,
      });
    }

    const message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 150,
      messages: [
        {
          role: "user",
          content: `Write a short, friendly 1-2 sentence description for a scheduling poll called "${title}". Keep it practical and warm — explain the purpose and that participants should mark their availability. No markdown, just plain text.`,
        },
      ],
    });

    const description = message.content[0].type === "text" ? message.content[0].text.trim() : "";

    return NextResponse.json({ description });
  } catch (error) {
    console.error("AI generation error:", error);
    return NextResponse.json({ error: "Failed to generate description" }, { status: 500 });
  }
}
