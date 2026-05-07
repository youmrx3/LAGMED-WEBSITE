import { z } from "zod";

export const quoteRequestSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  company: z.string().optional(),
  phone: z.string().min(8, "Phone number must be at least 8 digits"),
  email: z.string().email("Invalid email address"),
  quantity: z.coerce.number().min(1, "Quantity must be at least 1"),
  notes: z.string().optional(),
  product_id: z.string().optional(),
});

export type QuoteRequestFormData = z.infer<typeof quoteRequestSchema>;

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const productSchema = z.object({
  name: z.string().min(2, "Name is required"),
  name_ar: z.string(),
  name_fr: z.string(),
  description_fr: z.string().min(10, "Description (French) must be at least 10 characters"),
  description: z.string().optional(),
  description_ar: z.string(),
  brand: z.string().min(1, "Brand is required"),
  category_id: z.string().min(1, "Category is required"),
  price: z.coerce.number().optional().nullable(),
  is_new: z.boolean(),
  is_best_seller: z.boolean(),
  is_featured: z.boolean(),
  is_available: z.boolean(),
  certifications: z.array(z.string()),
  specifications: z.record(z.string(), z.string()),
});

export type ProductFormData = z.infer<typeof productSchema>;

export const categorySchema = z.object({
  name: z.string().min(2, "Name is required"),
  name_ar: z.string(),
  name_fr: z.string(),
  slug: z.string().min(2, "Slug is required"),
});

export type CategoryFormData = z.infer<typeof categorySchema>;

export const reviewSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  company: z.string().optional(),
  rating: z.coerce.number().min(1).max(5),
  comment: z.string().min(10, "Review must be at least 10 characters"),
  comment_ar: z.string().optional(),
  comment_fr: z.string().optional(),
});

export type ReviewFormData = z.infer<typeof reviewSchema>;

export const storeSchema = z.object({
  name: z.string().min(1, "Store name is required"),
  name_ar: z.string().optional(),
  name_fr: z.string().optional(),
  city: z.string().min(1, "City is required"),
  city_ar: z.string().optional(),
  address: z.string().min(1, "Address is required"),
  address_ar: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  image_url: z.string().optional().nullable(),
  google_maps_url: z.string().optional().nullable(),
  is_headquarters: z.boolean().default(false),
  sort_order: z.coerce.number().default(0),
});

export type StoreFormData = z.infer<typeof storeSchema>;

export const brandSchema = z.object({
  name: z.string().min(1, "Brand name is required"),
  name_ar: z.string().optional(),
  name_fr: z.string().optional(),
  logo_url: z.string().optional().nullable(),
  website_url: z.string().optional().nullable(),
  description: z.string().optional(),
  description_ar: z.string().optional(),
  description_fr: z.string().optional(),
  sort_order: z.coerce.number().default(0),
});

export type BrandFormData = z.infer<typeof brandSchema>;
