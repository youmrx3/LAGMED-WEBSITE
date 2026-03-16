import type { Metadata } from "next";
import "./globals.css";
import { ClientBody } from "./client-body";

export const metadata: Metadata = {
  title: "LAGMED - Medical Equipment Supplier | Bordj Bou Arreridj, Algeria",
  description:
    "LAGMED is a leading medical equipment supplier based in Bordj Bou Arreridj, Algeria. Browse our catalog of certified medical devices and request a quote today.",
  keywords: [
    "medical equipment",
    "Algeria",
    "Bordj Bou Arreridj",
    "healthcare",
    "medical devices",
    "LAGMED",
  ],
  openGraph: {
    title: "LAGMED - Premium Medical Equipment",
    description: "Your trusted partner for quality healthcare solutions in Algeria.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <ClientBody>{children}</ClientBody>
    </html>
  );
}
