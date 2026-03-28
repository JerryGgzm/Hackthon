import { NextResponse, type NextRequest } from "next/server";
import { insforge } from "@/lib/insforge";

export async function GET(request: NextRequest) {
  try {
    const status = request.nextUrl.searchParams.get("status");
    const contextId = request.nextUrl.searchParams.get("context_id");

    if (!status || !["pending", "approved", "rejected"].includes(status)) {
      return NextResponse.json(
        { error: "Query param 'status' is required (pending|approved|rejected)" },
        { status: 400 }
      );
    }

    let query = insforge.database
      .from("youtube_leads")
      .select("*")
      .eq("status", status);

    if (contextId) {
      query = query.eq("context_id", contextId);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Sort by match_score descending
    const sorted = Array.isArray(data)
      ? data.sort(
          (a: Record<string, number>, b: Record<string, number>) =>
            (b.match_score ?? 0) - (a.match_score ?? 0)
        )
      : [];

    return NextResponse.json({ data: sorted });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
