"use client";

import { usePathname } from "next/navigation";
import { useLocaleStore } from "@/lib/store";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { WhatsAppButton } from "@/components/layout/whatsapp-button";

export function ClientBody({ children }: { children: React.ReactNode }) {
  const { locale, dir } = useLocaleStore();
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

  if (isAdmin) {
    return (
      <body className="min-h-screen bg-gray-50 text-gray-900 antialiased">
        {children}
      </body>
    );
  }

  return (
    <body
      className="min-h-screen bg-white text-gray-900 antialiased"
      dir={dir()}
      lang={locale}
    >
      <Header />
      <main className="min-h-[calc(100vh-4rem)]">{children}</main>
      <Footer />
      <WhatsAppButton />
    </body>
  );
}
