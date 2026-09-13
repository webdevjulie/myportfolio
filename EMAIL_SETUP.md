# Email Configuration Guide

Your contact form is now ready with email functionality. Choose one of the following options:

## Option 1: Formspree (Recommended - Easiest Setup)

Formspree is a free service that requires minimal configuration.

### Setup Steps:

1. **Create a Formspree Account**
   - Go to https://formspree.io
   - Sign up (free account)
   - Create a new form

2. **Get Your Formspree ID**
   - After creating a form, you'll get an ID like: `xyzabc123`
   - Copy this ID

3. **Add to Environment Variables**
   - Create a `.env.local` file in your project root (copy from `.env.example`)
   - Add: `VITE_FORMSPREE_ID=your_formspree_id_here`
   - Example: `VITE_FORMSPREE_ID=xyzabc123`

4. **Done!**
   - The contact form will now work automatically
   - Emails will be delivered to the address you specified in Formspree

---

## Option 2: Direct Email via Gmail (Uses SMTP)

Use your Gmail account directly for sending emails.

### Setup Steps:

1. **Enable 2-Factor Authentication**
   - Go to https://myaccount.google.com/security
   - Enable 2-Step Verification

2. **Generate App Password**
   - Go to https://myaccount.google.com/apppasswords
   - Select: Mail → Windows Computer (or your device)
   - Google will generate a 16-character password
   - Copy this password

3. **Create `.env.local` File**
   ```
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_SECURE=false
   SMTP_USER=your_email@gmail.com
   SMTP_PASSWORD=your_16_character_app_password
   SMTP_FROM_EMAIL=your_email@gmail.com
   ADMIN_EMAIL=your_email@gmail.com
   ```

4. **Install Nodemailer (if using SMTP)**
   ```bash
   npm install nodemailer
   ```

5. **Test**
   - Run your dev server and test the contact form

---

## Option 3: SendGrid, Mailgun, or Other Services

Similar to Gmail, but use their SMTP credentials:

- **SendGrid**: SMTP host is `smtp.sendgrid.net` (get API key from dashboard)
- **Mailgun**: SMTP host is `smtp.mailgun.org` (get credentials from dashboard)
- Follow the same environment variable pattern

---

## Troubleshooting

### Email not sending?

1. Check browser console for error messages
2. Verify environment variables are set correctly:
   ```bash
   # View your env vars (be careful not to expose secrets)
   cat .env.local
   ```
3. Ensure your `.env.local` file is in the project root
4. Restart the dev server after updating `.env.local`

### Using Formspree but still getting errors?

- Verify your Formspree ID is correct
- Make sure your Formspree form is active in the dashboard
- Check that you're sending to the correct email in Formspree settings

### Using Gmail but authentication fails?

- Make sure you used an **App Password** (not your regular password)
- Verify 2-Factor Authentication is enabled
- Check that the email address matches exactly

---

## Form Validation

The contact form includes:
- **Name validation**: Minimum 2 characters
- **Email validation**: Must be valid email format
- **Message validation**: Minimum 10 characters
- **Success feedback**: Message appears on successful submission
- **Error feedback**: Shows errors if validation fails

---

## Files Modified

- `src/scripts/sendMessage.js` - Form handling & validation
- `src/pages/api/send-message.ts` - Backend email handler
- `src/components/Contact.astro` - Form UI with success/error messages
- `.env.example` - Configuration template

---

## Next Steps

1. Choose your email service (Formspree is easiest)
2. Create `.env.local` with your credentials
3. Test the contact form
4. Deploy! 🚀
