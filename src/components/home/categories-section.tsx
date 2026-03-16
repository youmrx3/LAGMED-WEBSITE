"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { useLocaleStore } from "@/lib/store";
import { createClient } from "@/lib/supabase/client";
import type { Category } from "@/lib/types";

export function CategoriesSection() {
  const { t, locale } = useLocaleStore();
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    async function fetchCategories() {
      const supabase = createClient();
      const { data } = await supabase
        .from("categories")
        .select("*")
        .order("name")
        .limit(8);
      if (data) setCategories(data);
    }
    fetchCategories();
  }, []);

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
            {t("categories.title")}
          </h2>
          <p className="text-gray-600 mt-3">{t("categories.subtitle")}</p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {categories.map((cat, i) => {
            const name =
              locale === "ar" && cat.name_ar
                ? cat.name_ar
                : locale === "fr" && cat.name_fr
                  ? cat.name_fr
                  : cat.name;

            return (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
              >
                <Link
                  href={`/shop?category=${cat.slug}`}
                  className="group block rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all"
                >
                  <div className="relative aspect-[4/3] bg-gray-50">
                    {cat.image_url ? (
                      <Image
                        src={cat.image_url}
                        alt={name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full placeholder-gradient flex items-center justify-center">
                        <span className="text-4xl">🏥</span>
                      </div>
                    )}
                  </div>
                  <div className="p-4 text-center">
                    <h3 className="font-semibold text-gray-900 group-hover:text-navy-600 transition-colors">
                      {name}
                    </h3>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>

        {categories.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            <p>Categories will appear here once added via the admin panel.</p>
          </div>
        )}

        {categories.length > 0 && (
          <div className="text-center mt-8">
            <Link href="/shop" className="text-navy-600 font-medium hover:underline">
              {t("categories.view_all")} →
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
