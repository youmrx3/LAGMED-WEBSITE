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

    // Fetch company settings for notification email
    const { data: settings, error: settingsError } = await supabase
      .from("company_settings")
      .select("notification_email, company_name")
      .limit(1)
      .single();

    if (settingsError || !settings?.notification_email) {
      return NextResponse.json(
        { error: settingsError?.message || "Notification email not configured" },
        { status: 400 }
      );
    }

    // Email content
    const emailContent = `
      <h2>New Quote Request</h2>
      <p><strong>Customer Name:</strong> ${quote.name}</p>
      <p><strong>Company:</strong> ${quote.company || "Not provided"}</p>
      <p><strong>Email:</strong> ${quote.email}</p>
      <p><strong>Phone:</strong> ${quote.phone}</p>
      <p><strong>Product:</strong> ${quote.product?.name || "General inquiry"}</p>
      <p><strong>Quantity:</strong> ${quote.quantity}</p>
      <p><strong>Notes:</strong> ${quote.notes || "None"}</p>
      <p><strong>Submitted:</strong> ${new Date(quote.created_at).toLocaleString()}</p>
    `;

    // Send email using your email service
    const response = await sendEmail({
      to: settings.notification_email,
      subject: `New Quote Request from ${quote.name}`,
      html: emailContent,
    });

    return NextResponse.json({ success: true, messageId: response.messageId });
  } catch (error) {
    console.error("Email notification error:", error);
    return NextResponse.json(
      { error: "Failed to send email notification" },
      { status: 500 }
    );
  }
}

// Email service function - Configure based on your email provider
async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  const emailProvider = process.env.EMAIL_PROVIDER || "smtp";

  if (emailProvider === "resend") {
    return sendViaResend(to, subject, html);
  } else if (emailProvider === "smtp") {
    return sendViaSMTP(to, subject, html);
  } else {
    throw new Error(`Unsupported email provider: ${emailProvider}`);
  }
}

// Resend email service
async function sendViaResend(
  to: string,
  subject: string,
  html: string
) {
  if (!process.env.RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY not configured");
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev",
      to,
      subject,
      html,
    }),
  });

  if (!response.ok) {
    throw new Error(`Resend API error: ${response.statusText}`);
  }

  return await response.json();
}

// SMTP email service (requires nodemailer)
async function sendViaSMTP(
  to: string,
  subject: string,
  html: string
) {
  // Install: npm install nodemailer
  // Then configure environment variables:
  // SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM

  const nodemailer = require("nodemailer");

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || "587"),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const info = await transporter.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to,
    subject,
    html,
  });

  return { messageId: info.messageId };
}
