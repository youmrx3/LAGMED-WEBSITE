"use client";

import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Save, Image as ImageIcon, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import type { CompanySettings } from "@/lib/types";
import { useToastStore } from "@/lib/toast-store";

type SettingsFormValues = Partial<Omit<CompanySettings, "id">>;

function getMissingColumn(errorMessage: string) {
  const match = errorMessage.match(/column\s+"?([a-zA-Z0-9_]+)"?/i);
  return match?.[1] || null;
}

function buildPayload(
  data: SettingsFormValues,
  availableColumns: string[] | null
) {
  const entries = Object.entries(data).filter(([key, value]) => {
    if (value === undefined) return false;
    if (!availableColumns) return true;
    return availableColumns.includes(key);
  });

  return Object.fromEntries(entries) as SettingsFormValues;
}

function ImageField({
  label,
  value,
  onUrlChange,
  fieldName,
}: {
  label: string;
  value: string | null;
  onUrlChange: (url: string) => void;
  fieldName: string;
}) {
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const supabase = createClient();
    const fileExt = file.name.split(".").pop();
    const fileName = `settings/${fieldName}-${Date.now()}.${fileExt}`;
    const { error } = await supabase.storage.from("company").upload(fileName, file);
    if (!error) {
      const { data: { publicUrl } } = supabase.storage.from("company").getPublicUrl(fileName);
      onUrlChange(publicUrl);
    }
    setUploading(false);
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <div className="flex gap-3 items-start">
        <div className="w-32 h-20 rounded-lg overflow-hidden bg-gray-100 border flex-shrink-0">
          {value ? (
            <img src={value} alt={label} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-300">
              <ImageIcon className="h-6 w-6" />
            </div>
          )}
        </div>
        <div className="flex-1 space-y-1.5">
          <div className="relative">
            <Input
              type="file"
              accept="image/*"
              onChange={handleUpload}
              disabled={uploading}
              className="text-xs"
            />
            {uploading && (
              <div className="absolute inset-0 bg-white/60 flex items-center justify-center rounded-lg">
                <div className="h-4 w-4 border-2 border-navy-600 border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>
          <Input
            value={value || ""}
            onChange={(e) => onUrlChange(e.target.value)}
            placeholder="Or paste image URL..."
            className="text-xs"
          />
        </div>
      </div>
    </div>
  );
}

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settingsId, setSettingsId] = useState<string | null>(null);
  const [availableColumns, setAvailableColumns] = useState<string[] | null>(null);
  const [schemaWarning, setSchemaWarning] = useState<string | null>(null);
  const { addToast } = useToastStore();

  const { register, handleSubmit, reset, watch, setValue } = useForm<SettingsFormValues>();

  const loadSettings = useCallback(async () => {
    setLoading(true);
    const supabase = createClient();
    const { data, error } = await supabase
      .from("company_settings")
      .select("*")
      .order("id", { ascending: true })
      .limit(1)
      .maybeSingle();

    if (error) {
      addToast("error", `Failed to load settings: ${error.message}`);
      setLoading(false);
      return;
    }

    if (data) {
      setSettingsId(data.id);
      setAvailableColumns(Object.keys(data));
      reset(data);
    } else {
      setSettingsId(null);
      setAvailableColumns(null);
      reset({});
    }

    setLoading(false);
  }, [addToast, reset]);

  useEffect(() => {
    void loadSettings();
  }, [loadSettings]);

  const onSubmit = async (data: SettingsFormValues) => {
    setSaving(true);
    const supabase = createClient();

    const missingColumns: string[] = [];
    let payload = buildPayload(data, availableColumns);
    let attempts = 0;
    let savedId: string | null = settingsId;
    let writeError: { message: string } | null = null;

    while (attempts < 8) {
      const query = settingsId
        ? supabase
            .from("company_settings")
            .update(payload)
            .eq("id", settingsId)
            .select("id")
            .maybeSingle()
        : supabase
            .from("company_settings")
            .insert(payload)
            .select("id")
            .single();

      const { data: writeData, error } = await query;

      if (!error) {
        if (writeData?.id) {
          savedId = writeData.id;
          setSettingsId(writeData.id);
        }
        writeError = null;
        break;
      }

      writeError = { message: error.message };

      const missingColumn = getMissingColumn(error.message);
      if (!missingColumn || !(missingColumn in payload)) {
        break;
      }

      const nextPayload: SettingsFormValues = { ...payload };
      delete (nextPayload as Record<string, unknown>)[missingColumn];
      payload = nextPayload;
      missingColumns.push(missingColumn);
      attempts += 1;
    }

    if (writeError) {
      addToast("error", `Could not save settings: ${writeError.message}`);
      setSaving(false);
      return;
    }

    if (missingColumns.length > 0) {
      const uniqueColumns = Array.from(new Set(missingColumns));
      const warningMessage = `Database is missing columns (${uniqueColumns.join(", ")}). Run the latest SQL migration files in supabase/.`;
      setSchemaWarning(warningMessage);
      addToast("warning", "Settings saved partially. Database schema needs migration.");
    } else {
      setSchemaWarning(null);
      addToast("success", "Settings saved successfully!");
    }

    if (!savedId) {
      addToast("warning", "Settings were saved, but no settings row ID was returned. Reload and try again.");
    }

    await loadSettings();
    setSaving(false);
  };

  if (loading) {
    return <div className="text-center py-8 text-gray-500">Loading...</div>;
  }

  return (
    <div className="max-w-4xl space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Company Settings</h1>

      {schemaWarning && (
        <div className="rounded-lg border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm text-yellow-800 flex items-start gap-2">
          <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <span>{schemaWarning}</span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Company Info */}
        <Card>
          <CardContent className="space-y-4">
            <h2 className="text-lg font-semibold">Company Information</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Company Name (English)
                </label>
                <Input {...register("company_name")} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Company Name (French)
                </label>
                <Input {...register("company_name_fr")} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Company Name (Arabic)
                </label>
                <Input {...register("company_name_ar")} dir="rtl" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address (English)
                </label>
                <Input {...register("address")} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address (French)
                </label>
                <Input {...register("address_fr")} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address (Arabic)
                </label>
                <Input {...register("address_ar")} dir="rtl" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Details */}
        <Card>
          <CardContent className="space-y-4">
            <h2 className="text-lg font-semibold">Contact Details</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone
                </label>
                <Input {...register("phone")} placeholder="+213..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone 2 (Optional)
                </label>
                <Input {...register("phone2")} placeholder="+213..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <Input {...register("email")} type="email" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  WhatsApp Number
                </label>
                <Input
                  {...register("whatsapp_number")}
                  placeholder="213XXXXXXXX"
                />
              </div>
            </div>

            <hr className="my-4" />
            <h3 className="text-base font-semibold text-gray-800 mt-6 mb-4">Quote Notifications</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notification Email Address
                </label>
                <Input 
                  {...register("notification_email")} 
                  type="email"
                  placeholder="admin@lagmed.dz"
                />
                <p className="text-xs text-gray-500 mt-1">Email where quote requests will be sent</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  WhatsApp Number for Notifications
                </label>
                <Input
                  {...register("notification_whatsapp")}
                  placeholder="213XXXXXXXX"
                />
                <p className="text-xs text-gray-500 mt-1">WhatsApp number to receive quote notifications</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* About */}
        <Card>
          <CardContent className="space-y-4">
            <h2 className="text-lg font-semibold">About</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                About (English)
              </label>
              <Textarea {...register("about")} rows={4} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                About (French)
              </label>
              <Textarea {...register("about_fr")} rows={4} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                About (Arabic)
              </label>
              <Textarea {...register("about_ar")} rows={4} dir="rtl" />
            </div>
          </CardContent>
        </Card>

        {/* Social & Maps */}
        <Card>
          <CardContent className="space-y-4">
            <h2 className="text-lg font-semibold">Social Media & Maps</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Google Maps Embed URL
                </label>
                <Input
                  {...register("google_maps_url")}
                  placeholder="https://www.google.com/maps/embed?..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Facebook URL
                </label>
                <Input
                  {...register("facebook_url")}
                  placeholder="https://facebook.com/..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Instagram URL
                </label>
                <Input
                  {...register("instagram_url")}
                  placeholder="https://instagram.com/..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  LinkedIn URL
                </label>
                <Input
                  {...register("linkedin_url")}
                  placeholder="https://linkedin.com/..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ouadkniss URL
                </label>
                <Input
                  {...register("ouadkniss_url")}
                  placeholder="https://ouadkniss.com/..."
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Website Images */}
        <Card>
          <CardContent className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold">Website Images</h2>
              <p className="text-sm text-gray-500 mt-1">
                Manage the images displayed on the homepage hero, about section, and call-to-action.
              </p>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <ImageIcon className="h-4 w-4" />
                Brand Logos
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <ImageField
                  label="Navbar Logo"
                  value={watch("header_logo_url") || watch("logo_url") || null}
                  onUrlChange={(url) => setValue("header_logo_url", url)}
                  fieldName="logo-header"
                />
                <ImageField
                  label="Footer Logo"
                  value={watch("footer_logo_url") || watch("logo_url") || null}
                  onUrlChange={(url) => setValue("footer_logo_url", url)}
                  fieldName="logo-footer"
                />
                <ImageField
                  label="Admin Logo"
                  value={watch("admin_logo_url") || watch("logo_url") || null}
                  onUrlChange={(url) => setValue("admin_logo_url", url)}
                  fieldName="logo-admin"
                />
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <ImageIcon className="h-4 w-4" />
                Hero Section (Background Carousel)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <ImageField
                  label="Hero Image 1"
                  value={watch("hero_image_1") || null}
                  onUrlChange={(url) => setValue("hero_image_1", url)}
                  fieldName="hero-1"
                />
                <ImageField
                  label="Hero Image 2"
                  value={watch("hero_image_2") || null}
                  onUrlChange={(url) => setValue("hero_image_2", url)}
                  fieldName="hero-2"
                />
                <ImageField
                  label="Hero Image 3"
                  value={watch("hero_image_3") || null}
                  onUrlChange={(url) => setValue("hero_image_3", url)}
                  fieldName="hero-3"
                />
              </div>
            </div>

            <div className="border-t pt-5">
              <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <ImageIcon className="h-4 w-4" />
                About Section
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ImageField
                  label="Main About Image"
                  value={watch("about_image_main") || null}
                  onUrlChange={(url) => setValue("about_image_main", url)}
                  fieldName="about-main"
                />
                <ImageField
                  label="Small Accent Image"
                  value={watch("about_image_small") || null}
                  onUrlChange={(url) => setValue("about_image_small", url)}
                  fieldName="about-small"
                />
              </div>
            </div>

            <div className="border-t pt-5">
              <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <ImageIcon className="h-4 w-4" />
                Call-to-Action Section
              </h3>
              <div className="max-w-md">
                <ImageField
                  label="CTA Background Image"
                  value={watch("cta_image") || null}
                  onUrlChange={(url) => setValue("cta_image", url)}
                  fieldName="cta"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Button type="submit" size="lg" loading={saving} className="gap-2">
          <Save className="h-4 w-4" />
          Save Settings
        </Button>
      </form>
    </div>
  );
}
