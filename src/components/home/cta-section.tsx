"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Phone, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocaleStore } from "@/lib/store";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

const DEFAULT_CTA_IMAGE = "https://images.unsplash.com/photo-1530497610245-94d3c16cda28?w=1200&q=80";

export function CTASection() {
  const { t } = useLocaleStore();
  const [ctaImage, setCtaImage] = useState(DEFAULT_CTA_IMAGE);

  useEffect(() => {
    async function fetchImage() {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("company_settings")
        .select("cta_image")
        .order("id", { ascending: true })
        .limit(1)
        .maybeSingle();
      if (error) {
        console.warn("Failed to fetch CTA image:", error.message);
        return;
      }
      if (data?.cta_image) setCtaImage(data.cta_image);
    }
    fetchImage();
  }, []);

  return (
    <section className="py-20 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${ctaImage})`,
          }}
        />
        <div className="absolute inset-0 bg-navy-600/85" />
      </div>

      {/* Decorative circles */}
      <div className="absolute top-10 left-10 w-64 h-64 border border-white/10 rounded-full" />
      <div className="absolute bottom-10 right-10 w-40 h-40 border border-white/10 rounded-full" />

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto text-center space-y-8"
        >
          <h2 className="text-3xl md:text-5xl font-bold text-white leading-tight">
            {t("cta_section.title")}
          </h2>
          <p className="text-navy-100 text-lg md:text-xl max-w-2xl mx-auto">{t("cta_section.subtitle")}</p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Link href="/quote">
              <Button
                size="lg"
                className="bg-white text-navy-700 hover:bg-navy-50 gap-2 text-base shadow-xl"
              >
                {t("cta_section.button")}
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <a href="tel:+213XXXXXXXXX">
              <Button
                size="lg"
                variant="outline"
                className="border-white/40 text-white bg-white/10 backdrop-blur-sm hover:bg-white/20 gap-2 text-base"
              >
                <Phone className="h-5 w-5" />
                {t("contact.phone")}
              </Button>
            </a>
          </div>

          {/* WhatsApp quick link */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            <a
              href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "213XXXXXXXXX"}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-navy-200 hover:text-white transition-colors mt-2"
            >
              <MessageCircle className="h-4 w-4" />
              Or chat with us on WhatsApp
            </a>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
