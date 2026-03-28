import { NextResponse } from "next/server";
import { insforge } from "@/lib/insforge";
import type { UserContextCreate } from "@/types";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as UserContextCreate;

    if (!body.product_value || !body.target_pain_points || !body.spider_keywords) {
      return NextResponse.json(
        { error: "Missing required fields: product_value, target_pain_points, spider_keywords" },
        { status: 400 }
      );
    }

    const { data, error } = await insforge.database
      .from("user_context")
      .insert([
        {
          product_value: body.product_value,
          target_pain_points: body.target_pain_points,
          spider_keywords: body.spider_keywords,
          min_subscribers: body.min_subscribers ?? 1000,
        },
      ])
      .select();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET() {
  try {
    const { data, error } = await insforge.database
      .from("user_context")
      .select("*");

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Return the most recent context
    const sorted = Array.isArray(data)
      ? data.sort(
          (a: Record<string, string>, b: Record<string, string>) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )
      : [];
    const latest = sorted[0] ?? null;

    return NextResponse.json({ data: latest });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
