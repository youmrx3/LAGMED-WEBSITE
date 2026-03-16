"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Package,
  FileText,
  FolderOpen,
  TrendingUp,
  Store,
  CheckCircle2,
  Clock,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Calendar,
  ShoppingBag,
  Users,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import type { QuoteRequest, Product } from "@/lib/types";

interface DashboardStats {
  totalProducts: number;
  totalQuotes: number;
  pendingQuotes: number;
  contactedQuotes: number;
  completedQuotes: number;
  cancelledQuotes: number;
  totalCategories: number;
  totalStores: number;
  availableProducts: number;
  newProducts: number;
  bestSellers: number;
}

interface QuotesByMonth {
  month: string;
  count: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    totalQuotes: 0,
    pendingQuotes: 0,
    contactedQuotes: 0,
    completedQuotes: 0,
    cancelledQuotes: 0,
    totalCategories: 0,
    totalStores: 0,
    availableProducts: 0,
    newProducts: 0,
    bestSellers: 0,
  });
  const [recentQuotes, setRecentQuotes] = useState<QuoteRequest[]>([]);
  const [recentProducts, setRecentProducts] = useState<Product[]>([]);
  const [topProducts, setTopProducts] = useState<
    { product_id: string; count: number; product: Product | null }[]
  >([]);
  const [quotesByMonth, setQuotesByMonth] = useState<QuotesByMonth[]>([]);

  useEffect(() => {
    async function fetchDashboard() {
      const supabase = createClient();

      // Product counts
      const { count: productCount } = await supabase
        .from("products")
        .select("*", { count: "exact", head: true });

      const { count: availableCount } = await supabase
        .from("products")
        .select("*", { count: "exact", head: true })
        .eq("is_available", true);

      const { count: newCount } = await supabase
        .from("products")
        .select("*", { count: "exact", head: true })
        .eq("is_new", true);

      const { count: bestSellerCount } = await supabase
        .from("products")
        .select("*", { count: "exact", head: true })
        .eq("is_best_seller", true);

      // Quote counts by status
      const { count: quoteCount } = await supabase
        .from("quote_requests")
        .select("*", { count: "exact", head: true });

      const { count: pendingCount } = await supabase
        .from("quote_requests")
        .select("*", { count: "exact", head: true })
        .eq("status", "pending");

      const { count: contactedCount } = await supabase
        .from("quote_requests")
        .select("*", { count: "exact", head: true })
        .eq("status", "contacted");

      const { count: completedCount } = await supabase
        .from("quote_requests")
        .select("*", { count: "exact", head: true })
        .eq("status", "completed");

      const { count: cancelledCount } = await supabase
        .from("quote_requests")
        .select("*", { count: "exact", head: true })
        .eq("status", "cancelled");

      // Categories count
      const { count: catCount } = await supabase
        .from("categories")
        .select("*", { count: "exact", head: true });

      // Stores count
      const { count: storeCount } = await supabase
        .from("stores")
        .select("*", { count: "exact", head: true });

      setStats({
        totalProducts: productCount || 0,
        totalQuotes: quoteCount || 0,
        pendingQuotes: pendingCount || 0,
        contactedQuotes: contactedCount || 0,
        completedQuotes: completedCount || 0,
        cancelledQuotes: cancelledCount || 0,
        totalCategories: catCount || 0,
        totalStores: storeCount || 0,
        availableProducts: availableCount || 0,
        newProducts: newCount || 0,
        bestSellers: bestSellerCount || 0,
      });

      // Recent quotes
      const { data: quotes } = await supabase
        .from("quote_requests")
        .select("*, product:products(name)")
        .order("created_at", { ascending: false })
        .limit(6);
      if (quotes) setRecentQuotes(quotes);

      // Recent products
      const { data: products } = await supabase
        .from("products")
        .select("*, product_images(*)")
        .order("created_at", { ascending: false })
        .limit(5);
      if (products) setRecentProducts(products);

      // Most requested products
      const { data: quotesAll } = await supabase
        .from("quote_requests")
        .select("product_id")
        .not("product_id", "is", null);

      if (quotesAll) {
        const countMap: Record<string, number> = {};
        quotesAll.forEach((q) => {
          if (q.product_id) {
            countMap[q.product_id] = (countMap[q.product_id] || 0) + 1;
          }
        });

        const sorted = Object.entries(countMap)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 5);

        const topProds = await Promise.all(
          sorted.map(async ([pid, count]) => {
            const { data: prod } = await supabase
              .from("products")
              .select("*")
              .eq("id", pid)
              .single();
            return { product_id: pid, count, product: prod };
          })
        );
        setTopProducts(topProds);
      }

      // Quotes by month (last 6 months)
      const { data: allQuotes } = await supabase
        .from("quote_requests")
        .select("created_at")
        .order("created_at", { ascending: false });

      if (allQuotes) {
        const monthMap: Record<string, number> = {};
        const now = new Date();
        for (let i = 5; i >= 0; i--) {
          const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
          const key = d.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
          monthMap[key] = 0;
        }
        allQuotes.forEach((q) => {
          const d = new Date(q.created_at);
          const key = d.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
          if (key in monthMap) monthMap[key]++;
        });
        setQuotesByMonth(
          Object.entries(monthMap).map(([month, count]) => ({ month, count }))
        );
      }
    }
    fetchDashboard();
  }, []);

  const conversionRate =
    stats.totalQuotes > 0
      ? ((stats.completedQuotes / stats.totalQuotes) * 100).toFixed(1)
      : "0";

  const maxMonthQuotes = Math.max(...quotesByMonth.map((q) => q.count), 1);

  const statCards = [
    {
      label: "Total Products",
      value: stats.totalProducts,
      icon: Package,
      color: "text-navy-600 bg-navy-50",
      href: "/admin/products",
      detail: `${stats.availableProducts} available`,
    },
    {
      label: "Quote Requests",
      value: stats.totalQuotes,
      icon: FileText,
      color: "text-green-600 bg-green-50",
      href: "/admin/quotes",
      detail: `${conversionRate}% converted`,
    },
    {
      label: "Pending Quotes",
      value: stats.pendingQuotes,
      icon: Clock,
      color: "text-orange-600 bg-orange-50",
      href: "/admin/quotes",
      detail: `${stats.contactedQuotes} contacted`,
    },
    {
      label: "Categories",
      value: stats.totalCategories,
      icon: FolderOpen,
      color: "text-purple-600 bg-purple-50",
      href: "/admin/categories",
      detail: `${stats.bestSellers} best sellers`,
    },
    {
      label: "Store Locations",
      value: stats.totalStores,
      icon: Store,
      color: "text-teal-600 bg-teal-50",
      href: "/admin/stores",
      detail: "Across Algeria",
    },
    {
      label: "Conversion Rate",
      value: `${conversionRate}%`,
      icon: TrendingUp,
      color: "text-emerald-600 bg-emerald-50",
      href: "/admin/quotes",
      detail: `${stats.completedQuotes} completed`,
    },
  ];

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">
            Overview of your medical equipment store
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/products/new">
            <Button size="sm" className="gap-1.5">
              <Package className="h-4 w-4" />
              Add Product
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map((stat) => (
          <Link key={stat.label} href={stat.href}>
            <Card className="hover:shadow-md transition-all duration-300 hover:-translate-y-0.5">
              <CardContent className="flex items-center gap-4 p-5">
                <div className={`p-3 rounded-xl ${stat.color}`}>
                  <stat.icon className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-400">{stat.detail}</p>
                  <ArrowUpRight className="h-4 w-4 text-gray-300 ml-auto mt-1" />
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Quote Status Breakdown */}
      <Card>
        <CardContent className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-gray-400" />
            Quote Status Breakdown
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-yellow-50 border border-yellow-100">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-4 w-4 text-yellow-600" />
                <span className="text-sm font-medium text-yellow-700">Pending</span>
              </div>
              <p className="text-2xl font-bold text-yellow-800">
                {stats.pendingQuotes}
              </p>
              {stats.totalQuotes > 0 && (
                <div className="mt-2 h-1.5 bg-yellow-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-yellow-500 rounded-full transition-all duration-1000"
                    style={{
                      width: `${(stats.pendingQuotes / stats.totalQuotes) * 100}%`,
                    }}
                  />
                </div>
              )}
            </div>

            <div className="p-4 rounded-xl bg-navy-50 border border-navy-100">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="h-4 w-4 text-navy-600" />
                <span className="text-sm font-medium text-navy-700">Contacted</span>
              </div>
              <p className="text-2xl font-bold text-navy-800">
                {stats.contactedQuotes}
              </p>
              {stats.totalQuotes > 0 && (
                <div className="mt-2 h-1.5 bg-navy-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-navy-500 rounded-full transition-all duration-1000"
                    style={{
                      width: `${(stats.contactedQuotes / stats.totalQuotes) * 100}%`,
                    }}
                  />
                </div>
              )}
            </div>

            <div className="p-4 rounded-xl bg-green-50 border border-green-100">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-700">Completed</span>
              </div>
              <p className="text-2xl font-bold text-green-800">
                {stats.completedQuotes}
              </p>
              {stats.totalQuotes > 0 && (
                <div className="mt-2 h-1.5 bg-green-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500 rounded-full transition-all duration-1000"
                    style={{
                      width: `${(stats.completedQuotes / stats.totalQuotes) * 100}%`,
                    }}
                  />
                </div>
              )}
            </div>

            <div className="p-4 rounded-xl bg-red-50 border border-red-100">
              <div className="flex items-center gap-2 mb-2">
                <ArrowDownRight className="h-4 w-4 text-red-600" />
                <span className="text-sm font-medium text-red-700">Cancelled</span>
              </div>
              <p className="text-2xl font-bold text-red-800">
                {stats.cancelledQuotes}
              </p>
              {stats.totalQuotes > 0 && (
                <div className="mt-2 h-1.5 bg-red-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-red-500 rounded-full transition-all duration-1000"
                    style={{
                      width: `${(stats.cancelledQuotes / stats.totalQuotes) * 100}%`,
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quotes Chart & Recent Quotes */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Quotes Over Time (simple bar chart) */}
        <Card>
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-1 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-gray-400" />
              Quotes Over Time
            </h2>
            <p className="text-xs text-gray-400 mb-6">Last 6 months</p>

            {quotesByMonth.length > 0 ? (
              <div className="flex items-end justify-between gap-2 h-40">
                {quotesByMonth.map((item) => (
                  <div key={item.month} className="flex-1 flex flex-col items-center gap-2">
                    <span className="text-xs font-medium text-gray-900">{item.count}</span>
                    <div className="w-full relative">
                      <div
                        className="w-full rounded-t-lg bg-gradient-to-t from-navy-600 to-navy-400 transition-all duration-1000 min-h-[4px]"
                        style={{
                          height: `${Math.max((item.count / maxMonthQuotes) * 120, 4)}px`,
                        }}
                      />
                    </div>
                    <span className="text-[10px] text-gray-400">{item.month}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-40 text-sm text-gray-400">
                No data yet
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Quote Requests */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <FileText className="h-5 w-5 text-gray-400" />
                Recent Quotes
              </h2>
              <Link
                href="/admin/quotes"
                className="text-xs text-navy-600 hover:underline"
              >
                View all →
              </Link>
            </div>
            {recentQuotes.length > 0 ? (
              <div className="space-y-3">
                {recentQuotes.map((quote) => (
                  <div
                    key={quote.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm text-gray-900 truncate">
                          {quote.name}
                        </p>
                        <Badge
                          variant={
                            quote.status === "pending"
                              ? "warning"
                              : quote.status === "contacted"
                                ? "info"
                                : quote.status === "completed"
                                  ? "success"
                                  : "danger"
                          }
                        >
                          {quote.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {quote.email} · Qty: {quote.quantity} · {formatDate(quote.created_at)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <FileText className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500">No quote requests yet.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Bottom Grid: Top Products & Recently Added Products */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Most Requested Products */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-gray-400" />
                Most Requested
              </h2>
              <Link
                href="/admin/products"
                className="text-xs text-navy-600 hover:underline"
              >
                View all →
              </Link>
            </div>
            {topProducts.length > 0 ? (
              <div className="space-y-3">
                {topProducts.map((item, i) => (
                  <div
                    key={item.product_id}
                    className="flex items-center gap-3 p-3 rounded-lg bg-gray-50"
                  >
                    <div className="flex items-center justify-center w-7 h-7 rounded-full bg-navy-100 text-navy-600 text-xs font-bold">
                      {i + 1}
                    </div>
                    <p className="font-medium text-sm text-gray-900 truncate flex-1">
                      {item.product?.name || "Unknown Product"}
                    </p>
                    <Badge variant="info">{item.count} req</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <ShoppingBag className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500">No data yet.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recently Added Products */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Package className="h-5 w-5 text-gray-400" />
                Recently Added
              </h2>
              <Link
                href="/admin/products/new"
                className="text-xs text-navy-600 hover:underline"
              >
                Add new →
              </Link>
            </div>
            {recentProducts.length > 0 ? (
              <div className="space-y-3">
                {recentProducts.map((product) => {
                  const primaryImage =
                    product.product_images?.find((img) => img.is_primary)?.image_url ||
                    product.product_images?.[0]?.image_url;

                  return (
                    <Link
                      key={product.id}
                      href={`/admin/products/${product.id}`}
                      className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                    >
                      <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
                        {primaryImage ? (
                          <img
                            src={primaryImage}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-sm">
                            📦
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-gray-900 truncate">
                          {product.name}
                        </p>
                        <p className="text-xs text-gray-500">{product.brand}</p>
                      </div>
                      <div className="flex gap-1">
                        {product.is_new && (
                          <Badge variant="info" className="text-[10px]">New</Badge>
                        )}
                        {product.is_best_seller && (
                          <Badge variant="warning" className="text-[10px]">Best</Badge>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <Package className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500">No products yet.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Product Distribution Summary */}
      <Card>
        <CardContent className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Users className="h-5 w-5 text-gray-400" />
            Product Overview
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 rounded-xl bg-gray-50">
              <p className="text-3xl font-bold text-gray-900">{stats.totalProducts}</p>
              <p className="text-sm text-gray-500 mt-1">Total Products</p>
            </div>
            <div className="text-center p-4 rounded-xl bg-green-50">
              <p className="text-3xl font-bold text-green-700">{stats.availableProducts}</p>
              <p className="text-sm text-gray-500 mt-1">Available</p>
            </div>
            <div className="text-center p-4 rounded-xl bg-navy-50">
              <p className="text-3xl font-bold text-navy-700">{stats.newProducts}</p>
              <p className="text-sm text-gray-500 mt-1">New Arrivals</p>
            </div>
            <div className="text-center p-4 rounded-xl bg-orange-50">
              <p className="text-3xl font-bold text-orange-700">{stats.bestSellers}</p>
              <p className="text-sm text-gray-500 mt-1">Best Sellers</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
