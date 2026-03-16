# ✅ COMPLETE SETUP GUIDE - BRANDS, STORES, REVIEWS

## Step 1: Run Database SQL

Copy this SQL and run it in **Supabase SQL Editor**:

```sql
-- =============================================
-- ADD MISSING TABLES: BRANDS, STORES, REVIEWS
-- =============================================

-- BRANDS TABLE
CREATE TABLE IF NOT EXISTS brands (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  name_ar TEXT NOT NULL DEFAULT '',
  name_fr TEXT NOT NULL DEFAULT '',
  logo_url TEXT,
  website_url TEXT,
  description TEXT,
  description_ar TEXT,
  description_fr TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- STORES TABLE (Boutiques)
CREATE TABLE IF NOT EXISTS stores (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  name_ar TEXT NOT NULL DEFAULT '',
  name_fr TEXT NOT NULL DEFAULT '',
  city TEXT NOT NULL,
  city_ar TEXT NOT NULL DEFAULT '',
  address TEXT NOT NULL,
  address_ar TEXT NOT NULL DEFAULT '',
  phone TEXT,
  email TEXT,
  image_url TEXT,
  google_maps_url TEXT,
  is_headquarters BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- REVIEWS TABLE (Testimonials)
CREATE TABLE IF NOT EXISTS reviews (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  company TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT NOT NULL,
  comment_ar TEXT,
  comment_fr TEXT,
  image_url TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_brands_name ON brands(name);
CREATE INDEX IF NOT EXISTS idx_stores_city ON stores(city);
CREATE INDEX IF NOT EXISTS idx_stores_sort ON stores(sort_order);
CREATE INDEX IF NOT EXISTS idx_reviews_product ON reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_status ON reviews(status);
CREATE INDEX IF NOT EXISTS idx_reviews_created ON reviews(created_at DESC);

-- ROW LEVEL SECURITY (RLS)
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- PUBLIC READ policies
CREATE POLICY IF NOT EXISTS "Public can read brands" ON brands
  FOR SELECT USING (true);

CREATE POLICY IF NOT EXISTS "Public can read stores" ON stores
  FOR SELECT USING (true);

CREATE POLICY IF NOT EXISTS "Public can read approved reviews" ON reviews
  FOR SELECT USING (status = 'approved');

-- PUBLIC INSERT for reviews (anyone can submit)
CREATE POLICY IF NOT EXISTS "Public can submit reviews" ON reviews
  FOR INSERT WITH CHECK (true);

-- ADMIN (authenticated) full access
CREATE POLICY IF NOT EXISTS "Admin full access brands" ON brands
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY IF NOT EXISTS "Admin full access stores" ON stores
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY IF NOT EXISTS "Admin full access reviews" ON reviews
  FOR ALL USING (auth.role() = 'authenticated');
```

---

## Step 2: Restart Server

After running the SQL:
```bash
npm run dev
```

---

## Step 3: Use Admin Panel

Your admin panel now has:

- **Admin → Brands** - Add/edit brands with logos
- **Admin → Stores** - Add/edit store locations with images
- **Admin → Reviews** - Moderate customer reviews and testimonials

---

## Features

### Brands Management
- ✅ Name in 3 languages (English, French, Arabic)
- ✅ Logo with image upload
- ✅ Website URL
- ✅ Description in 3 languages

### Stores Management
- ✅ Store name in 3 languages
- ✅ City in 2 languages
- ✅ Address in 2 languages
- ✅ Phone & Email
- ✅ Store image with upload
- ✅ Google Maps integration
- ✅ Mark as headquarters
- ✅ Sort order

### Reviews Management
- ✅ Customer name & company
- ✅ 1-5 star rating
- ✅ Comment in 3 languages
- ✅ Customer image upload
- ✅ Link to product reviewed
- ✅ Approval workflow (Pending → Approved/Rejected)
- ✅ Bulk actions (approve, reject, delete)

---

## What's working now:

- Database tables ✅
- Admin pages ✅
- Add/Edit/Delete operations ✅
- Image uploads ✅
- Multi-language support ✅
- Status management ✅

---

## Your Complete Dashboard

```
Admin Menu:
├── Dashboard
├── Products
├── Categories
├── Brands ⭐ NEW
├── Stores ⭐ NEW
├── Reviews ⭐ NEW
├── Quote Requests
└── Settings
```

That's it! Your website now has complete management for all major elements! 🎉
