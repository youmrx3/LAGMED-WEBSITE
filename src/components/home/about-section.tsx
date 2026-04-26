"use client";

import { motion, useInView } from "framer-motion";
import { Building2, Heart, Users, Clock, CheckCircle2 } from "lucide-react";
import { useLocaleStore } from "@/lib/store";
import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";

const DEFAULT_MAIN_IMAGE = "https://images.unsplash.com/photo-1551076805-e1869033e561?w=800&q=80";
const DEFAULT_SMALL_IMAGE = "https://images.unsplash.com/photo-1581093458791-9f3c3250a8b0?w=400&q=80";

function AnimatedCounter({ target, suffix = "" }: { target: number; suffix?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    let start = 0;
    const duration = 2000;
    const step = Math.ceil(target / (duration / 16));
    const timer = setInterval(() => {
      start += step;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(start);
      }
    }, 16);
    return () => clearInterval(timer);
  }, [isInView, target]);

  return <div ref={ref}>{count}{suffix}</div>;
}

export function AboutSection() {
  const { t } = useLocaleStore();
  const [mainImage, setMainImage] = useState(DEFAULT_MAIN_IMAGE);
  const [smallImage, setSmallImage] = useState(DEFAULT_SMALL_IMAGE);

  useEffect(() => {
    async function fetchImages() {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("company_settings")
        .select("about_image_main, about_image_small")
        .order("id", { ascending: true })
        .limit(1)
        .maybeSingle();
      if (error) {
        console.warn("Failed to fetch about images:", error.message);
        return;
      }
      if (data) {
        if (data.about_image_main) setMainImage(data.about_image_main);
        if (data.about_image_small) setSmallImage(data.about_image_small);
      }
    }
    fetchImages();
  }, []);

  const stats = [
    { icon: Clock, value: 10, suffix: "+", label: t("about.years"), color: "from-navy-500 to-navy-600" },
    { icon: Building2, value: 500, suffix: "+", label: t("about.products_count"), color: "from-emerald-500 to-emerald-600" },
    { icon: Users, value: 200, suffix: "+", label: t("about.clients"), color: "from-purple-500 to-purple-600" },
    { icon: Heart, value: 24, suffix: "/7", label: t("about.support"), color: "from-rose-500 to-rose-600" },
  ];

  const highlights = [
    "ISO 13485 & CE Certified Equipment",
    "National coverage across Algeria",
    "Full after-sales support & training",
    "Competitive pricing guaranteed",
  ];

  return (
    <section id="about" className="py-20 bg-white overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left: Text */}
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="space-y-6"
            >
              <div>
                <p className="text-navy-600 font-semibold text-sm uppercase tracking-wider mb-2">
                  {t("about.subtitle")}
                </p>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight">
                  {t("about.title")}
                </h2>
              </div>
              <p className="text-gray-600 leading-relaxed text-lg">
                {t("about.description")}
              </p>
              <p className="text-gray-600 leading-relaxed">
                {t("about.mission")}
              </p>

              <ul className="space-y-3 pt-2">
                {highlights.map((item, i) => (
                  <motion.li
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 + i * 0.1 }}
                    className="flex items-center gap-3 text-gray-700"
                  >
                    <CheckCircle2 className="h-5 w-5 text-navy-600 flex-shrink-0" />
                    {item}
                  </motion.li>
                ))}
              </ul>
            </motion.div>

            {/* Right: Image + Stats overlay */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="relative"
            >
              {/* Main image */}
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <div
                  className="w-full h-80 md:h-[420px] bg-cover bg-center"
                  style={{
                    backgroundImage: `url(${mainImage})`,
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-navy-900/40 to-transparent" />
              </div>

              {/* Floating accent image */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="absolute -bottom-6 -left-6 w-40 h-40 rounded-xl overflow-hidden shadow-xl border-4 border-white hidden md:block"
              >
                <div
                  className="w-full h-full bg-cover bg-center"
                  style={{
                    backgroundImage: `url(${smallImage})`,
                  }}
                />
              </motion.div>

              {/* Experience badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="absolute -top-4 -right-4 bg-navy-600 text-white rounded-xl px-5 py-4 shadow-lg hidden md:block"
              >
                <div className="text-3xl font-bold">10+</div>
                <div className="text-sm text-navy-100">Years</div>
              </motion.div>
            </motion.div>
          </div>

          {/* Stats bar */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16"
          >
            {stats.map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="relative group"
              >
                <div className="p-6 rounded-2xl bg-gradient-to-br from-gray-50 to-white border border-gray-100 text-center space-y-2 hover:shadow-lg transition-all duration-300">
                  <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${stat.color} text-white shadow-sm`}>
                    <stat.icon className="h-6 w-6" />
                  </div>
                  <div className="text-3xl font-bold text-gray-900">
                    <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                  </div>
                  <div className="text-sm text-gray-600">{stat.label}</div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
