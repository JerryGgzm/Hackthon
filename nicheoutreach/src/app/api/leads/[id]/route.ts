import { NextResponse } from "next/server";
import { insforge } from "@/lib/insforge";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const newStatus = body.status;

    if (!newStatus || !["approved", "rejected"].includes(newStatus)) {
      return NextResponse.json(
        { error: "Body must include status: 'approved' or 'rejected'" },
        { status: 400 }
      );
    }

    const { data, error } = await insforge.database
      .from("youtube_leads")
      .update({
        status: newStatus,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
