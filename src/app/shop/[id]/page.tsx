"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Download,
  CheckCircle2,
  XCircle,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProductCard } from "@/components/products/product-card";
import { useLocaleStore } from "@/lib/store";
import { createClient } from "@/lib/supabase/client";
import type { Product } from "@/lib/types";
import { normalizeDatasheets } from "@/lib/datasheets";

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { t, locale } = useLocaleStore();
  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [currentImage, setCurrentImage] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProduct() {
      const supabase = createClient();
      const { data } = await supabase
        .from("products")
        .select("*, category:categories(*), product_images(*)")
        .eq("id", id)
        .single();

      if (data) {
        setProduct(data);
        // Fetch related products
        if (data.category_id) {
          const { data: relatedData } = await supabase
            .from("products")
            .select("*, category:categories(*), product_images(*)")
            .eq("category_id", data.category_id)
            .neq("id", id)
            .limit(4);
          if (relatedData) setRelated(relatedData);
        }
      }
      setLoading(false);
    }
    if (id) fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="animate-pulse space-y-8">
          <div className="h-8 bg-gray-100 rounded w-32" />
          <div className="grid md:grid-cols-2 gap-8">
            <div className="aspect-square bg-gray-100 rounded-xl" />
            <div className="space-y-4">
              <div className="h-8 bg-gray-100 rounded w-3/4" />
              <div className="h-4 bg-gray-100 rounded w-1/2" />
              <div className="h-32 bg-gray-100 rounded" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <p className="text-gray-500 text-lg">Product not found.</p>
        <Link href="/shop">
          <Button variant="outline" className="mt-4">
            {t("common.back")}
          </Button>
        </Link>
      </div>
    );
  }

  const name =
    locale === "ar" && product.name_ar
      ? product.name_ar
      : locale === "fr" && product.name_fr
        ? product.name_fr
        : product.name;

  const description =
    locale === "ar" && product.description_ar
      ? product.description_ar
      : locale === "fr" && product.description_fr
        ? product.description_fr
        : product.description;

  const images = product.product_images?.sort(
    (a, b) => a.sort_order - b.sort_order
  ) || [];

  const specs = product.specifications || {};
  const datasheets = normalizeDatasheets(product.datasheets, product.datasheet_url);

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <Link
          href="/shop"
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-navy-600 mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          {t("common.back")}
        </Link>

        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          {/* Image Gallery */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="relative aspect-square rounded-xl overflow-hidden bg-gray-50 border border-gray-200">
              {images.length > 0 ? (
                <Image
                  src={images[currentImage]?.image_url}
                  alt={name}
                  fill
                  className="object-contain p-4"
                  priority
                />
              ) : (
                <div className="w-full h-full placeholder-gradient flex items-center justify-center">
                  <span className="text-6xl">🏥</span>
                </div>
              )}

              {images.length > 1 && (
                <>
                  <button
                    onClick={() =>
                      setCurrentImage((prev) =>
                        prev === 0 ? images.length - 1 : prev - 1
                      )
                    }
                    className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 hover:bg-white shadow-md transition-colors"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() =>
                      setCurrentImage((prev) =>
                        prev === images.length - 1 ? 0 : prev + 1
                      )
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 hover:bg-white shadow-md transition-colors"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </>
              )}

              {/* Badges */}
              <div className="absolute top-3 left-3 flex flex-col gap-1">
                {product.is_new && (
                  <Badge variant="info">{t("product.new")}</Badge>
                )}
                {product.is_best_seller && (
                  <Badge variant="warning">{t("product.best_seller")}</Badge>
                )}
              </div>
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
                {images.map((img, i) => (
                  <button
                    key={img.id}
                    onClick={() => setCurrentImage(i)}
                    className={`shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                      currentImage === i
                        ? "border-navy-600"
                        : "border-gray-200"
                    }`}
                  >
                    <Image
                      src={img.image_url}
                      alt={`${name} ${i + 1}`}
                      width={80}
                      height={80}
                      className="object-cover w-full h-full"
                    />
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          {/* Product Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div>
              <p className="text-sm text-navy-600 font-medium uppercase tracking-wider">
                {product.brand}
              </p>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mt-1">
                {name}
              </h1>
              {product.category && (
                <p className="text-sm text-gray-500 mt-1">
                  {t("product.category")}: {product.category.name}
                </p>
              )}
            </div>

            {/* Availability */}
            <div className="flex items-center gap-2">
              {product.is_available ? (
                <>
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <span className="text-green-600 font-medium">
                    {t("product.available")}
                  </span>
                </>
              ) : (
                <>
                  <XCircle className="h-5 w-5 text-red-600" />
                  <span className="text-red-600 font-medium">
                    {t("product.unavailable")}
                  </span>
                </>
              )}
            </div>

            {/* Description */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                {t("product.description")}
              </h2>
              <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                {description}
              </p>
            </div>

            {/* Specifications */}
            {Object.keys(specs).length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-3">
                  {t("product.specifications")}
                </h2>
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  {Object.entries(specs).map(([key, value], i) => (
                    <div
                      key={key}
                      className={`flex ${
                        i % 2 === 0 ? "bg-gray-50" : "bg-white"
                      }`}
                    >
                      <div className="w-1/3 px-4 py-3 font-medium text-sm text-gray-700 border-r border-gray-200">
                        {key}
                      </div>
                      <div className="w-2/3 px-4 py-3 text-sm text-gray-600">
                        {value}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Certifications */}
            {product.certifications && product.certifications.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-2">
                  {t("product.certifications")}
                </h2>
                <div className="flex flex-wrap gap-2">
                  {product.certifications.map((cert) => (
                    <Badge key={cert} variant="success">
                      {cert}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Link href={`/quote?product=${product.id}`} className="flex-1">
                <Button size="lg" className="w-full">
                  {t("product.request_quote")}
                </Button>
              </Link>
              {datasheets.length > 0 && (
                <div className="flex flex-col gap-3 w-full sm:w-auto">
                  {datasheets.map((datasheet, index) => (
                    <a
                      key={`${datasheet.url}-${index}`}
                      href={datasheet.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button size="lg" variant="outline" className="gap-2 w-full sm:w-auto">
                        <Download className="h-4 w-4" />
                        {datasheet.name || t("product.download_datasheet")}
                      </Button>
                    </a>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Related Products */}
        {related.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">
              {t("product.related")}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {related.map((product, i) => (
                <ProductCard key={product.id} product={product} index={i} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
