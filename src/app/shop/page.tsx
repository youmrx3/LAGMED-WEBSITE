"use client";

import { Suspense, useEffect, useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/products/product-card";
import { useLocaleStore } from "@/lib/store";
import { createClient } from "@/lib/supabase/client";
import type { Product, Category } from "@/lib/types";

const PRODUCTS_PER_PAGE = 12;

export default function ShopPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin h-8 w-8 border-4 border-navy-600 border-t-transparent rounded-full" /></div>}>
      <ShopPageContent />
    </Suspense>
  );
}

function ShopPageContent() {
  const { t } = useLocaleStore();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  const page = parseInt(searchParams.get("page") || "1");
  const search = searchParams.get("search") || "";
  const category = searchParams.get("category") || "";
  const sort = searchParams.get("sort") || "newest";
  const brand = searchParams.get("brand") || "";

  const updateParams = useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([key, value]) => {
        if (value) {
          params.set(key, value);
        } else {
          params.delete(key);
        }
      });
      // Reset to page 1 when filters change (unless explicitly setting page)
      if (!("page" in updates)) {
        params.set("page", "1");
      }
      router.push(`/shop?${params.toString()}`);
    },
    [searchParams, router]
  );

  useEffect(() => {
    async function fetchCategories() {
      const supabase = createClient();
      const { data } = await supabase.from("categories").select("*").order("name");
      if (data) setCategories(data);
    }
    fetchCategories();
  }, []);

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      const supabase = createClient();

      let query = supabase
        .from("products")
        .select("*, category:categories(*), product_images(*)", { count: "exact" });

      if (search) {
        query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%,brand.ilike.%${search}%`);
      }

      if (category) {
        // Find category by slug
        const cat = categories.find((c) => c.slug === category);
        if (cat) {
          query = query.eq("category_id", cat.id);
        }
      }

      if (brand) {
        query = query.eq("brand", brand);
      }

      // Sorting
      switch (sort) {
        case "oldest":
          query = query.order("created_at", { ascending: true });
          break;
        case "name_asc":
          query = query.order("name", { ascending: true });
          break;
        case "name_desc":
          query = query.order("name", { ascending: false });
          break;
        default:
          query = query.order("created_at", { ascending: false });
      }

      const from = (page - 1) * PRODUCTS_PER_PAGE;
      const to = from + PRODUCTS_PER_PAGE - 1;
      query = query.range(from, to);

      const { data, count } = await query;
      if (data) setProducts(data);
      if (count !== null) setTotalCount(count);
      setLoading(false);
    }
    fetchProducts();
  }, [page, search, category, sort, brand, categories]);

  const totalPages = Math.ceil(totalCount / PRODUCTS_PER_PAGE);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold text-gray-900">{t("shop.title")}</h1>
          <p className="text-gray-600 mt-2">{t("shop.subtitle")}</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <aside
            className={`lg:w-64 shrink-0 ${
              showFilters ? "block" : "hidden lg:block"
            }`}
          >
            <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6 sticky top-20">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-gray-900">{t("shop.filters")}</h2>
                <button
                  className="lg:hidden"
                  onClick={() => setShowFilters(false)}
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Search */}
              <div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder={t("shop.search")}
                    className="pl-9"
                    value={search}
                    onChange={(e) => updateParams({ search: e.target.value })}
                  />
                </div>
              </div>

              {/* Categories */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("product.category")}
                </label>
                <Select
                  value={category}
                  onChange={(e) => updateParams({ category: e.target.value })}
                >
                  <option value="">{t("shop.all_categories")}</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.slug}>
                      {cat.name}
                    </option>
                  ))}
                </Select>
              </div>

              {/* Sort */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("shop.sort")}
                </label>
                <Select
                  value={sort}
                  onChange={(e) => updateParams({ sort: e.target.value })}
                >
                  <option value="newest">{t("shop.sort_newest")}</option>
                  <option value="oldest">{t("shop.sort_oldest")}</option>
                  <option value="name_asc">{t("shop.sort_name_asc")}</option>
                  <option value="name_desc">{t("shop.sort_name_desc")}</option>
                </Select>
              </div>

              {(search || category || brand) && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full"
                  onClick={() =>
                    router.push("/shop")
                  }
                >
                  Clear Filters
                </Button>
              )}
            </div>
          </aside>

          {/* Products Grid */}
          <div className="flex-1">
            {/* Mobile filter toggle */}
            <div className="lg:hidden mb-4">
              <Button
                variant="outline"
                onClick={() => setShowFilters(true)}
                className="gap-2"
              >
                <SlidersHorizontal className="h-4 w-4" />
                {t("shop.filters")}
              </Button>
            </div>

            {/* Results count */}
            <div className="mb-6 text-sm text-gray-600">
              {t("shop.showing")} {products.length} {t("shop.of")} {totalCount}{" "}
              {t("shop.products")}
            </div>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="rounded-xl border border-gray-200 bg-white overflow-hidden animate-pulse"
                  >
                    <div className="aspect-square bg-gray-100" />
                    <div className="p-4 space-y-3">
                      <div className="h-3 bg-gray-100 rounded w-1/3" />
                      <div className="h-4 bg-gray-100 rounded w-2/3" />
                      <div className="h-3 bg-gray-100 rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : products.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product, i) => (
                  <ProductCard key={product.id} product={product} index={i} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">{t("shop.no_products")}</p>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-8">
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => updateParams({ page: String(i + 1) })}
                    className={`h-10 w-10 rounded-lg text-sm font-medium transition-colors ${
                      page === i + 1
                        ? "bg-navy-600 text-white"
                        : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
