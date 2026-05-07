export interface Category {
  id: string;
  name: string;
  name_ar: string;
  name_fr: string;
  slug: string;
  image_url: string | null;
  created_at: string;
}

export interface Product {
  id: string;
  name: string;
  name_ar: string;
  name_fr: string;
  description: string;
  description_ar: string;
  description_fr: string;
  specifications: Record<string, string>;
  category_id: string;
  brand: string;
  price: number | null;
  is_new: boolean;
  is_best_seller: boolean;
  is_featured: boolean;
  is_available: boolean;
  certifications: string[];
  datasheet_url: string | null;
  datasheets: ProductDatasheet[];
  created_at: string;
  category?: Category;
  product_images?: ProductImage[];
}

export interface ProductDatasheet {
  name: string;
  url: string;
  type: string | null;
  size: number | null;
}

export interface ProductImage {
  id: string;
  product_id: string;
  image_url: string;
  is_primary: boolean;
  sort_order: number;
}

export interface QuoteRequest {
  id: string;
  product_id: string | null;
  name: string;
  company: string | null;
  phone: string;
  email: string;
  quantity: number;
  notes: string | null;
  status: "pending" | "contacted" | "completed" | "cancelled";
  created_at: string;
  product?: Product;
}

export interface Store {
  id: string;
  name: string;
  name_ar: string;
  name_fr: string;
  city: string;
  city_ar: string;
  address: string;
  address_ar: string;
  phone: string | null;
  email: string | null;
  image_url: string | null;
  google_maps_url: string | null;
  is_headquarters: boolean;
  sort_order: number;
  created_at: string;
}

export interface Brand {
  id: string;
  name: string;
  name_ar: string;
  name_fr: string;
  logo_url: string | null;
  website_url: string | null;
  description: string | null;
  description_ar: string | null;
  description_fr: string | null;
  sort_order: number;
  created_at: string;
}

export interface Review {
  id: string;
  product_id: string | null;
  name: string;
  company: string | null;
  rating: number;
  comment: string;
  comment_ar: string | null;
  comment_fr: string | null;
  image_url: string | null;
  status: "pending" | "approved" | "rejected";
  created_at: string;
  product?: Product;
}

export interface CompanySettings {
  id: string;
  company_name: string;
  company_name_ar: string;
  company_name_fr: string;
  address: string;
  address_ar: string;
  address_fr: string;
  phone: string;
  phone2: string | null;
  email: string;
  logo_url: string | null;
  header_logo_url: string | null;
  footer_logo_url: string | null;
  admin_logo_url: string | null;
  about: string;
  about_ar: string;
  about_fr: string;
  google_maps_url: string | null;
  facebook_url: string | null;
  instagram_url: string | null;
  linkedin_url: string | null;
  ouadkniss_url: string | null;
  whatsapp_number: string | null;
  notification_email: string | null;
  notification_whatsapp: string | null;
  hero_image_1: string | null;
  hero_image_2: string | null;
  hero_image_3: string | null;
  about_image_main: string | null;
  about_image_small: string | null;
  cta_image: string | null;
}

export type Locale = "en" | "fr" | "ar";
