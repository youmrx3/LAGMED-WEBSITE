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
import type { Category, ProductImage, Brand } from "@/lib/types";
import { useToastStore } from "@/lib/toast-store";

export default function AdminProductFormPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const isEdit = params?.id && params.id !== "new";

  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [existingImages, setExistingImages] = useState<ProductImage[]>([]);
  const [newImages, setNewImages] = useState<File[]>([]);
  const [datasheetFile, setDatasheetFile] = useState<File | null>(null);
  const [specEntries, setSpecEntries] = useState<{ key: string; value: string }[]>([
    { key: "", value: "" },
  ]);
  const [certEntries, setCertEntries] = useState<string[]>([""]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(isEdit ? true : false);
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
    if (!isEdit || !params?.id) {
      setLoading(false);
      return;
    }
    
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("products")
        .select("*, product_images(*)")
        .eq("id", params.id)
        .single();

      if (error) {
        console.error("Error fetching product:", error);
        addToast("error", "Failed to load product");
        setLoading(false);
        return;
      }

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
    } catch (error) {
      console.error("Unexpected error:", error);
      addToast("error", "An unexpected error occurred");
      setLoading(false);
    }
  }, [isEdit, params?.id, reset, addToast]);

  useEffect(() => {
    async function fetchData() {
      try {
        const supabase = createClient();
        const { data: categoriesData } = await supabase.from("categories").select("*").order("name");
        if (categoriesData) setCategories(categoriesData);
        
        const { data: brandsData } = await supabase.from("brands").select("*").order("name");
        if (brandsData) setBrands(brandsData);
      } catch (error) {
        console.error("Error fetching categories/brands:", error);
      }
    }
    
    fetchData();
    fetchProduct();
  }, [fetchProduct]);

  const uploadImages = async (productId: string) => {
    if (newImages.length === 0) {
      return; // No images to upload
    }

    const supabase = createClient();
    const uploadResults: { success: string[]; failed: string[] } = { success: [], failed: [] };

    for (const file of newImages) {
      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("bucket", "products");

        console.log(`Uploading image: ${file.name}...`);
        
        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`Upload HTTP error for ${file.name}: ${response.status} ${errorText}`);
          uploadResults.failed.push(file.name);
          continue;
        }

        const result = await response.json();
        
        if (!result.success) {
          console.error(`Upload failed for ${file.name}:`, result.error);
          uploadResults.failed.push(file.name);
          addToast("error", `Upload error for ${file.name}: ${result.error}`);
          continue;
        }

        if (!result.url) {
          console.error(`No URL returned for ${file.name}`);
          uploadResults.failed.push(file.name);
          addToast("error", `No URL returned for ${file.name}`);
          continue;
        }

        // Insert image record into database
        const { error: insertError } = await supabase
          .from("product_images")
          .insert({
            product_id: productId,
            image_url: result.url,
            is_primary: existingImages.length === 0 && uploadResults.success.length === 0,
            sort_order: existingImages.length + uploadResults.success.length,
          });

        if (insertError) {
          console.error(`Error inserting image record for ${file.name}:`, insertError);
          uploadResults.failed.push(file.name);
          addToast("error", `Failed to save ${file.name} to database: ${insertError.message}`);
          continue;
        }

        console.log(`Successfully uploaded: ${file.name}`);
        uploadResults.success.push(file.name);
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        console.error(`Exception uploading ${file.name}:`, error);
        uploadResults.failed.push(file.name);
        addToast("error", `Failed to upload ${file.name}: ${errorMsg}`);
      }
    }

    // Report results
    if (uploadResults.failed.length > 0) {
      const failedCount = uploadResults.failed.length;
      const failedNames = uploadResults.failed.join(", ");
      throw new Error(`Failed to upload ${failedCount} image(s): ${failedNames}`);
    }

    if (uploadResults.success.length > 0) {
      addToast("success", `${uploadResults.success.length} image(s) uploaded successfully!`);
    }
  };

  const uploadDatasheet = async (productId: string): Promise<string | null> => {
    if (!datasheetFile) {
      return null;
    }

    const formData = new FormData();
    formData.append("file", datasheetFile);
    formData.append("bucket", "datasheets");

    try {
      console.log(`Uploading datasheet: ${datasheetFile.name}...`);
      
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Upload failed: ${response.status} ${errorText}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || "Upload failed");
      }

      if (!result.url) {
        throw new Error("No URL returned from upload");
      }

      console.log(`Datasheet uploaded successfully: ${result.url}`);
      addToast("success", "Datasheet uploaded successfully!");
      return result.url;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.error(`Datasheet upload error: ${errorMsg}`);
      addToast("warning", `Datasheet upload failed (optional): ${errorMsg}`);
      // Return null but don't throw - datasheet is optional
      return null;
    }
  };

  const deleteImage = async (imageId: string) => {
    const supabase = createClient();
    await supabase.from("product_images").delete().eq("id", imageId);
    setExistingImages((prev) => prev.filter((img) => img.id !== imageId));
  };

  const onSubmit = async (data: ProductFormData) => {
    setSaving(true);

    // Ensure we have the product ID for edit mode
    if (isEdit && !params?.id) {
      addToast("error", "Product ID not found");
      setSaving(false);
      return;
    }

    const specifications: Record<string, string> = {};
    specEntries.forEach((entry) => {
      if (entry.key.trim() && entry.value.trim()) {
        specifications[entry.key.trim()] = entry.value.trim();
      }
    });

    const certifications = certEntries.filter((c) => c.trim() !== "");

    const supabase = createClient();

    try {
      let productId: string;

      if (isEdit) {
        productId = params.id!; // Safe now due to check above
        const updateData: Record<string, unknown> = {
          ...data,
          specifications,
          certifications,
        };

        // Upload datasheet first if present
        if (datasheetFile) {
          const datasheetUrl = await uploadDatasheet(productId);
          if (datasheetUrl) {
            updateData.datasheet_url = datasheetUrl;
          }
        }

        // Update product in database
        const { error } = await supabase
          .from("products")
          .update(updateData)
          .eq("id", productId);
        
        if (error) {
          throw new Error(`Failed to update product: ${error.message}`);
        }

        // Upload new images
        if (newImages.length > 0) {
          await uploadImages(productId);
          setNewImages([]); // Clear new images after upload
        }

        addToast("success", "Product updated successfully!");
      } else {
        // Create new product
        const { data: newProduct, error } = await supabase
          .from("products")
          .insert({
            ...data,
            specifications,
            certifications,
          })
          .select()
          .single();

        if (error) {
          throw new Error(`Failed to create product: ${error.message}`);
        }

        if (!newProduct) {
          throw new Error("Failed to create product: No data returned");
        }

        productId = newProduct.id;

        // Upload datasheet if present
        if (datasheetFile) {
          const datasheetUrl = await uploadDatasheet(productId);
          if (datasheetUrl) {
            const { error: updateError } = await supabase
              .from("products")
              .update({ datasheet_url: datasheetUrl })
              .eq("id", productId);
            if (updateError) {
              throw new Error(`Failed to update datasheet: ${updateError.message}`);
            }
          }
        }

        // Upload images
        if (newImages.length > 0) {
          await uploadImages(productId);
          setNewImages([]);
        }

        addToast("success", "Product created successfully!");
      }

      // Redirect after successful save/update
      setTimeout(() => {
        router.push("/admin/products");
      }, 500);
    } catch (err) {
      console.error("Error saving product:", err);
      const message = err instanceof Error ? err.message : "Failed to save product. Please try again.";
      addToast("error", message);
    } finally {
      setSaving(false);
    }
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
                <Select {...register("brand")} error={errors.brand?.message}>
                  <option value="">Select a brand</option>
                  {brands.map((brand) => (
                    <option key={brand.id} value={brand.name}>
                      {brand.name}
                    </option>
                  ))}
                </Select>
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
