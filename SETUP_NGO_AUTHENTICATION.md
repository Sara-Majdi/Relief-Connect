# NGO Authentication System Setup Guide

## Overview

This guide will help you set up the complete NGO authentication system with the Set Password Link Flow for ReliefConnect.

## 🔄 Complete Authentication Flow

### 1. NGO Registration
- NGO fills out registration form and uploads documents
- Application is stored in database with status 'pending'

### 2. Admin Review
- Admin reviews application in dashboard
- Admin can approve or reject with notes

### 3. Approval Process
- **If Approved**: System sends email with secure password setup link
- **If Rejected**: System sends rejection email with feedback

### 4. Password Setup
- NGO clicks link in email
- NGO sets secure password
- Account becomes active

### 5. Login Access
- NGO can now log in using email and password
- Access to NGO dashboard and features

## 🗄️ Database Setup

### Step 1: Run Database Migrations

Execute these SQL files in your Supabase SQL Editor in order:

1. **First**: `supabase/migrations/001_create_ngo_registrations_table.sql`
2. **Second**: `supabase/migrations/002_create_ngo_users_and_tokens.sql`

### Step 2: Verify Tables Created

You should have these tables:
- `ngo_registrations` - Stores NGO application data
- `ngo_users` - Stores NGO user accounts
- `password_setup_tokens` - Stores secure password setup tokens

## 📧 Email Configuration

### Step 1: Install Dependencies

```bash
npm install nodemailer bcryptjs
```

### Step 2: Set Environment Variables

Add these to your `.env.local` file:

```env
# Email Configuration (Gmail example)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Supabase (existing)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Step 3: Gmail App Password Setup

If using Gmail:

1. Enable 2-Factor Authentication on your Google account
2. Go to Google Account settings → Security → App passwords
3. Generate an app password for "Mail"
4. Use this password as `EMAIL_PASS`

### Alternative Email Services

You can modify `lib/email.js` to use other services:

- **SendGrid**: Replace transporter configuration
- **Mailgun**: Replace transporter configuration  
- **AWS SES**: Replace transporter configuration

## 🔐 Security Features

### Token Security
- 64-character random tokens
- SHA-256 hashed storage
- 7-day expiration
- One-time use only

### Password Security
- bcrypt hashing with salt rounds
- Strong password requirements
- Secure session management

### Email Security
- HTTPS-only links in production
- Token validation before password setup
- Account activation required

## 🧪 Testing the Complete Flow

### Test 1: NGO Registration

1. Visit `http://localhost:3000/ngo/register`
2. Fill out the registration form
3. Upload test documents (PDF files)
4. Submit the form
5. ✅ Check: Record appears in `ngo_registrations` table

### Test 2: Admin Approval

1. Visit `http://localhost:3000/admin/dashboard`
2. Go to "NGO Applications" tab
3. Find your test registration
4. Click "Review"
5. Add notes and click "Approve"
6. ✅ Check: Email sent to NGO email address
7. ✅ Check: `ngo_users` record created (inactive)
8. ✅ Check: `password_setup_tokens` record created

### Test 3: Password Setup

1. Check the email sent to the NGO
2. Click the "Set Your Password" link
3. Fill out the password form
4. Submit the form
5. ✅ Check: Account becomes active
6. ✅ Check: Token marked as used
7. ✅ Check: Redirect to NGO dashboard

### Test 4: NGO Login

1. Visit `http://localhost:3000/auth/ngo`
2. Enter the NGO email and password
3. Click "Sign In"
4. ✅ Check: Successful login and redirect to dashboard

## 🔧 API Endpoints

### NGO Registration
- `GET /api/ngo/registrations` - List registrations (admin)
- `POST /api/ngo/registrations` - Create registration

### Admin Actions
- `PUT /api/ngo/registrations/[id]/approve` - Approve application
- `PUT /api/ngo/registrations/[id]/reject` - Reject application

### Authentication
- `GET /api/auth/validate-setup-token` - Validate setup token
- `POST /api/auth/setup-password` - Set password via token
- `POST /api/auth/ngo-login` - NGO login
- `POST /api/auth/ngo-logout` - NGO logout

## 📁 File Structure

```
app/
├── ngo/register/page.jsx                    # NGO registration form
├── auth/
│   ├── ngo/page.jsx                        # NGO login page
│   └── setup-password/page.jsx             # Password setup page
├── admin/dashboard/page.jsx                # Admin approval dashboard
└── api/
    ├── ngo/registrations/
    │   ├── route.js                        # Registration CRUD
    │   └── [id]/
    │       ├── approve/route.js            # Approve application
    │       └── reject/route.js             # Reject application
    └── auth/
        ├── validate-setup-token/route.js   # Token validation
        ├── setup-password/route.js         # Password setup
        ├── ngo-login/route.js              # NGO login
        └── ngo-logout/route.js             # NGO logout

lib/
├── email.js                                # Email service
└── auth-tokens.js                          # Token & password utilities

supabase/migrations/
├── 001_create_ngo_registrations_table.sql  # Registration schema
└── 002_create_ngo_users_and_tokens.sql     # User & token schema
```

## 🚨 Troubleshooting

### Common Issues

#### 1. Email Not Sending
- Check `EMAIL_USER` and `EMAIL_PASS` environment variables
- Verify Gmail app password is correct
- Check server logs for email errors

#### 2. Token Validation Fails
- Ensure database migrations ran successfully
- Check token hasn't expired (7 days)
- Verify token hasn't been used already

#### 3. Password Setup Fails
- Check password meets all requirements
- Verify token is still valid
- Check database connection

#### 4. Login Fails
- Ensure account is active (`is_active = true`)
- Verify registration is approved
- Check password is set correctly

### Debug Steps

1. **Check Database Tables**:
   ```sql
   SELECT * FROM ngo_registrations ORDER BY created_at DESC;
   SELECT * FROM ngo_users ORDER BY created_at DESC;
   SELECT * FROM password_setup_tokens ORDER BY created_at DESC;
   ```

2. **Check Server Logs**:
   - Look for email sending errors
   - Check API endpoint errors
   - Verify database connection

3. **Test API Endpoints**:
   ```bash
   # Test token validation
   curl "http://localhost:3000/api/auth/validate-setup-token?token=YOUR_TOKEN"
   
   # Test password setup
   curl -X POST http://localhost:3000/api/auth/setup-password \
     -H "Content-Type: application/json" \
     -d '{"token":"YOUR_TOKEN","password":"TestPass123!"}'
   ```

## 🔄 Production Considerations

### Security
- Use HTTPS in production
- Set secure cookie flags
- Implement rate limiting
- Add CSRF protection

### Email
- Use professional email service (SendGrid, Mailgun)
- Set up email templates
- Implement email tracking

### Monitoring
- Add logging for all auth events
- Monitor failed login attempts
- Track email delivery rates

### Backup
- Regular database backups
- Token cleanup automation
- Email queue management

## ✅ Success Checklist

- [ ] Database tables created successfully
- [ ] Email service configured and tested
- [ ] NGO registration form working
- [ ] Admin approval system functional
- [ ] Email sending on approval/rejection
- [ ] Password setup page accessible
- [ ] Token validation working
- [ ] Password setup functional
- [ ] NGO login working
- [ ] Complete flow tested end-to-end

The NGO authentication system is now ready for production use! 🎉

