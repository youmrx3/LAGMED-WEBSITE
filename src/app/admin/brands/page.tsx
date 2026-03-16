"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Pencil, Trash2, X, Upload, GripVertical, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { BulkActionBar } from "@/components/ui/bulk-action-bar";
import { createClient } from "@/lib/supabase/client";
import { brandSchema, type BrandFormData } from "@/lib/validations";
import type { Brand } from "@/lib/types";
import { useToastStore } from "@/lib/toast-store";

export default function AdminBrandsPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const { addToast } = useToastStore();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<BrandFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(brandSchema) as any,
    defaultValues: { name: "", logo_url: null, sort_order: 0 },
  });

  const logoUrlValue = watch("logo_url");

  const fetchBrands = async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from("brands")
      .select("*")
      .order("sort_order", { ascending: true });
    if (data) setBrands(data);
  };

  useEffect(() => {
    fetchBrands();
  }, []);

  const openNew = () => {
    reset({ name: "", logo_url: null, sort_order: brands.length });
    setLogoPreview(null);
    setEditingId(null);
    setShowForm(true);
  };

  const openEdit = (brand: Brand) => {
    reset({
      name: brand.name,
      logo_url: brand.logo_url,
      sort_order: brand.sort_order,
    });
    setLogoPreview(brand.logo_url);
    setEditingId(brand.id);
    setShowForm(true);
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const supabase = createClient();
    const fileExt = file.name.split(".").pop();
    const fileName = `brands/brand-${Date.now()}.${fileExt}`;
    const { error } = await supabase.storage.from("company").upload(fileName, file);
    if (!error) {
      const {
        data: { publicUrl },
      } = supabase.storage.from("company").getPublicUrl(fileName);
      setValue("logo_url", publicUrl);
      setLogoPreview(publicUrl);
    }
    setUploading(false);
  };

  const onSubmit = async (data: BrandFormData) => {
    setSaving(true);
    const supabase = createClient();

    try {
      if (editingId) {
        const { error } = await supabase.from("brands").update(data).eq("id", editingId);
        if (error) throw error;
        addToast("success", "Brand updated successfully!");
      } else {
        const { error } = await supabase.from("brands").insert(data);
        if (error) throw error;
        addToast("success", "Brand added successfully!");
      }

      setShowForm(false);
      setEditingId(null);
      setLogoPreview(null);
      reset();
      await fetchBrands();
    } catch (error) {
      console.error("Brand save error:", error);
      const message = error && typeof error === 'object' && 'message' in error 
        ? (error as any).message 
        : "Failed to save brand";
      addToast("error", message);
    } finally {
      setSaving(false);
    }
  };

  const deleteBrand = async (id: string) => {
    if (!confirm("Are you sure you want to delete this brand?")) return;
    const supabase = createClient();
    const { error } = await supabase.from("brands").delete().eq("id", id);
    if (error) {
      addToast("error", "Failed to delete brand.");
    } else {
      addToast("success", "Brand deleted successfully!");
    }
    fetchBrands();
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const bulkDelete = async () => {
    if (!confirm(`Delete ${selectedIds.size} selected brand(s)?`)) return;
    const supabase = createClient();
    const { error } = await supabase
      .from("brands")
      .delete()
      .in("id", Array.from(selectedIds));
    if (error) {
      addToast("error", "Failed to delete some brands.");
    } else {
      addToast("success", `${selectedIds.size} brand(s) deleted!`);
    }
    setSelectedIds(new Set());
    fetchBrands();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Trusted Brands</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage the brands displayed on the homepage carousel.
          </p>
        </div>
        {!showForm && (
          <Button onClick={openNew} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Brand
          </Button>
        )}
      </div>

      {/* Form */}
      {showForm && (
        <Card>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">
                {editingId ? "Edit Brand" : "New Brand"}
              </h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                  setLogoPreview(null);
                }}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Brand Name *
                  </label>
                  <Input {...register("name")} error={errors.name?.message} placeholder="e.g. Siemens Healthineers" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sort Order
                  </label>
                  <Input {...register("sort_order")} type="number" />
                </div>
              </div>

              {/* Logo Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Brand Logo
                </label>
                <div className="flex gap-4 items-start">
                  <div className="w-24 h-24 rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden bg-gray-50 flex-shrink-0">
                    {logoPreview || logoUrlValue ? (
                      <img
                        src={logoPreview || logoUrlValue || ""}
                        alt="Logo preview"
                        className="w-full h-full object-contain p-2"
                      />
                    ) : (
                      <ImageIcon className="h-8 w-8 text-gray-300" />
                    )}
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="relative">
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        disabled={uploading}
                        className="text-sm"
                      />
                      {uploading && (
                        <div className="absolute inset-0 bg-white/60 flex items-center justify-center rounded-lg">
                          <div className="h-4 w-4 border-2 border-navy-600 border-t-transparent rounded-full animate-spin" />
                        </div>
                      )}
                    </div>
                    <Input
                      value={logoUrlValue || ""}
                      onChange={(e) => {
                        setValue("logo_url", e.target.value);
                        setLogoPreview(e.target.value);
                      }}
                      placeholder="Or paste logo URL..."
                      className="text-sm"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button type="submit" loading={saving}>
                  {editingId ? "Update Brand" : "Add Brand"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowForm(false);
                    setEditingId(null);
                    setLogoPreview(null);
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Brands Grid */}
      {brands.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <ImageIcon className="h-12 w-12 mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500">No brands yet. Add your first trusted brand!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {brands.map((brand) => (
            <Card key={brand.id} className={`group hover:shadow-md transition-shadow ${selectedIds.has(brand.id) ? "ring-2 ring-navy-500 bg-navy-50" : ""}`}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={selectedIds.has(brand.id)}
                    onChange={() => toggleSelect(brand.id)}
                    className="rounded border-gray-300 text-navy-600 focus:ring-navy-500 flex-shrink-0"
                  />
                  <div className="w-14 h-14 rounded-lg overflow-hidden bg-gray-50 border flex-shrink-0 flex items-center justify-center">
                    {brand.logo_url ? (
                      <img
                        src={brand.logo_url}
                        alt={brand.name}
                        className="w-full h-full object-contain p-1"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-navy-500 to-navy-700 flex items-center justify-center text-white font-bold text-lg">
                        {brand.name.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{brand.name}</p>
                    <p className="text-xs text-gray-400">Order: {brand.sort_order}</p>
                  </div>
                </div>
                <div className="flex items-center justify-end gap-1 mt-3 pt-3 border-t border-gray-100">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => openEdit(brand)}
                    className="h-8 w-8"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteBrand(brand.id)}
                    className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Bulk Action Bar */}
      <BulkActionBar
        selectedCount={selectedIds.size}
        totalCount={brands.length}
        onClearSelection={() => setSelectedIds(new Set())}
        onSelectAll={() => setSelectedIds(new Set(brands.map((b) => b.id)))}
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
