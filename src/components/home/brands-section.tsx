"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useLocaleStore } from "@/lib/store";
import { createClient } from "@/lib/supabase/client";
import type { Brand } from "@/lib/types";

export function BrandsSection() {
  const { t } = useLocaleStore();
  const [brands, setBrands] = useState<Brand[]>([]);

  useEffect(() => {
    async function fetchBrands() {
      const supabase = createClient();
      const { data } = await supabase
        .from("brands")
        .select("*")
        .order("sort_order", { ascending: true });
      if (data && data.length > 0) setBrands(data);
    }
    fetchBrands();
  }, []);

  // Don't render section if no brands
  if (brands.length === 0) return null;

  // Duplicate for infinite scroll effect
  const scrollBrands = [...brands, ...brands];

  return (
    <section className="py-14 bg-gray-50 overflow-hidden border-y border-gray-100">
      <div className="container mx-auto px-4 mb-8">
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center text-sm font-semibold text-gray-400 uppercase tracking-widest"
        >
          {t("brands.title")}
        </motion.p>
      </div>

      {/* Scrolling row */}
      <div className="relative">
        <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-gray-50 to-transparent z-10" />
        <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-gray-50 to-transparent z-10" />

        <motion.div
          className="flex gap-8 items-center"
          animate={{ x: ["0%", "-50%"] }}
          transition={{ x: { duration: Math.max(15, brands.length * 3), repeat: Infinity, ease: "linear" } }}
        >
          {scrollBrands.map((brand, i) => (
            <div
              key={`${brand.id}-${i}`}
              className="flex-shrink-0 flex items-center gap-3 px-6 py-4 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="w-10 h-10 rounded-lg overflow-hidden flex items-center justify-center flex-shrink-0">
                {brand.logo_url ? (
                  <img
                    src={brand.logo_url}
                    alt={brand.name}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-navy-500 to-navy-700 flex items-center justify-center text-white font-bold text-sm rounded-lg">
                    {brand.name.substring(0, 2).toUpperCase()}
                  </div>
                )}
              </div>
              <span className="text-gray-700 font-medium whitespace-nowrap">{brand.name}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
