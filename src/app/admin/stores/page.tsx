"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  X,
  MapPin,
  Phone,
  Building2,
  Star,
  GripVertical,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BulkActionBar } from "@/components/ui/bulk-action-bar";
import { createClient } from "@/lib/supabase/client";
import type { Store } from "@/lib/types";
import { useToastStore } from "@/lib/toast-store";

type StoreForm = {
  name: string;
  name_ar: string;
  name_fr: string;
  city: string;
  city_ar: string;
  address: string;
  address_ar: string;
  phone: string;
  image_url: string;
  google_maps_url: string;
  is_headquarters: boolean;
  sort_order: number;
};

export default function AdminStoresPage() {
  const [stores, setStores] = useState<Store[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const { addToast } = useToastStore();

  const { register, handleSubmit, reset, setValue, watch } = useForm<StoreForm>({
    defaultValues: {
      sort_order: 0,
      is_headquarters: false,
    },
  });

  const watchImageUrl = watch("image_url");

  const fetchStores = async () => {
    setLoading(true);
    const supabase = createClient();
    let query = supabase
      .from("stores")
      .select("*")
      .order("sort_order", { ascending: true });

    if (search) {
      query = query.or(
        `name.ilike.%${search}%,city.ilike.%${search}%,name_fr.ilike.%${search}%`
      );
    }

    const { data } = await query;
    if (data) setStores(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchStores();
  }, [search]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const supabase = createClient();
    const fileExt = file.name.split(".").pop();
    const fileName = `stores/${Date.now()}.${fileExt}`;

    const { error } = await supabase.storage
      .from("company")
      .upload(fileName, file);

    if (!error) {
      const {
        data: { publicUrl },
      } = supabase.storage.from("company").getPublicUrl(fileName);
      setValue("image_url", publicUrl);
      setImagePreview(publicUrl);
    }
    setUploading(false);
  };

  const openNew = () => {
    setEditingId(null);
    reset({
      name: "",
      name_ar: "",
      name_fr: "",
      city: "",
      city_ar: "",
      address: "",
      address_ar: "",
      phone: "",
      image_url: "",
      google_maps_url: "",
      is_headquarters: false,
      sort_order: stores.length,
    });
    setImagePreview(null);
    setIsEditing(true);
  };

  const openEdit = (store: Store) => {
    setEditingId(store.id);
    reset({
      name: store.name,
      name_ar: store.name_ar,
      name_fr: store.name_fr,
      city: store.city,
      city_ar: store.city_ar,
      address: store.address,
      address_ar: store.address_ar,
      phone: store.phone || "",
      image_url: store.image_url || "",
      google_maps_url: store.google_maps_url || "",
      is_headquarters: store.is_headquarters,
      sort_order: store.sort_order,
    });
    setImagePreview(store.image_url || null);
    setIsEditing(true);
  };

  const onSubmit = async (data: StoreForm) => {
    setSaving(true);
    const supabase = createClient();

    const payload = {
      ...data,
      phone: data.phone || null,
      image_url: data.image_url || null,
      google_maps_url: data.google_maps_url || null,
    };

    if (editingId) {
      await supabase.from("stores").update(payload).eq("id", editingId);
      addToast("success", "Store updated successfully!");
    } else {
      await supabase.from("stores").insert(payload);
      addToast("success", "Store created successfully!");
    }

    setSaving(false);
    setIsEditing(false);
    fetchStores();
  };

  const deleteStore = async (id: string) => {
    if (!confirm("Are you sure you want to delete this store?")) return;
    const supabase = createClient();
    const { error } = await supabase.from("stores").delete().eq("id", id);
    if (error) {
      addToast("error", "Failed to delete store.");
    } else {
      addToast("success", "Store deleted successfully!");
    }
    fetchStores();
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
    if (!confirm(`Delete ${selectedIds.size} selected store(s)?`)) return;
    const supabase = createClient();
    const { error } = await supabase
      .from("stores")
      .delete()
      .in("id", Array.from(selectedIds));
    if (error) {
      addToast("error", "Failed to delete some stores.");
    } else {
      addToast("success", `${selectedIds.size} store(s) deleted!`);
    }
    setSelectedIds(new Set());
    fetchStores();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Stores / Boutiques</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage your store locations displayed on the website
          </p>
        </div>
        <Button className="gap-2" onClick={openNew}>
          <Plus className="h-4 w-4" />
          Add Store
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search stores..."
          className="pl-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Edit/Add Modal */}
      {isEditing && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-lg font-bold text-gray-900">
                {editingId ? "Edit Store" : "Add New Store"}
              </h2>
              <button
                onClick={() => setIsEditing(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
              {/* Store Names */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Store Name</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">English</label>
                    <Input {...register("name")} placeholder="Store name" required />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">French</label>
                    <Input {...register("name_fr")} placeholder="Nom du magasin" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Arabic</label>
                    <Input {...register("name_ar")} placeholder="اسم المتجر" dir="rtl" />
                  </div>
                </div>
              </div>

              {/* City */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3">City</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">City (EN/FR)</label>
                    <Input {...register("city")} placeholder="City name" required />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">City (Arabic)</label>
                    <Input {...register("city_ar")} placeholder="اسم المدينة" dir="rtl" />
                  </div>
                </div>
              </div>

              {/* Address */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Address</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Address (EN/FR)</label>
                    <Input {...register("address")} placeholder="Full address" required />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Address (Arabic)</label>
                    <Input {...register("address_ar")} placeholder="العنوان الكامل" dir="rtl" />
                  </div>
                </div>
              </div>

              {/* Contact & Maps */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Phone</label>
                  <Input {...register("phone")} placeholder="+213..." />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Google Maps URL</label>
                  <Input
                    {...register("google_maps_url")}
                    placeholder="https://maps.google.com/..."
                  />
                </div>
              </div>

              {/* Image */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Store Image</h3>
                <div className="flex items-start gap-4">
                  <div className="w-32 h-24 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 border">
                    {imagePreview || watchImageUrl ? (
                      <img
                        src={imagePreview || watchImageUrl}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <Building2 className="h-8 w-8" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 space-y-2">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={uploading}
                    />
                    <p className="text-xs text-gray-400">Or paste an image URL:</p>
                    <Input
                      {...register("image_url")}
                      placeholder="https://..."
                      className="text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Options */}
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    {...register("is_headquarters")}
                    className="rounded border-gray-300 text-navy-600 focus:ring-navy-500"
                  />
                  <span className="text-sm text-gray-700">Headquarters (Main Store)</span>
                </label>
                <div className="flex items-center gap-2">
                  <label className="text-sm text-gray-700">Sort Order</label>
                  <Input
                    {...register("sort_order", { valueAsNumber: true })}
                    type="number"
                    className="w-20"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditing(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" loading={saving}>
                  {editingId ? "Update Store" : "Create Store"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Stores List */}
      {loading ? (
        <div className="text-center py-8 text-gray-500">Loading...</div>
      ) : stores.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Building2 className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 mb-2">No stores yet</p>
            <p className="text-sm text-gray-400">
              Add your first store location to display on the website.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {stores.map((store) => (
            <Card key={store.id} className={`hover:shadow-md transition-shadow ${selectedIds.has(store.id) ? "ring-2 ring-navy-500 bg-navy-50" : ""}`}>
              <CardContent className="flex items-center gap-4 p-4">
                {/* Checkbox */}
                <input
                  type="checkbox"
                  checked={selectedIds.has(store.id)}
                  onChange={() => toggleSelect(store.id)}
                  className="rounded border-gray-300 text-navy-600 focus:ring-navy-500 flex-shrink-0"
                />

                {/* Drag handle placeholder */}
                <div className="text-gray-300">
                  <GripVertical className="h-5 w-5" />
                </div>

                {/* Image */}
                <div className="w-20 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                  {store.image_url ? (
                    <img
                      src={store.image_url}
                      alt={store.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Building2 className="h-6 w-6 text-gray-300" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-gray-900 truncate">
                      {store.name}
                    </h3>
                    {store.is_headquarters && (
                      <Badge variant="info" className="flex-shrink-0">
                        <Star className="h-3 w-3 mr-1" />
                        HQ
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" />
                      {store.city}
                    </span>
                    {store.phone && (
                      <span className="flex items-center gap-1">
                        <Phone className="h-3.5 w-3.5" />
                        {store.phone}
                      </span>
                    )}
                  </div>
                  {store.address && (
                    <p className="text-xs text-gray-400 mt-0.5 truncate">
                      {store.address}
                    </p>
                  )}
                </div>

                {/* Sort order */}
                <div className="text-xs text-gray-400 px-2">#{store.sort_order}</div>

                {/* Actions */}
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => openEdit(store)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteStore(store.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
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
        totalCount={stores.length}
        onClearSelection={() => setSelectedIds(new Set())}
        onSelectAll={() => setSelectedIds(new Set(stores.map((s) => s.id)))}
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
