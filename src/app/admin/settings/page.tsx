"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Save, Image as ImageIcon, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import type { CompanySettings } from "@/lib/types";
import { useToastStore } from "@/lib/toast-store";

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
  const { addToast } = useToastStore();

  const { register, handleSubmit, reset, watch, setValue } = useForm<Partial<CompanySettings>>();

  useEffect(() => {
    async function fetchSettings() {
      const supabase = createClient();
      const { data } = await supabase
        .from("company_settings")
        .select("*")
        .limit(1)
        .single();

      if (data) {
        setSettingsId(data.id);
        reset(data);
      }
      setLoading(false);
    }
    fetchSettings();
  }, [reset]);

  const onSubmit = async (data: Partial<CompanySettings>) => {
    setSaving(true);
    const supabase = createClient();

    if (settingsId) {
      await supabase.from("company_settings").update(data).eq("id", settingsId);
    } else {
      const { data: newData } = await supabase
        .from("company_settings")
        .insert(data)
        .select()
        .single();
      if (newData) setSettingsId(newData.id);
    }

    addToast("success", "Settings saved successfully!");
    setSaving(false);
  };

  if (loading) {
    return <div className="text-center py-8 text-gray-500">Loading...</div>;
  }

  return (
    <div className="max-w-4xl space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Company Settings</h1>

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
                  description="Email where quote requests will be sent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  WhatsApp Number for Notifications
                </label>
                <Input
                  {...register("notification_whatsapp")}
                  placeholder="213XXXXXXXX"
                  description="WhatsApp number to receive quote notifications"
                />
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
