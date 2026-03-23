import { NextRequest, NextResponse } from "next/server";
import { quoteRequestSchema } from "@/lib/validations";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.json();
    const parsed = quoteRequestSchema.safeParse(rawBody);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid quote data", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const data = parsed.data;
    const supabase = createAdminClient();

    const { data: insertedData, error } = await supabase
      .from("quote_requests")
      .insert({
        product_id: data.product_id || null,
        name: data.name,
        company: data.company || null,
        phone: data.phone,
        email: data.email,
        quantity: data.quantity,
        notes: data.notes || null,
        status: "pending",
      })
      .select("id")
      .single();

    if (error || !insertedData) {
      return NextResponse.json(
        { error: error?.message || "Failed to save quote" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, quoteId: insertedData.id });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
