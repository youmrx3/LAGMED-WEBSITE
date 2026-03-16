"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Pencil, Trash2, X, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { BulkActionBar } from "@/components/ui/bulk-action-bar";
import { createClient } from "@/lib/supabase/client";
import { categorySchema, type CategoryFormData } from "@/lib/validations";
import { slugify } from "@/lib/utils";
import type { Category } from "@/lib/types";
import { useToastStore } from "@/lib/toast-store";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const { addToast } = useToastStore();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CategoryFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(categorySchema) as any,
    defaultValues: { name: "", name_ar: "", name_fr: "", slug: "" },
  });

  const nameValue = watch("name");

  const fetchCategories = async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from("categories")
      .select("*")
      .order("name");
    if (data) setCategories(data);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (nameValue && !editingId) {
      setValue("slug", slugify(nameValue));
    }
  }, [nameValue, editingId, setValue]);

  const openNew = () => {
    reset({ name: "", name_ar: "", name_fr: "", slug: "" });
    setImagePreview(null);
    setEditingId(null);
    setShowForm(true);
  };

  const openEdit = (category: Category) => {
    reset({
      name: category.name,
      name_ar: category.name_ar || "",
      name_fr: category.name_fr || "",
      slug: category.slug,
    });
    setImagePreview(category.image_url);
    setEditingId(category.id);
    setShowForm(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("bucket", "company");

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        addToast("error", `Upload failed: ${data.error}`);
        setUploading(false);
        return;
      }

      setImagePreview(data.url);
      addToast("success", "Image uploaded successfully!");
    } catch (error) {
      console.error("Upload error:", error);
      addToast("error", "Failed to upload image");
    }
    setUploading(false);
  };

  const onSubmit = async (data: CategoryFormData) => {
    setSaving(true);
    const supabase = createClient();
    const payload = { ...data, image_url: imagePreview };

    if (editingId) {
      await supabase.from("categories").update(payload).eq("id", editingId);
      addToast("success", "Category updated successfully!");
    } else {
      await supabase.from("categories").insert(payload);
      addToast("success", "Category created successfully!");
    }

    setShowForm(false);
    setEditingId(null);
    reset();
    await fetchCategories();
    setSaving(false);
  };

  const deleteCategory = async (id: string) => {
    if (!confirm("Are you sure you want to delete this category?")) return;
    const supabase = createClient();
    const { error } = await supabase.from("categories").delete().eq("id", id);
    if (error) {
      addToast("error", "Failed to delete category.");
    } else {
      addToast("success", "Category deleted successfully!");
    }
    fetchCategories();
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
    if (selectedIds.size === categories.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(categories.map((c) => c.id)));
    }
  };

  const bulkDelete = async () => {
    if (!confirm(`Delete ${selectedIds.size} selected category(ies)?`)) return;
    const supabase = createClient();
    const { error } = await supabase
      .from("categories")
      .delete()
      .in("id", Array.from(selectedIds));
    if (error) {
      addToast("error", "Failed to delete some categories.");
    } else {
      addToast("success", `${selectedIds.size} category(ies) deleted!`);
    }
    setSelectedIds(new Set());
    fetchCategories();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
        {!showForm && (
          <Button onClick={openNew} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Category
          </Button>
        )}
      </div>

      {/* Form */}
      {showForm && (
        <Card>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">
                {editingId ? "Edit Category" : "New Category"}
              </h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                }}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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

              {/* Category Image */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category Image
                </label>
                <div className="flex gap-4 items-start">
                  <div className="w-24 h-24 rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden bg-gray-50 flex-shrink-0">
                    {imagePreview ? (
                      <img
                        src={imagePreview}
                        alt="Category preview"
                        className="w-full h-full object-cover"
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
                        onChange={handleImageUpload}
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
                      value={imagePreview || ""}
                      onChange={(e) => setImagePreview(e.target.value)}
                      placeholder="Or paste image URL..."
                      className="text-sm"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Slug *
                </label>
                <Input {...register("slug")} error={errors.slug?.message} />
              </div>
              <div className="flex gap-2">
                <Button type="submit" loading={saving}>
                  {editingId ? "Update" : "Create"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowForm(false);
                    setEditingId(null);
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Categories List */}
      {categories.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-gray-500">No categories yet. Create your first one!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-700">
              <tr>
                <th className="px-4 py-3 text-left w-10">
                  <input
                    type="checkbox"
                    checked={categories.length > 0 && selectedIds.size === categories.length}
                    onChange={toggleSelectAll}
                    className="rounded border-gray-300 text-navy-600 focus:ring-navy-500"
                  />
                </th>
                <th className="px-4 py-3 text-left">Image</th>
                <th className="px-4 py-3 text-left">Name</th>
                <th className="px-4 py-3 text-left">Slug</th>
                <th className="px-4 py-3 text-left">French</th>
                <th className="px-4 py-3 text-left">Arabic</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {categories.map((cat) => (
                <tr key={cat.id} className={`hover:bg-gray-50 ${selectedIds.has(cat.id) ? "bg-navy-50" : ""}`}>
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(cat.id)}
                      onChange={() => toggleSelect(cat.id)}
                      className="rounded border-gray-300 text-navy-600 focus:ring-navy-500"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                      {cat.image_url ? (
                        <img src={cat.image_url} alt={cat.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                          <ImageIcon className="h-4 w-4" />
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {cat.name}
                  </td>
                  <td className="px-4 py-3 text-gray-500">{cat.slug}</td>
                  <td className="px-4 py-3 text-gray-500">
                    {cat.name_fr || "—"}
                  </td>
                  <td className="px-4 py-3 text-gray-500" dir="rtl">
                    {cat.name_ar || "—"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEdit(cat)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteCategory(cat.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Bulk Action Bar */}
      <BulkActionBar
        selectedCount={selectedIds.size}
        totalCount={categories.length}
        onClearSelection={() => setSelectedIds(new Set())}
        onSelectAll={() => setSelectedIds(new Set(categories.map((c) => c.id)))}
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
