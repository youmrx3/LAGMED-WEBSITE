"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useLocaleStore } from "@/lib/store";
import { useToastStore } from "@/lib/toast-store";
import { createClient } from "@/lib/supabase/client";
import { quoteRequestSchema, type QuoteRequestFormData } from "@/lib/validations";
import type { Product } from "@/lib/types";

export default function QuotePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin h-8 w-8 border-4 border-navy-600 border-t-transparent rounded-full" /></div>}>
      <QuotePageContent />
    </Suspense>
  );
}

function QuotePageContent() {
  const { t, locale } = useLocaleStore();
  const { addToast } = useToastStore();
  const searchParams = useSearchParams();
  const productId = searchParams.get("product");

  const [product, setProduct] = useState<Product | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<QuoteRequestFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(quoteRequestSchema) as any,
    defaultValues: {
      quantity: 1,
      product_id: productId || undefined,
    },
  });

  useEffect(() => {
    async function fetchProduct() {
      if (!productId) return;
      const supabase = createClient();
      const { data } = await supabase
        .from("products")
        .select("*")
        .eq("id", productId)
        .single();
      if (data) setProduct(data);
    }
    fetchProduct();
  }, [productId]);

  const onSubmit = async (data: QuoteRequestFormData) => {
    setSubmitting(true);
    setSubmitError(null);
    try {
      const response = await fetch("/api/quotes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          product_id: productId || undefined,
        }),
      });

      const result = await response.json();
      if (!response.ok || !result?.quoteId) {
        const message = `Failed to save quote: ${result?.error || "Unknown error"}`;
        addToast("error", message);
        setSubmitError(message);
        setSubmitting(false);
        return;
      }

      console.log("Quote saved:", result.quoteId);
      addToast("success", "Quote submitted! We will contact you soon.");

      // Send email notification (non-blocking)
      try {
        const emailResponse = await fetch("/api/notifications/email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ quoteId: result.quoteId }),
        });
        if (!emailResponse.ok) {
          const emailBody = await emailResponse.json().catch(() => ({}));
          console.error("Email notification failed:", emailBody?.error || emailResponse.statusText);
          addToast("warning", "Quote saved, but email notification failed.");
        }
      } catch (emailError) {
        console.error("Email notification failed:", emailError);
        addToast("warning", "Quote saved, but email notification failed.");
      }

      // Send WhatsApp notification (non-blocking)
      try {
        const whatsappResponse = await fetch("/api/notifications/whatsapp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ quoteId: result.quoteId }),
        });
        if (!whatsappResponse.ok) {
          const whatsappBody = await whatsappResponse.json().catch(() => ({}));
          console.error("WhatsApp notification failed:", whatsappBody?.error || whatsappResponse.statusText);
          addToast("warning", "Quote saved, but WhatsApp notification failed.");
        }
      } catch (whatsappError) {
        console.error("WhatsApp notification failed:", whatsappError);
        addToast("warning", "Quote saved, but WhatsApp notification failed.");
      }

      setSubmitted(true);
    } catch (error) {
      console.error("Quote submission error:", error);
      const errorMsg = error instanceof Error ? error.message : "Unknown error";
      const message = `Error: ${errorMsg}`;
      addToast("error", message);
      setSubmitError(message);
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-4 p-8"
        >
          <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto" />
          <h2 className="text-2xl font-bold text-gray-900">
            {t("quote.success_title")}
          </h2>
          <p className="text-gray-600 max-w-md">
            {t("quote.success_message")}
          </p>
        </motion.div>
      </div>
    );
  }

  const productName = product
    ? locale === "ar" && product.name_ar
      ? product.name_ar
      : locale === "fr" && product.name_fr
        ? product.name_fr
        : product.name
    : null;

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto"
        >
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              {t("quote.title")}
            </h1>
            <p className="text-gray-600 mt-2">{t("quote.subtitle")}</p>
            {productName && (
              <p className="text-navy-600 font-medium mt-2">
                {t("quote.for_product")}: {productName}
              </p>
            )}
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6 md:p-8 shadow-sm">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("quote.name")} *
                </label>
                <Input
                  {...register("name")}
                  error={errors.name?.message}
                  placeholder={t("quote.name")}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("quote.company")}
                </label>
                <Input
                  {...register("company")}
                  placeholder={t("quote.company")}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t("quote.phone")} *
                  </label>
                  <Input
                    {...register("phone")}
                    error={errors.phone?.message}
                    placeholder="+213..."
                    type="tel"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t("quote.email")} *
                  </label>
                  <Input
                    {...register("email")}
                    error={errors.email?.message}
                    placeholder="email@example.com"
                    type="email"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("quote.quantity")} *
                </label>
                <Input
                  {...register("quantity")}
                  error={errors.quantity?.message}
                  type="number"
                  min={1}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("quote.notes")}
                </label>
                <Textarea
                  {...register("notes")}
                  placeholder={t("quote.notes")}
                  rows={4}
                />
              </div>

              <Button
                type="submit"
                size="lg"
                className="w-full"
                loading={submitting}
              >
                {t("quote.submit")}
              </Button>
              {submitError && (
                <p className="text-sm text-red-600 text-center" role="alert">
                  {submitError}
                </p>
              )}
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
