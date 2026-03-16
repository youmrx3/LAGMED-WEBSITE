"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Plus, X, Upload } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import { productSchema, type ProductFormData } from "@/lib/validations";
import type { Category, ProductImage } from "@/lib/types";
import { useToastStore } from "@/lib/toast-store";

export default function AdminProductFormPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const isEdit = params.id !== "new";

  const [categories, setCategories] = useState<Category[]>([]);
  const [existingImages, setExistingImages] = useState<ProductImage[]>([]);
  const [newImages, setNewImages] = useState<File[]>([]);
  const [datasheetFile, setDatasheetFile] = useState<File | null>(null);
  const [specEntries, setSpecEntries] = useState<{ key: string; value: string }[]>([
    { key: "", value: "" },
  ]);
  const [certEntries, setCertEntries] = useState<string[]>([""]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(isEdit);
  const { addToast } = useToastStore();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProductFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(productSchema) as any,
    defaultValues: {
      name: "",
      name_ar: "",
      name_fr: "",
      description: "",
      description_ar: "",
      description_fr: "",
      brand: "",
      category_id: "",
      is_new: false,
      is_best_seller: false,
      is_featured: false,
      is_available: true,
      certifications: [],
      specifications: {},
    },
  });

  const fetchProduct = useCallback(async () => {
    if (!isEdit) return;
    const supabase = createClient();
    const { data } = await supabase
      .from("products")
      .select("*, product_images(*)")
      .eq("id", params.id)
      .single();

    if (data) {
      reset({
        name: data.name,
        name_ar: data.name_ar || "",
        name_fr: data.name_fr || "",
        description: data.description,
        description_ar: data.description_ar || "",
        description_fr: data.description_fr || "",
        brand: data.brand,
        category_id: data.category_id || "",
        price: data.price,
        is_new: data.is_new,
        is_best_seller: data.is_best_seller,
        is_featured: data.is_featured,
        is_available: data.is_available,
      });

      if (data.specifications && typeof data.specifications === "object") {
        const entries = Object.entries(data.specifications as Record<string, string>).map(
          ([key, value]) => ({ key, value })
        );
        if (entries.length > 0) setSpecEntries(entries);
      }

      if (data.certifications && data.certifications.length > 0) {
        setCertEntries(data.certifications);
      }

      if (data.product_images) {
        setExistingImages(data.product_images);
      }
    }
    setLoading(false);
  }, [isEdit, params.id, reset]);

  useEffect(() => {
    async function fetchCategories() {
      const supabase = createClient();
      const { data } = await supabase.from("categories").select("*").order("name");
      if (data) setCategories(data);
    }
    fetchCategories();
    fetchProduct();
  }, [fetchProduct]);

  const uploadImages = async (productId: string) => {
    if (newImages.length === 0) return;
    const supabase = createClient();

    for (let i = 0; i < newImages.length; i++) {
      const file = newImages[i];
      const ext = file.name.split(".").pop();
      const fileName = `${productId}/${Date.now()}-${i}.${ext}`;

      const { data: uploadData } = await supabase.storage
        .from("products")
        .upload(fileName, file);

      if (uploadData) {
        const {
          data: { publicUrl },
        } = supabase.storage.from("products").getPublicUrl(uploadData.path);

        await supabase.from("product_images").insert({
          product_id: productId,
          image_url: publicUrl,
          is_primary: existingImages.length === 0 && i === 0,
          sort_order: existingImages.length + i,
        });
      }
    }
  };

  const uploadDatasheet = async (productId: string): Promise<string | null> => {
    if (!datasheetFile) return null;
    const supabase = createClient();
    const ext = datasheetFile.name.split(".").pop();
    const fileName = `${productId}/${Date.now()}.${ext}`;

    const { data } = await supabase.storage
      .from("datasheets")
      .upload(fileName, datasheetFile);

    if (data) {
      const {
        data: { publicUrl },
      } = supabase.storage.from("datasheets").getPublicUrl(data.path);
      return publicUrl;
    }
    return null;
  };

  const deleteImage = async (imageId: string) => {
    const supabase = createClient();
    await supabase.from("product_images").delete().eq("id", imageId);
    setExistingImages((prev) => prev.filter((img) => img.id !== imageId));
  };

  const onSubmit = async (data: ProductFormData) => {
    setSaving(true);

    const specifications: Record<string, string> = {};
    specEntries.forEach((entry) => {
      if (entry.key.trim() && entry.value.trim()) {
        specifications[entry.key.trim()] = entry.value.trim();
      }
    });

    const certifications = certEntries.filter((c) => c.trim() !== "");

    const supabase = createClient();

    try {
      if (isEdit) {
        const datasheetUrl = await uploadDatasheet(params.id);

        const updateData: Record<string, unknown> = {
          ...data,
          specifications,
          certifications,
        };
        if (datasheetUrl) updateData.datasheet_url = datasheetUrl;

        await supabase.from("products").update(updateData).eq("id", params.id);
        await uploadImages(params.id);
      } else {
        const { data: newProduct } = await supabase
          .from("products")
          .insert({
            ...data,
            specifications,
            certifications,
          })
          .select()
          .single();

        if (newProduct) {
          const datasheetUrl = await uploadDatasheet(newProduct.id);
          if (datasheetUrl) {
            await supabase
              .from("products")
              .update({ datasheet_url: datasheetUrl })
              .eq("id", newProduct.id);
          }
          await uploadImages(newProduct.id);
        }
      }

      router.push("/admin/products");
      addToast("success", isEdit ? "Product updated successfully!" : "Product created successfully!");
    } catch (err) {
      console.error("Error saving product:", err);
      addToast("error", "Failed to save product. Please try again.");
    }

    setSaving(false);
  };

  if (loading) {
    return (
      <div className="text-center py-8 text-gray-500">Loading...</div>
    );
  }

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/products">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          {isEdit ? "Edit Product" : "New Product"}
        </h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Info */}
        <Card>
          <CardContent className="space-y-4">
            <h2 className="text-lg font-semibold">Basic Information</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name (English) *
                </label>
                <Input {...register("name")} error={errors.name?.message} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name (French)
                </label>
                <Input {...register("name_fr")} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name (Arabic)
                </label>
                <Input {...register("name_ar")} dir="rtl" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Brand *
                </label>
                <Input {...register("brand")} error={errors.brand?.message} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category *
                </label>
                <Select {...register("category_id")} error={errors.category_id?.message}>
                  <option value="">Select category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </Select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price (DZD) - Optional
              </label>
              <Input
                {...register("price")}
                type="number"
                placeholder="Leave empty for quote-based pricing"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description (English) *
              </label>
              <Textarea
                {...register("description")}
                error={errors.description?.message}
                rows={4}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description (French)
              </label>
              <Textarea {...register("description_fr")} rows={3} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description (Arabic)
              </label>
              <Textarea {...register("description_ar")} rows={3} dir="rtl" />
            </div>
          </CardContent>
        </Card>

        {/* Images */}
        <Card>
          <CardContent className="space-y-4">
            <h2 className="text-lg font-semibold">Images</h2>

            {existingImages.length > 0 && (
              <div className="flex flex-wrap gap-3">
                {existingImages.map((img) => (
                  <div
                    key={img.id}
                    className="relative w-24 h-24 rounded-lg overflow-hidden border border-gray-200"
                  >
                    <Image
                      src={img.image_url}
                      alt=""
                      fill
                      className="object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => deleteImage(img.id)}
                      className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div>
              <label className="flex items-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-navy-400 transition-colors">
                <Upload className="h-5 w-5 text-gray-400" />
                <span className="text-sm text-gray-600">
                  Upload images ({newImages.length} selected)
                </span>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    setNewImages((prev) => [...prev, ...files]);
                  }}
                />
              </label>
              {newImages.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {newImages.map((file, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-1 px-2 py-1 bg-gray-100 rounded text-xs"
                    >
                      {file.name}
                      <button
                        type="button"
                        onClick={() =>
                          setNewImages((prev) => prev.filter((_, idx) => idx !== i))
                        }
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Specifications */}
        <Card>
          <CardContent className="space-y-4">
            <h2 className="text-lg font-semibold">Technical Specifications</h2>
            {specEntries.map((entry, i) => (
              <div key={i} className="flex gap-2">
                <Input
                  placeholder="Key (e.g., Weight)"
                  value={entry.key}
                  onChange={(e) => {
                    const updated = [...specEntries];
                    updated[i] = { ...updated[i], key: e.target.value };
                    setSpecEntries(updated);
                  }}
                />
                <Input
                  placeholder="Value (e.g., 5kg)"
                  value={entry.value}
                  onChange={(e) => {
                    const updated = [...specEntries];
                    updated[i] = { ...updated[i], value: e.target.value };
                    setSpecEntries(updated);
                  }}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() =>
                    setSpecEntries((prev) => prev.filter((_, idx) => idx !== i))
                  }
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                setSpecEntries((prev) => [...prev, { key: "", value: "" }])
              }
              className="gap-1"
            >
              <Plus className="h-4 w-4" /> Add Specification
            </Button>
          </CardContent>
        </Card>

        {/* Certifications */}
        <Card>
          <CardContent className="space-y-4">
            <h2 className="text-lg font-semibold">Certifications</h2>
            {certEntries.map((cert, i) => (
              <div key={i} className="flex gap-2">
                <Input
                  placeholder="e.g., CE, ISO 13485"
                  value={cert}
                  onChange={(e) => {
                    const updated = [...certEntries];
                    updated[i] = e.target.value;
                    setCertEntries(updated);
                  }}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() =>
                    setCertEntries((prev) => prev.filter((_, idx) => idx !== i))
                  }
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setCertEntries((prev) => [...prev, ""])}
              className="gap-1"
            >
              <Plus className="h-4 w-4" /> Add Certification
            </Button>
          </CardContent>
        </Card>

        {/* Datasheet */}
        <Card>
          <CardContent className="space-y-4">
            <h2 className="text-lg font-semibold">Datasheet (PDF)</h2>
            <label className="flex items-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-navy-400 transition-colors">
              <Upload className="h-5 w-5 text-gray-400" />
              <span className="text-sm text-gray-600">
                {datasheetFile ? datasheetFile.name : "Upload PDF datasheet"}
              </span>
              <input
                type="file"
                accept=".pdf"
                className="hidden"
                onChange={(e) => setDatasheetFile(e.target.files?.[0] || null)}
              />
            </label>
          </CardContent>
        </Card>

        {/* Flags */}
        <Card>
          <CardContent className="space-y-4">
            <h2 className="text-lg font-semibold">Product Flags</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" {...register("is_new")} className="rounded" />
                <span className="text-sm">New Arrival</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  {...register("is_best_seller")}
                  className="rounded"
                />
                <span className="text-sm">Best Seller</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  {...register("is_featured")}
                  className="rounded"
                />
                <span className="text-sm">Featured</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  {...register("is_available")}
                  className="rounded"
                />
                <span className="text-sm">Available</span>
              </label>
            </div>
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex gap-3">
          <Button type="submit" size="lg" loading={saving}>
            {isEdit ? "Update Product" : "Create Product"}
          </Button>
          <Link href="/admin/products">
            <Button type="button" variant="outline" size="lg">
              Cancel
            </Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
