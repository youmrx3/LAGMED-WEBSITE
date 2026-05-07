"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Plus, Pencil, Trash2, Search, X, Eye, Package, Tag, FileText, CheckCircle, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { BulkActionBar } from "@/components/ui/bulk-action-bar";
import { createClient } from "@/lib/supabase/client";
import type { Product } from "@/lib/types";
import { normalizeDatasheets } from "@/lib/datasheets";
import { AnimatePresence, motion } from "framer-motion";
import { useToastStore } from "@/lib/toast-store";

function ProductDetailModal({
  product,
  onClose,
}: {
  product: Product;
  onClose: () => void;
}) {
  const images = product.product_images || [];
  const datasheets = normalizeDatasheets(product.datasheets, product.datasheet_url);
  const [selectedImage, setSelectedImage] = useState(0);
  const primaryImage =
    images.find((img) => img.is_primary)?.image_url || images[0]?.image_url;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.2 }}
        className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Package className="h-5 w-5 text-navy-600" />
            Product Details
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <div className="p-5 space-y-6">
          {/* Images + Main Info */}
          <div className="flex flex-col md:flex-row gap-6">
            {/* Image Gallery */}
            <div className="md:w-1/3 space-y-3">
              <div className="aspect-square rounded-xl overflow-hidden bg-gray-100 border">
                {images.length > 0 ? (
                  <img
                    src={images[selectedImage]?.image_url || primaryImage}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl">
                    📦
                  </div>
                )}
              </div>
              {images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto">
                  {images.map((img, i) => (
                    <button
                      key={img.id}
                      onClick={() => setSelectedImage(i)}
                      className={`w-14 h-14 rounded-lg overflow-hidden border-2 flex-shrink-0 transition-all ${
                        i === selectedImage
                          ? "border-navy-500 shadow-md"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <img
                        src={img.image_url}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Main Info */}
            <div className="md:w-2/3 space-y-4">
              <div>
                <h3 className="text-xl font-bold text-gray-900">{product.name}</h3>
                {product.name_fr && (
                  <p className="text-sm text-gray-500 mt-0.5">{product.name_fr}</p>
                )}
                {product.name_ar && (
                  <p className="text-sm text-gray-500 mt-0.5" dir="rtl">
                    {product.name_ar}
                  </p>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                {product.brand && (
                  <Badge variant="info" className="gap-1">
                    <Tag className="h-3 w-3" />
                    {product.brand}
                  </Badge>
                )}
                {product.category?.name && (
                  <Badge variant="default" className="gap-1">
                    {product.category.name}
                  </Badge>
                )}
                {product.is_new && <Badge variant="info">New</Badge>}
                {product.is_best_seller && <Badge variant="warning">Best Seller</Badge>}
                {product.is_featured && <Badge variant="success">Featured</Badge>}
                {!product.is_available && <Badge variant="danger">Unavailable</Badge>}
              </div>

              {product.price && (
                <p className="text-lg font-semibold text-navy-600">
                  {product.price.toLocaleString()} DA
                </p>
              )}

              {/* Description */}
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-1 flex items-center gap-1.5">
                  <FileText className="h-4 w-4" />
                  Description
                </h4>
                <p className="text-sm text-gray-600 leading-relaxed">{product.description}</p>
                {product.description_fr && (
                  <p className="text-sm text-gray-500 mt-2 leading-relaxed italic">
                    FR: {product.description_fr}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Specifications */}
          {product.specifications && Object.keys(product.specifications).length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1.5">
                <Info className="h-4 w-4" />
                Specifications
              </h4>
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {Object.entries(product.specifications).map(([key, value]) => (
                    <div
                      key={key}
                      className="flex justify-between gap-2 text-sm py-1.5 px-3 bg-white rounded-lg"
                    >
                      <span className="font-medium text-gray-600">{key}</span>
                      <span className="text-gray-900">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Certifications */}
          {product.certifications && product.certifications.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1.5">
                <CheckCircle className="h-4 w-4" />
                Certifications
              </h4>
              <div className="flex flex-wrap gap-2">
                {product.certifications.map((cert, i) => (
                  <Badge key={i} variant="success" className="text-xs">
                    {cert}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Datasheet */}
          {datasheets.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1.5">
                <FileText className="h-4 w-4" />
                Datasheets
              </h4>
              <div className="flex flex-col gap-2">
                {datasheets.map((datasheet, index) => (
                  <a
                    key={`${datasheet.url}-${index}`}
                    href={datasheet.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm text-navy-600 hover:underline"
                  >
                    <FileText className="h-4 w-4" />
                    {datasheet.name}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-5 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
          <p className="text-xs text-gray-400">
            ID: {product.id.substring(0, 8)}...
          </p>
          <div className="flex gap-2">
            <Link href={`/admin/products/${product.id}`}>
              <Button size="sm" variant="outline" className="gap-1.5">
                <Pencil className="h-3.5 w-3.5" />
                Edit Product
              </Button>
            </Link>
            <Button size="sm" variant="ghost" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const { addToast } = useToastStore();

  const fetchProducts = async () => {
    setLoading(true);
    const supabase = createClient();
    let query = supabase
      .from("products")
      .select("*, category:categories(name), product_images(*)")
      .order("created_at", { ascending: false });

    if (search) {
      query = query.or(`name.ilike.%${search}%,brand.ilike.%${search}%`);
    }

    const { data } = await query;
    if (data) setProducts(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchProducts();
  }, [search]);

  const deleteProduct = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    const supabase = createClient();
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) {
      addToast("error", "Failed to delete product.");
    } else {
      addToast("success", "Product deleted successfully!");
    }
    fetchProducts();
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === products.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(products.map((p) => p.id)));
    }
  };

  const bulkDelete = async () => {
    if (!confirm(`Delete ${selectedIds.size} selected product(s)?`)) return;
    const supabase = createClient();
    const { error } = await supabase
      .from("products")
      .delete()
      .in("id", Array.from(selectedIds));
    if (error) {
      addToast("error", "Failed to delete some products.");
    } else {
      addToast("success", `${selectedIds.size} product(s) deleted successfully!`);
    }
    setSelectedIds(new Set());
    fetchProducts();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Products</h1>
        <Link href="/admin/products/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Add Product
          </Button>
        </Link>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search products..."
          className="pl-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="text-center py-8 text-gray-500">Loading...</div>
      ) : products.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-gray-500">No products found. Add your first product!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left w-10">
                    <input
                      type="checkbox"
                      checked={products.length > 0 && selectedIds.size === products.length}
                      onChange={toggleSelectAll}
                      className="rounded border-gray-300 text-navy-600 focus:ring-navy-500"
                    />
                  </th>
                  <th className="px-4 py-3 text-left">Product</th>
                  <th className="px-4 py-3 text-left">Category</th>
                  <th className="px-4 py-3 text-left">Brand</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {products.map((product) => {
                  const primaryImage = product.product_images?.find(
                    (img) => img.is_primary
                  )?.image_url || product.product_images?.[0]?.image_url;

                  return (
                    <tr key={product.id} className={`hover:bg-gray-50 cursor-pointer transition-colors ${selectedIds.has(product.id) ? "bg-navy-50" : ""}`} onClick={() => setSelectedProduct(product)}>
                      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={selectedIds.has(product.id)}
                          onChange={() => toggleSelect(product.id)}
                          className="rounded border-gray-300 text-navy-600 focus:ring-navy-500"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                            {primaryImage ? (
                              <Image
                                src={primaryImage}
                                alt={product.name}
                                width={48}
                                height={48}
                                className="object-cover w-full h-full"
                              />
                            ) : (
                              <div className="w-full h-full placeholder-gradient flex items-center justify-center text-lg">
                                📦
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{product.name}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {product.category?.name || "—"}
                      </td>
                      <td className="px-4 py-3 text-gray-600">{product.brand}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1 flex-wrap">
                          {product.is_new && <Badge variant="info">New</Badge>}
                          {product.is_best_seller && (
                            <Badge variant="warning">Best Seller</Badge>
                          )}
                          {!product.is_available && (
                            <Badge variant="danger">Unavailable</Badge>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setSelectedProduct(product)}
                            title="View Details"
                          >
                            <Eye className="h-4 w-4 text-navy-600" />
                          </Button>
                          <Link href={`/admin/products/${product.id}`}>
                            <Button variant="ghost" size="icon">
                              <Pencil className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteProduct(product.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Product Detail Modal */}
      <AnimatePresence>
        {selectedProduct && (
          <ProductDetailModal
            product={selectedProduct}
            onClose={() => setSelectedProduct(null)}
          />
        )}
      </AnimatePresence>

      {/* Bulk Action Bar */}
      <BulkActionBar
        selectedCount={selectedIds.size}
        totalCount={products.length}
        onClearSelection={() => setSelectedIds(new Set())}
        onSelectAll={() => setSelectedIds(new Set(products.map((p) => p.id)))}
        actions={[
          {
            label: "Delete",
            icon: <Trash2 className="h-4 w-4" />,
            onClick: bulkDelete,
            variant: "danger",
          },
        ]}
      />
    </div>
  );
}
