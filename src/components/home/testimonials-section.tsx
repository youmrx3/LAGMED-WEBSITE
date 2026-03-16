"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Quote, Send, CheckCircle, MessageSquarePlus } from "lucide-react";
import { useLocaleStore } from "@/lib/store";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createClient } from "@/lib/supabase/client";
import { reviewSchema, type ReviewFormData } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { Review } from "@/lib/types";

export function TestimonialsSection() {
  const { t, locale } = useLocaleStore();
  const [active, setActive] = useState(0);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [hoveredStar, setHoveredStar] = useState(0);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ReviewFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(reviewSchema) as any,
    defaultValues: { name: "", company: "", rating: 5, comment: "", comment_ar: "", comment_fr: "" },
  });

  const ratingValue = watch("rating");

  useEffect(() => {
    async function fetchReviews() {
      const supabase = createClient();
      const { data } = await supabase
        .from("reviews")
        .select("*")
        .eq("status", "approved")
        .order("created_at", { ascending: false });
      if (data && data.length > 0) setReviews(data);
    }
    fetchReviews();
  }, []);

  // Auto-rotate reviews every 5 seconds
  useEffect(() => {
    if (reviews.length <= 1) return;
    
    const interval = setInterval(() => {
      setActive((prev) => (prev + 1) % reviews.length);
    }, 5000);
    
    return () => clearInterval(interval);
  }, [reviews.length]);

  const onSubmitReview = async (data: ReviewFormData) => {
    setSubmitting(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.from("reviews").insert({
        name: data.name,
        company: data.company || null,
        rating: data.rating,
        comment: data.comment,
        comment_ar: data.comment_ar || null,
        comment_fr: data.comment_fr || null,
        status: "pending",
      });
      
      if (error) throw error;
      
      setSubmitted(true);
      reset();
      setTimeout(() => {
        setSubmitted(false);
        setShowForm(false);
      }, 4000);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to submit review";
      console.error("Review submission error:", message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="py-20 bg-gradient-to-b from-navy-50 to-white">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <p className="text-navy-600 font-semibold text-sm uppercase tracking-wider mb-2">
            {t("testimonials.subtitle")}
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
            {t("testimonials.title")}
          </h2>
        </motion.div>

        {reviews.length > 0 ? (
          <div className="max-w-4xl mx-auto">
            {/* Main testimonial card */}
            <motion.div
              key={active}
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="bg-white rounded-2xl p-8 md:p-12 shadow-lg border border-gray-100 relative"
            >
              <Quote className="absolute top-6 right-6 h-12 w-12 text-navy-100" />

              <div className="flex gap-1 mb-6">
                {Array.from({ length: reviews[active].rating }).map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>

              <p className="text-gray-700 text-lg md:text-xl leading-relaxed mb-8 italic">
                &ldquo;{reviews[active].comment}&rdquo;
              </p>

              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-navy-500 to-navy-700 flex items-center justify-center text-white font-bold text-lg shadow-md">
                  {reviews[active].name
                    .split(" ")
                    .map((w) => w[0])
                    .join("")
                    .substring(0, 2)
                    .toUpperCase()}
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">{reviews[active].name}</h4>
                  <p className="text-sm text-gray-500">
                    {reviews[active].company}
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Navigation dots + mini cards with scroll animation */}
            {reviews.length > 1 && (
              <div className="mt-8 overflow-hidden">
                <motion.div
                  className="flex justify-center gap-4 flex-wrap"
                  initial={{ x: 0 }}
                  animate={{ x: 0 }}
                >
                  {reviews.map((review, i) => (
                    <motion.button
                      key={review.id}
                      onClick={() => setActive(i)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`flex items-center gap-3 px-5 py-3 rounded-xl transition-all duration-300 ${
                        i === active
                          ? "bg-navy-600 text-white shadow-lg scale-105"
                          : "bg-white text-gray-600 border border-gray-200 hover:border-navy-300"
                      }`}
                    >
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                          i === active ? "bg-white/20 text-white" : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {review.name
                          .split(" ")
                          .map((w) => w[0])
                          .join("")
                          .substring(0, 2)
                          .toUpperCase()}
                      </div>
                      <span className="hidden sm:inline text-sm font-medium">{review.name}</span>
                    </motion.button>
                  ))}
                </motion.div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-400">
            <MessageSquarePlus className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>{t("testimonials.no_reviews")}</p>
          </div>
        )}

        {/* Write a Review Button / Form */}
        <div className="max-w-2xl mx-auto mt-12">
          <AnimatePresence mode="wait">
            {!showForm && !submitted ? (
              <motion.div
                key="button"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center"
              >
                <Button
                  onClick={() => setShowForm(true)}
                  variant="outline"
                  size="lg"
                  className="gap-2 border-navy-200 text-navy-600 hover:bg-navy-50"
                >
                  <MessageSquarePlus className="h-5 w-5" />
                  {t("testimonials.write_review")}
                </Button>
              </motion.div>
            ) : submitted ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="bg-green-50 border border-green-200 rounded-2xl p-8 text-center"
              >
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
                <p className="text-green-700 font-medium">{t("testimonials.review_submitted")}</p>
              </motion.div>
            ) : (
              <motion.div
                key="form"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-white rounded-2xl p-6 md:p-8 shadow-lg border border-gray-100"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-gray-900">
                    {t("testimonials.write_review")}
                  </h3>
                  <button
                    onClick={() => setShowForm(false)}
                    className="text-gray-400 hover:text-gray-600 text-xl leading-none"
                  >
                    &times;
                  </button>
                </div>

                <form onSubmit={handleSubmit(onSubmitReview)} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t("testimonials.your_name")} *
                      </label>
                      <Input
                        {...register("name")}
                        error={errors.name?.message}
                        placeholder="Dr. Ahmed..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t("testimonials.your_company")}
                      </label>
                      <Input {...register("company")} placeholder="CHU, Clinique..." />
                    </div>
                  </div>

                  {/* Star Rating */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t("testimonials.rating")} *
                    </label>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onMouseEnter={() => setHoveredStar(star)}
                          onMouseLeave={() => setHoveredStar(0)}
                          onClick={() => setValue("rating", star)}
                          className="p-0.5 transition-transform hover:scale-110"
                        >
                          <Star
                            className={`h-7 w-7 transition-colors ${
                              star <= (hoveredStar || ratingValue)
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-gray-300"
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t("testimonials.your_review")} *
                    </label>
                    <Textarea
                      {...register("comment")}
                      rows={4}
                      placeholder="Share your experience with LAGMED..."
                    />
                    {errors.comment?.message && (
                      <p className="text-sm text-red-500 mt-1">{errors.comment.message}</p>
                    )}
                  </div>

                  <Button type="submit" loading={submitting} className="gap-2 w-full sm:w-auto">
                    <Send className="h-4 w-4" />
                    {t("testimonials.submit_review")}
                  </Button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
