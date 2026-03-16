"use client";

import { MessageCircle } from "lucide-react";

export function WhatsAppButton() {
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "213XXXXXXXXX";
  const url = `https://wa.me/${whatsappNumber}?text=Hello, I'm interested in your medical equipment.`;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-green-500 text-white shadow-lg hover:bg-green-600 transition-all hover:scale-110"
      aria-label="Contact on WhatsApp"
    >
      <MessageCircle className="h-7 w-7" />
    </a>
  );
}
