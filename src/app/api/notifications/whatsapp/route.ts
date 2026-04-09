import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { quoteId } = body;

    if (!quoteId) {
      return NextResponse.json(
        { error: "Quote ID is required" },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    // Fetch quote details
    const { data: quote, error: quoteError } = await supabase
      .from("quote_requests")
      .select("*, product:products(name)")
      .eq("id", quoteId)
      .single();

    if (quoteError || !quote) {
      return NextResponse.json(
        { error: quoteError?.message || "Quote not found" },
        { status: 404 }
      );
    }

    // Fetch company settings for notification WhatsApp number
    const { data: settings, error: settingsError } = await supabase
      .from("company_settings")
      .select("notification_whatsapp, company_name")
      .limit(1)
      .single();

    if (settingsError || !settings?.notification_whatsapp) {
      return NextResponse.json(
        { error: settingsError?.message || "Notification WhatsApp number not configured" },
        { status: 400 }
      );
    }

    // Format WhatsApp message
    const message = `
🔔 *New Quote Request* - ${settings.company_name}

*Customer Details:*
📝 Name: ${quote.name}
🏢 Company: ${quote.company || "Not provided"}
📧 Email: ${quote.email}
📱 Phone: ${quote.phone}

*Quote Details:*
📦 Product: ${quote.product?.name || "General inquiry"}
📊 Quantity: ${quote.quantity}
📛 Notes: ${quote.notes || "None"}

⏰ Submitted: ${new Date(quote.created_at).toLocaleString()}
    `.trim();

    // Send WhatsApp message
    const response = await sendWhatsApp({
      to: settings.notification_whatsapp,
      message,
    });

    return NextResponse.json({ success: true, messageSid: response.sid });
  } catch (error) {
    console.error("WhatsApp notification error:", error);
    return NextResponse.json(
      { error: "Failed to send WhatsApp notification" },
      { status: 500 }
    );
  }
}

// WhatsApp service function - Using Twilio
async function sendWhatsApp({
  to,
  message,
}: {
  to: string;
  message: string;
}) {
  const provider = process.env.WHATSAPP_PROVIDER || "twilio";

  if (provider === "twilio") {
    return sendViaTwilio(to, message);
  } else if (provider === "whatsapp-business") {
    return sendViaWhatsAppBusiness(to, message);
  } else {
    throw new Error(`Unsupported WhatsApp provider: ${provider}`);
  }
}

// Twilio WhatsApp service
async function sendViaTwilio(to: string, message: string) {
  if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
    throw new Error(
      "Twilio credentials not configured (TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)"
    );
  }

  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_WHATSAPP_FROM; // e.g., "whatsapp:+14155552671"

  if (!fromNumber) {
    throw new Error("TWILIO_WHATSAPP_FROM not configured");
  }

  const auth = Buffer.from(`${accountSid}:${authToken}`).toString("base64");
  const normalizedTo = normalizePhoneNumber(to);

  const response = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
    {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        From: fromNumber,
        To: `whatsapp:${normalizedTo}`,
        Body: message,
      }).toString(),
    }
  );

  if (!response.ok) {
    throw new Error(`Twilio API error: ${response.statusText}`);
  }

  const data = await response.json();
  return { sid: data.sid };
}

// WhatsApp Business API service
async function sendViaWhatsAppBusiness(to: string, message: string) {
  const accessToken = process.env.WHATSAPP_BUSINESS_ACCESS_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_BUSINESS_PHONE_NUMBER_ID;

  if (!accessToken || !phoneNumberId) {
    throw new Error(
      "WhatsApp Business credentials not configured (WHATSAPP_BUSINESS_ACCESS_TOKEN, WHATSAPP_BUSINESS_PHONE_NUMBER_ID)"
    );
  }

  const response = await fetch(
    `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: normalizePhoneNumber(to),
        type: "text",
        text: {
          body: message,
        },
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`WhatsApp Business API error: ${response.statusText}`);
  }

  const data = await response.json();
  return { sid: data.messages[0].id };
}

function normalizePhoneNumber(raw: string) {
  const cleaned = raw.trim().replace(/[\s()-]/g, "");
  const withPlus = cleaned.startsWith("+") ? cleaned : `+${cleaned.replace(/^\+/, "")}`;
  return withPlus;
}
