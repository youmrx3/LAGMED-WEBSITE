# LAGMED - Medical Equipment Website

A modern, production-ready website for a medical equipment company located in Bordj Bou Arreridj (BBA), Algeria. Built with Next.js, Supabase, TypeScript, and Tailwind CSS.

## Features

- **Public Website**: Browse medical equipment, view product details, request quotes
- **Admin Panel**: Full management of products, categories, quotes, and company settings
- **Multilingual**: English, French, and Arabic support with RTL
- **Responsive**: Works on all devices
- **WhatsApp Integration**: Quick contact button
- **Google Maps**: Location display

## Tech Stack

- **Frontend**: Next.js 16, TypeScript, Tailwind CSS, Framer Motion
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **Forms**: React Hook Form + Zod validation
- **State**: Zustand

---

## Setup Guide

### 1. Prerequisites

- Node.js 18+
- A Supabase account (free tier works)
- A Vercel account (for deployment)

### 2. Supabase Setup

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run the contents of `supabase/schema.sql`
3. Run incremental migrations (especially if your DB was created before recent updates):
   - `supabase/schema-update.sql`
   - `supabase/schema-update-v3.sql`
   - `supabase/schema-fix-quote-rls.sql`
4. Set up **Storage Buckets**:
   - Go to Storage > Create buckets: `products`, `datasheets`, `company`
   - Set all buckets to **public**
   - Run the storage policy SQL (commented section at bottom of schema.sql)
5. Set up **Authentication**:
   - Go to Authentication > Users
   - Create an admin user with email/password
6. Copy your project URL and anon key from Settings > API

### 3. Environment Variables

Copy `.env.local.example` to `.env.local` and fill in:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_WHATSAPP_NUMBER=213XXXXXXXXX
```

### 4. Install & Run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 5. Admin Access

Navigate to `/admin/login` and sign in with the admin user you created in Supabase.

---

## Deployment (Vercel)

1. Push code to GitHub
2. Import repo in [vercel.com](https://vercel.com)
3. Add environment variables in Vercel dashboard
4. Deploy!

### Environment Variables for Vercel

Set all variables from `.env.local.example` in Vercel's project settings.

### Email and WhatsApp Notifications Setup

After deployment, configure notifications in two places:

1. Admin panel values:
   - Go to `/admin/settings`
   - Fill `Notification Email Address`
   - Fill `WhatsApp Number for Notifications` in international format (example: `213XXXXXXXXX` or `+213XXXXXXXXX`)

2. Vercel environment variables:

Required core variables:

```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
```

Email via Resend:

```env
EMAIL_PROVIDER=resend
RESEND_API_KEY=...
RESEND_FROM_EMAIL=notifications@your-domain.com
```

Email via SMTP:

```env
EMAIL_PROVIDER=smtp
SMTP_HOST=smtp.your-provider.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=...
SMTP_PASS=...
SMTP_FROM=notifications@your-domain.com
```

WhatsApp via Twilio:

```env
WHATSAPP_PROVIDER=twilio
TWILIO_ACCOUNT_SID=...
TWILIO_AUTH_TOKEN=...
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886
```

WhatsApp via Meta WhatsApp Business API:

```env
WHATSAPP_PROVIDER=whatsapp-business
WHATSAPP_BUSINESS_ACCESS_TOKEN=...
WHATSAPP_BUSINESS_PHONE_NUMBER_ID=...
```

Notes:
- Quote saving works independently of notification delivery.
- If provider variables are missing, quote still saves and the UI shows a warning toast.

---

## Project Structure

```
src/
├── app/
│   ├── admin/              # Admin panel pages
│   │   ├── categories/     # Categories CRUD
│   │   ├── login/          # Admin login
│   │   ├── products/       # Products CRUD
│   │   │   └── [id]/       # Product form (create/edit)
│   │   ├── quotes/         # Quote requests management
│   │   ├── settings/       # Company settings
│   │   ├── layout.tsx      # Admin sidebar layout
│   │   └── page.tsx        # Dashboard
│   ├── quote/              # Quote request form
│   ├── shop/               # Product catalog
│   │   └── [id]/           # Product detail page
│   ├── client-body.tsx     # Client body wrapper
│   ├── globals.css         # Global styles
│   ├── layout.tsx          # Root layout
│   └── page.tsx            # Homepage
├── components/
│   ├── home/               # Homepage sections
│   ├── layout/             # Header, Footer, etc.
│   ├── products/           # Product card
│   └── ui/                 # Reusable UI components
├── lib/
│   ├── supabase/           # Supabase client setup
│   ├── store.ts            # Zustand locale store
│   ├── types.ts            # TypeScript types
│   ├── utils.ts            # Utility functions
│   └── validations.ts      # Zod schemas
├── locales/                # i18n translation files
│   ├── ar.json
│   ├── en.json
│   └── fr.json
└── middleware.ts            # Auth middleware
supabase/
└── schema.sql              # Database schema & RLS policies
```

## Database Tables

| Table | Description |
|-------|-------------|
| `categories` | Product categories |
| `products` | All medical equipment |
| `product_images` | Product image gallery |
| `quote_requests` | Customer quote submissions |
| `company_settings` | Company configuration |

## Security

- **Row Level Security (RLS)** enabled on all tables
- Public users can only read products/categories and submit quotes
- Only authenticated admins can modify data
- Admin routes protected via middleware
- Form validation on client and server

## License

Private - LAGMED © 2025
