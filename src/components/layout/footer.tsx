"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { MapPin, Phone, Mail, Facebook, Instagram, Linkedin } from "lucide-react";
import { useLocaleStore } from "@/lib/store";
import { createClient } from "@/lib/supabase/client";
import type { CompanySettings } from "@/lib/types";

export function Footer() {
  const { t } = useLocaleStore();
  const year = new Date().getFullYear();
  const [settings, setSettings] = useState<CompanySettings | null>(null);

  useEffect(() => {
    const supabase = createClient();

    async function fetchSettings() {
      const { data, error } = await supabase
        .from("company_settings")
        .select("*")
        .order("id", { ascending: true })
        .limit(1)
        .maybeSingle();
      if (error) {
        console.warn("Failed to fetch footer settings:", error.message);
        return;
      }
      if (data) setSettings(data);
    }

    fetchSettings();

    // Poll for updates every 5 seconds
    const interval = setInterval(fetchSettings, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <footer className="bg-navy-600 text-gray-300">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center">
              <Image
                src={settings?.footer_logo_url || settings?.logo_url || "/logo%20v2-11.png"}
                alt="GL MEDICAL"
                width={140}
                height={48}
                className="object-contain h-10 w-auto"
              />
            </Link>
            <p className="text-sm leading-relaxed text-navy-100">{t("footer.description")}</p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">{t("footer.quick_links")}</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-sm hover:text-white transition-colors">
                  {t("nav.home")}
                </Link>
              </li>
              <li>
                <Link href="/shop" className="text-sm hover:text-white transition-colors">
                  {t("nav.shop")}
                </Link>
              </li>
              <li>
                <Link href="/#about" className="text-sm hover:text-white transition-colors">
                  {t("nav.about")}
                </Link>
              </li>
              <li>
                <Link href="/quote" className="text-sm hover:text-white transition-colors">
                  {t("product.request_quote")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-white font-semibold mb-4">{t("footer.contact_info")}</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2 text-sm">
                <MapPin className="h-4 w-4 mt-0.5 text-navy-200 shrink-0" />
                {settings?.address || "Bordj Bou Arreridj, Algeria"}
              </li>
              <li className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 text-navy-200 shrink-0" />
                {settings?.phone || "+213 XX XX XX XX"}
              </li>
              <li className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-navy-200 shrink-0" />
                {settings?.email || "contact@glmedical.dz"}
              </li>
            </ul>
          </div>

          {/* Social & Marketplace */}
          <div>
            <h3 className="text-white font-semibold mb-4">{t("footer.follow_us")}</h3>
            <div className="flex gap-3 flex-wrap">
              <a
                href={settings?.facebook_url || "#"}
                target={settings?.facebook_url ? "_blank" : undefined}
                rel={settings?.facebook_url ? "noopener noreferrer" : undefined}
                className="p-2 rounded-lg bg-navy-500 hover:bg-navy-400 transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href={settings?.instagram_url || "#"}
                target={settings?.instagram_url ? "_blank" : undefined}
                rel={settings?.instagram_url ? "noopener noreferrer" : undefined}
                className="p-2 rounded-lg bg-navy-500 hover:bg-navy-400 transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href={settings?.linkedin_url || "#"}
                target={settings?.linkedin_url ? "_blank" : undefined}
                rel={settings?.linkedin_url ? "noopener noreferrer" : undefined}
                className="p-2 rounded-lg bg-navy-500 hover:bg-navy-400 transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin className="h-5 w-5" />
              </a>
              <a
                href={settings?.ouadkniss_url || "#"}
                target={settings?.ouadkniss_url ? "_blank" : undefined}
                rel={settings?.ouadkniss_url ? "noopener noreferrer" : undefined}
                className="p-2 rounded-lg bg-navy-500 hover:bg-navy-400 transition-colors flex items-center justify-center"
                aria-label="Ouadkniss"
                title="Shop on Ouadkniss"
              >
                <Image src="/ouadkniss.png" alt="Ouadkniss" width={20} height={20} className="h-5 w-5 object-contain" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-navy-500 text-center text-sm">
          <p>&copy; {year} GL MEDICAL. {t("footer.rights")}</p>
        </div>
      </div>
    </footer>
  );
}
