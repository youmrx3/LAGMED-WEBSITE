"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLocaleStore } from "@/lib/store";
import type { Product } from "@/lib/types";

interface ProductCardProps {
  product: Product;
  index?: number;
}

export function ProductCard({ product, index = 0 }: ProductCardProps) {
  const { t, locale } = useLocaleStore();

  const name =
    locale === "ar" && product.name_ar
      ? product.name_ar
      : locale === "fr" && product.name_fr
        ? product.name_fr
        : product.name;

  const primaryImage = product.product_images?.find((img) => img.is_primary)
    ?.image_url ||
    product.product_images?.[0]?.image_url ||
    "/placeholder-product.png";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
    >
      <Link href={`/shop/${product.id}`}>
        <div className="group rounded-xl border border-gray-200 bg-white overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300">
          <div className="relative aspect-square overflow-hidden bg-gray-50">
            <Image
              src={primaryImage}
              alt={name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
            />
            <div className="absolute top-3 left-3 flex flex-col gap-1">
              {product.is_new && (
                <Badge variant="info">{t("product.new")}</Badge>
              )}
              {product.is_best_seller && (
                <Badge variant="warning">{t("product.best_seller")}</Badge>
              )}
            </div>
            {!product.is_available && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <span className="text-white font-semibold text-sm bg-red-600 px-3 py-1 rounded-full">
                  {t("product.unavailable")}
                </span>
              </div>
            )}
          </div>
          <div className="p-4 space-y-2">
            <p className="text-xs text-navy-600 font-medium uppercase tracking-wide">
              {product.brand}
            </p>
            <h3 className="font-semibold text-gray-900 line-clamp-2 group-hover:text-navy-600 transition-colors">
              {name}
            </h3>
            {product.category && (
              <p className="text-xs text-gray-500">{product.category.name}</p>
            )}
            <Button variant="outline" size="sm" className="w-full mt-2">
              {t("common.view_details")}
            </Button>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
