"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Shield, Stethoscope, HeartPulse, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocaleStore } from "@/lib/store";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

const defaultHeroImages = [
  "https://images.unsplash.com/photo-1516549655169-df83a0774514?w=1200&q=80",
  "https://images.unsplash.com/photo-1538108149393-fbbd81895907?w=1200&q=80",
  "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=1200&q=80",
];

export function HeroSection() {
  const { t } = useLocaleStore();
  const [currentImage, setCurrentImage] = useState(0);
  const [heroImages, setHeroImages] = useState<string[]>(defaultHeroImages);

  useEffect(() => {
    async function fetchImages() {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("company_settings")
        .select("hero_image_1, hero_image_2, hero_image_3")
        .order("id", { ascending: true })
        .limit(1)
        .maybeSingle();
      if (error) {
        console.warn("Failed to fetch hero images:", error.message);
        return;
      }
      if (data) {
        const imgs = [data.hero_image_1, data.hero_image_2, data.hero_image_3].filter(Boolean) as string[];
        if (imgs.length > 0) setHeroImages(imgs);
      }
    }
    fetchImages();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [heroImages.length]);

  return (
    <section className="relative overflow-hidden min-h-[calc(100vh-4rem)]">
      {/* Background image carousel */}
      {heroImages.map((img, i) => (
        <motion.div
          key={i}
          initial={false}
          animate={{ opacity: i === currentImage ? 1 : 0 }}
          transition={{ duration: 1.2, ease: "easeInOut" }}
          className="absolute inset-0"
        >
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${img})` }}
          />
        </motion.div>
      ))}

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/70" />

      {/* Animated medical icons floating */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ y: [-20, 20, -20], rotate: [0, 10, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[15%] left-[8%] text-white/10"
        >
          <Stethoscope className="h-24 w-24" />
        </motion.div>
        <motion.div
          animate={{ y: [15, -15, 15], rotate: [0, -8, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[25%] right-[10%] text-white/10"
        >
          <HeartPulse className="h-20 w-20" />
        </motion.div>
        <motion.div
          animate={{ y: [-10, 25, -10], rotate: [0, 5, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-[20%] left-[15%] text-white/10"
        >
          <Activity className="h-16 w-16" />
        </motion.div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-24 md:py-36 relative z-10 flex flex-col items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="max-w-5xl mx-auto text-center space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/15 backdrop-blur-md text-white text-sm font-medium mb-8 border border-white/20">
              <Shield className="h-4 w-4 text-navy-200" />
              Certified Medical Equipment Supplier
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white leading-tight tracking-tight">
              {t("hero.title")}
            </h1>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-lg md:text-xl text-gray-200 max-w-2xl mx-auto leading-relaxed"
          >
            {t("hero.subtitle")}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link href="/shop">
              <Button size="lg" className="gap-2 text-base shadow-xl shadow-navy-600/20">
                {t("hero.cta")}
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <Link href="/quote">
              <Button size="lg" variant="outline" className="text-base bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white/20">
                {t("cta_section.button")}
              </Button>
            </Link>
          </motion.div>

          {/* Trust indicators */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.6 }}
            className="flex flex-wrap justify-center gap-6 md:gap-12 pt-8"
          >
            {[
              { label: "ISO 13485", sub: "Certified" },
              { label: "CE", sub: "Marked" },
              { label: "500+", sub: "Products" },
              { label: "24/7", sub: "Support" },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.8 + i * 0.1 }}
                className="text-center px-4 py-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10"
              >
                <div className="text-xl md:text-2xl font-bold text-white">{item.label}</div>
                <div className="text-xs text-gray-300">{item.sub}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Carousel dots */}
        <div className="flex gap-2 mt-12">
          {heroImages.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentImage(i)}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === currentImage ? "w-8 bg-white" : "w-2 bg-white/40"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Bottom wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
          <path d="M0 50L60 45C120 40 240 30 360 35C480 40 600 60 720 65C840 70 960 60 1080 50C1200 40 1320 35 1380 32.5L1440 30V100H1380C1320 100 1200 100 1080 100C960 100 840 100 720 100C600 100 480 100 360 100C240 100 120 100 60 100H0V50Z" fill="white"/>
        </svg>
      </div>
    </section>
  );
}
