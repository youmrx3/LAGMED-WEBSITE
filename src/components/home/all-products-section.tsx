"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Search, Filter, FileText, ChevronDown, ShoppingBag, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useLocaleStore } from "@/lib/store";
import { createClient } from "@/lib/supabase/client";
import type { Product, Category } from "@/lib/types";

export function AllProductsSection() {
  const { t, locale } = useLocaleStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient();

      const [productsRes, categoriesRes] = await Promise.all([
        supabase
          .from("products")
          .select("*, category:categories(*), product_images(*)")
          .eq("is_available", true)
          .order("created_at", { ascending: false }),
        supabase.from("categories").select("*").order("name"),
      ]);

      if (productsRes.data) setProducts(productsRes.data);
      if (categoriesRes.data) setCategories(categoriesRes.data);
      setLoading(false);
    }
    fetchData();
  }, []);

  const getName = (p: Product) =>
    locale === "ar" && p.name_ar ? p.name_ar : locale === "fr" && p.name_fr ? p.name_fr : p.name;

  const getCatName = (c: Category) =>
    locale === "ar" && c.name_ar ? c.name_ar : locale === "fr" && c.name_fr ? c.name_fr : c.name;

  const filtered = products.filter((p) => {
    const matchesSearch =
      !search ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.name_fr.toLowerCase().includes(search.toLowerCase()) ||
      p.brand.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = !selectedCategory || p.category_id === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const displayed = showAll ? filtered : filtered.slice(0, 8);

  if (loading) {
    return (
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-navy-600 border-t-transparent" />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="products" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-navy-50 text-navy-600 text-sm font-medium mb-4">
            <ShoppingBag className="h-4 w-4" />
            {t("shop.subtitle")}
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
            {t("shop.title")}
          </h2>
        </motion.div>

        {/* Filters bar */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col sm:flex-row gap-3 mb-8 max-w-3xl mx-auto"
        >
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("shop.search")}
              className="pl-10 bg-gray-50 border-gray-200"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Category filter */}
          <div className="relative">
            <select
              value={selectedCategory || ""}
              onChange={(e) => setSelectedCategory(e.target.value || null)}
              className="appearance-none bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 pr-10 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-navy-500 w-full sm:w-auto min-w-[180px]"
            >
              <option value="">{t("shop.all_categories")}</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {getCatName(cat)}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          </div>
        </motion.div>

        {/* Results count */}
        {(search || selectedCategory) && (
          <p className="text-sm text-gray-500 text-center mb-6">
            {t("shop.showing")} <span className="font-semibold text-gray-700">{filtered.length}</span> {t("shop.products")}
            {selectedCategory && (
              <button
                onClick={() => { setSelectedCategory(null); setSearch(""); }}
                className="ml-2 text-navy-600 hover:underline text-xs"
              >
                Clear filters
              </button>
            )}
          </p>
        )}

        {/* Products Grid */}
        {filtered.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {displayed.map((product, i) => {
                const name = getName(product);
                const primaryImage =
                  product.product_images?.find((img) => img.is_primary)?.image_url ||
                  product.product_images?.[0]?.image_url;

                return (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: Math.min(i * 0.05, 0.3), duration: 0.4 }}
                    className="group"
                  >
                    <div className="rounded-2xl border border-gray-100 bg-white overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 h-full flex flex-col">
                      {/* Image */}
                      <Link href={`/shop/${product.id}`}>
                        <div className="relative aspect-[4/3] overflow-hidden bg-gray-50">
                          {primaryImage ? (
                            <Image
                              src={primaryImage}
                              alt={name}
                              fill
                              className="object-cover group-hover:scale-110 transition-transform duration-700"
                              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-50">
                              <ShoppingBag className="h-12 w-12 text-gray-300" />
                            </div>
                          )}
                          <div className="absolute top-3 left-3 flex flex-col gap-1">
                            {product.is_new && (
                              <Badge variant="info">{t("product.new")}</Badge>
                            )}
                            {product.is_best_seller && (
                              <Badge variant="warning">{t("product.best_seller")}</Badge>
                            )}
                          </div>
                        </div>
                      </Link>

                      {/* Content */}
                      <div className="p-4 flex-1 flex flex-col">
                        <p className="text-xs text-navy-600 font-semibold uppercase tracking-wider mb-1">
                          {product.brand}
                        </p>
                        <Link href={`/shop/${product.id}`}>
                          <h3 className="font-semibold text-gray-900 line-clamp-2 group-hover:text-navy-600 transition-colors mb-1">
                            {name}
                          </h3>
                        </Link>
                        {product.category && (
                          <p className="text-xs text-gray-400 mb-3">
                            {getCatName(product.category)}
                          </p>
                        )}

                        <div className="mt-auto flex gap-2">
                          <Link href={`/shop/${product.id}`} className="flex-1">
                            <Button variant="outline" size="sm" className="w-full text-xs">
                              {t("common.view_details")}
                            </Button>
                          </Link>
                          <Link href={`/quote?product=${product.id}`}>
                            <Button size="sm" className="gap-1 text-xs px-3">
                              <FileText className="h-3.5 w-3.5" />
                              {t("cta_section.button")}
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Show more / View all */}
            {filtered.length > 8 && (
              <div className="text-center mt-10 space-y-3">
                {!showAll ? (
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => setShowAll(true)}
                    className="gap-2"
                  >
                    <ChevronDown className="h-4 w-4" />
                    Show All Products ({filtered.length})
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => setShowAll(false)}
                    className="gap-2"
                  >
                    Show Less
                  </Button>
                )}
              </div>
            )}

            <div className="text-center mt-6">
              <Link
                href="/shop"
                className="text-navy-600 font-semibold hover:text-navy-700 transition-colors text-sm"
              >
                {t("categories.view_all")} →
              </Link>
            </div>
          </>
        ) : (
          <div className="text-center py-16">
            <ShoppingBag className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">{t("shop.no_products")}</p>
          </div>
        )}
      </div>
    </section>
  );
}
