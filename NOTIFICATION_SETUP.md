# LAGMED Quote Notification System - Setup Guide

## Overview
Your application now includes a complete quote notification system that:
1. ✅ Stores notification email and WhatsApp settings in the admin panel
2. ✅ Sends email notifications to the configured email when a quote is created
3. ✅ Sends WhatsApp notifications to the configured number
4. ✅ Displays all quotes in the admin panel

## Database Changes
Added two new fields to `company_settings` table:
- `notification_email` - Email address to receive quote notifications
- `notification_whatsapp` - WhatsApp number to receive notifications

## Admin Panel
1. Go to **Admin Settings**
2. Scroll down to **"Quote Notifications"** section
3. Enter:
   - **Notification Email Address**: Where you want to receive notification emails (e.g., admin@lagmed.dz)
   - **WhatsApp Number for Notifications**: WhatsApp number to receive notifications (e.g., 213XXXXXXXX)
4. Click **Save Settings**

## Configuration

### Option 1: Email via Resend (Recommended for Easy Setup)

**1. Create Resend Account:**
- Go to https://resend.com
- Sign up and get your API key

**2. Add to `.env.local`:**
```env
EMAIL_PROVIDER=resend
RESEND_API_KEY=your_resend_api_key_here
RESEND_FROM_EMAIL=noreply@lagmed.dz  # Or your Resend verified domain
```

**3. That's it!** Emails will be sent through Resend.

---

### Option 2: Email via SMTP (Gmail, Outlook, etc.)

**1. For Gmail:**
- Enable 2-factor authentication
- Generate App Password: https://myaccount.google.com/apppasswords
- Use settings below

**2. For Other SMTP Services:**
- Get your SMTP server details from your email provider

**3. Add to `.env.local`:**
```env
EMAIL_PROVIDER=smtp
SMTP_HOST=smtp.gmail.com          # Gmail: smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password       # Gmail app password (not your regular password)
SMTP_FROM=noreply@lagmed.dz       # The email address to send from
```

**4. Install nodemailer:**
```bash
npm install nodemailer
npm install --save-dev @types/nodemailer
```

---

### Option 3: WhatsApp via Twilio (Recommended)

**1. Create Twilio Account:**
- Go to https://www.twilio.com
- Sign up and verify your account
- Buy a WhatsApp number or use a trial number

**2. Add to `.env.local`:**
```env
WHATSAPP_PROVIDER=twilio
TWILIO_ACCOUNT_SID=your_account_sid_here
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_WHATSAPP_FROM=whatsapp:+14155552671  # Your Twilio WhatsApp number
```

---

### Option 4: WhatsApp via WhatsApp Business API

**1. Setup WhatsApp Business Account:**
- Apply for WhatsApp Business API
- Get your phone number verified

**2. Add to `.env.local`:**
```env
WHATSAPP_PROVIDER=whatsapp-business
WHATSAPP_BUSINESS_ACCESS_TOKEN=your_access_token_here
WHATSAPP_BUSINESS_PHONE_NUMBER_ID=your_phone_number_id_here
```

---

## What Happens When a Customer Creates a Quote?

1. **Customer submits quote form** on `/quote` page
2. **Quote is saved** to database as "pending"
3. **Admin notification email is sent** to configured email with:
   - Customer name, company, phone, email
   - Product requested
   - Quantity
   - Any notes
   - Submission timestamp

4. **WhatsApp notification is sent** to configured number with:
   - Same information formatted for quick reading
   - Status indicator

## Admin Panel Management

Admins can view quotes in **Admin → Quotes** panel:
- View all quote requests
- Filter by status (pending, contacted, completed, cancelled)
- Update quote status
- Delete quotes
- Bulk actions (delete multiple, mark as contacted)

## Testing

### Test Email Notification:
```bash
curl -X POST http://localhost:3000/api/notifications/email \
  -H "Content-Type: application/json" \
  -d '{"quoteId":"test-quote-id"}'
```

### Test WhatsApp Notification:
```bash
curl -X POST http://localhost:3000/api/notifications/whatsapp \
  -H "Content-Type: application/json" \
  -d '{"quoteId":"test-quote-id"}'
```

## Environment Variables Summary

Copy this to `.env.local` and fill in your values:

```env
# Email Configuration (choose one)
EMAIL_PROVIDER=resend  # or "smtp"

# Resend (if using EMAIL_PROVIDER=resend)
RESEND_API_KEY=
RESEND_FROM_EMAIL=

# SMTP (if using EMAIL_PROVIDER=smtp)
SMTP_HOST=
SMTP_PORT=
SMTP_SECURE=false
SMTP_USER=
SMTP_PASS=
SMTP_FROM=

# WhatsApp Configuration (choose one)
WHATSAPP_PROVIDER=twilio  # or "whatsapp-business"

# Twilio (if using WHATSAPP_PROVIDER=twilio)
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_WHATSAPP_FROM=

# WhatsApp Business (if using WHATSAPP_PROVIDER=whatsapp-business)
WHATSAPP_BUSINESS_ACCESS_TOKEN=
WHATSAPP_BUSINESS_PHONE_NUMBER_ID=
```

## Troubleshooting

### Email Not Sending?
1. Check `.env.local` has correct credentials
2. Check spam folder
3. Verify the "From" email is correct
4. Check browser console for error messages

### WhatsApp Not Sending?
1. Verify phone number format (should be like 213XXXXXXXX)
2. Check Twilio/WhatsApp Business account has credits
3. Verify account is not in trial mode with restrictions
4. Check phone number is in WhatsApp contacts first

### Notifications Not Triggering?
1. Check admin settings have notification email/WhatsApp configured
2. Check browser DevTools console for network errors
3. Verify database has the settings saved correctly

## Files Changed
- `supabase/schema.sql` - Added notification fields
- `src/lib/types.ts` - Updated CompanySettings interface
- `src/app/admin/settings/page.tsx` - Added UI for notification settings
- `src/app/quote/page.tsx` - Calls notification APIs on submission
- **NEW:** `src/app/api/notifications/email/route.ts` - Email notification handler
- **NEW:** `src/app/api/notifications/whatsapp/route.ts` - WhatsApp notification handler

## Next Steps

1. **Update your database** with schema changes (run the migration)
2. **Configure environment variables** in `.env.local`
3. **Set notification addresses** in Admin → Settings
4. **Test by creating a quote** at `/quote`
5. **Check admin panel** at `/admin/quotes` to verify quotes are being saved

Enjoy your new notification system! 🎉
