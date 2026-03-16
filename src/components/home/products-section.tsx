"use client";

import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useLocaleStore } from "@/lib/store";
import { createClient } from "@/lib/supabase/client";
import { ProductCard } from "@/components/products/product-card";
import type { Product } from "@/lib/types";
import Link from "next/link";

interface ProductsSectionProps {
  type: "best_seller" | "new";
}

export function ProductsSection({ type }: ProductsSectionProps) {
  const { t } = useLocaleStore();
  const [products, setProducts] = useState<Product[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const title =
    type === "best_seller"
      ? t("best_sellers.title")
      : t("new_arrivals.title");
  const subtitle =
    type === "best_seller"
      ? t("best_sellers.subtitle")
      : t("new_arrivals.subtitle");

  useEffect(() => {
    async function fetchProducts() {
      const supabase = createClient();
      let query = supabase
        .from("products")
        .select("*, category:categories(*), product_images(*)")
        .limit(12);

      if (type === "best_seller") {
        query = query.eq("is_best_seller", true);
      } else {
        query = query.eq("is_new", true);
      }

      query = query.order("created_at", { ascending: false });

      const { data } = await query;
      if (data) setProducts(data);
    }
    fetchProducts();
  }, [type]);

  const checkScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 5);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 5);
  };

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const scrollAmount = 320;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
    setTimeout(checkScroll, 400);
  };

  useEffect(() => {
    checkScroll();
    const el = scrollRef.current;
    if (el) el.addEventListener("scroll", checkScroll);
    return () => { if (el) el.removeEventListener("scroll", checkScroll); };
  }, [products]);

  return (
    <section className={`py-20 ${type === "best_seller" ? "bg-gray-50" : "bg-white"}`}>
      <div className="container mx-auto px-4">
        <div className="flex items-end justify-between mb-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              {title}
            </h2>
            <p className="text-gray-600 mt-2">{subtitle}</p>
          </motion.div>

          {products.length > 0 && (
            <div className="hidden md:flex items-center gap-2">
              <button
                onClick={() => scroll("left")}
                disabled={!canScrollLeft}
                className="p-2 rounded-full border border-gray-300 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={() => scroll("right")}
                disabled={!canScrollRight}
                className="p-2 rounded-full border border-gray-300 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          )}
        </div>

        {products.length > 0 ? (
          <div
            ref={scrollRef}
            className="flex gap-6 overflow-x-auto scrollbar-hide pb-4 snap-x snap-mandatory -mx-4 px-4"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {products.map((product, i) => (
              <div key={product.id} className="flex-shrink-0 w-72 snap-start">
                <ProductCard product={product} index={i} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-500 py-8">
            <p>Products will appear here once added via the admin panel.</p>
          </div>
        )}

        {products.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mt-8"
          >
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 text-navy-600 font-semibold hover:text-navy-700 transition-colors"
            >
              {t("categories.view_all")}
              <ChevronRight className="h-4 w-4" />
            </Link>
          </motion.div>
        )}
      </div>
    </section>
  );
}
