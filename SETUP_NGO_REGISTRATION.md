# Setting Up NGO Registration System

## Overview

This guide will help you set up the complete NGO registration and approval system for ReliefConnect.

## Features Implemented

### ✅ NGO Registration
- Multi-step registration form with organization details
- Document upload (registration certificate, tax exemption, annual report)
- Form validation and error handling
- File storage in Supabase Storage

### ✅ Admin Approval System
- Admin dashboard to view all NGO applications
- Review application details and documents
- Approve or reject applications with notes
- Real-time status updates

### ✅ API Endpoints
- `GET /api/ngo/registrations` - Fetch NGO applications
- `POST /api/ngo/registrations` - Create new NGO registration
- `PUT /api/ngo/registrations/[id]/approve` - Approve application
- `PUT /api/ngo/registrations/[id]/reject` - Reject application

## Database Setup

### Step 1: Create the NGO Registrations Table

Run the migration file in your Supabase SQL Editor:

1. Go to your Supabase dashboard
2. Navigate to **SQL Editor**
3. Copy and paste the contents of `supabase/migrations/001_create_ngo_registrations_table.sql`
4. Click **Run** to execute the commands

### Step 2: Set Up File Storage

1. In your Supabase dashboard, go to **Storage**
2. Create a new bucket called `ngo-documents`
3. Set the bucket to **Public** (or configure RLS policies as needed)

### Step 3: Configure Environment Variables

Make sure your `.env.local` file has:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## How It Works

### NGO Registration Flow

1. **User visits** `/ngo/register`
2. **Fills out** organization information (Step 1)
3. **Uploads documents** (Step 2) - files are stored in Supabase Storage
4. **Reviews and submits** (Step 3) - data is saved to database with status 'pending'
5. **Redirected** to NGO dashboard with success message

### Admin Approval Flow

1. **Admin visits** `/admin/dashboard`
2. **Clicks** "NGO Applications" tab
3. **Views** list of pending applications
4. **Clicks** "Review" on an application
5. **Reviews** organization details and documents
6. **Adds notes** and clicks "Approve" or "Reject"
7. **Application status** is updated in database

## Testing the System

### Test NGO Registration

1. Visit `http://localhost:3000/ngo/register`
2. Fill out the registration form
3. Upload some test documents (PDF files)
4. Submit the form
5. Check your Supabase dashboard to see the new record

### Test Admin Approval

1. Visit `http://localhost:3000/admin/dashboard`
2. Click the "NGO Applications" tab
3. You should see your test registration
4. Click "Review" to see the details
5. Try approving or rejecting the application

## File Structure

```
app/
├── ngo/register/page.jsx          # NGO registration form
├── admin/dashboard/page.jsx       # Admin dashboard with approval system
└── api/ngo/registrations/
    ├── route.js                   # GET/POST for registrations
    └── [id]/
        ├── approve/route.js       # Approve application
        └── reject/route.js        # Reject application

supabase/migrations/
└── 001_create_ngo_registrations_table.sql  # Database schema
```

## Database Schema

The `ngo_registrations` table includes:

- **Organization Info**: name, registration number, type, year established
- **Contact Info**: address, email, phone
- **Documents**: URLs to uploaded files
- **Status**: pending, under-review, approved, rejected
- **Review Info**: notes, reviewed by, reviewed at
- **Timestamps**: created_at, updated_at

## Security Features

- **Row Level Security (RLS)** enabled
- **File upload validation** (PDF only, size limits)
- **Form validation** on both client and server
- **API error handling** with proper HTTP status codes

## Troubleshooting

### Common Issues

1. **"Table doesn't exist" error**
   - Run the migration SQL in your Supabase dashboard
   - Check that the table was created successfully

2. **"File upload failed" error**
   - Verify the `ngo-documents` bucket exists in Supabase Storage
   - Check bucket permissions (should be public or have proper RLS policies)

3. **"No applications found" in admin dashboard**
   - Check if any registrations exist in the database
   - Verify the API endpoint is working by visiting `/api/ngo/registrations`

4. **"Approval/Rejection failed" error**
   - Check that the application ID exists
   - Verify the API routes are accessible
   - Check browser console for error details

### Testing API Endpoints

You can test the API endpoints directly:

```bash
# Get all registrations
curl http://localhost:3000/api/ngo/registrations

# Get pending registrations only
curl http://localhost:3000/api/ngo/registrations?status=pending

# Approve an application (replace ID)
curl -X PUT http://localhost:3000/api/ngo/registrations/[ID]/approve \
  -H "Content-Type: application/json" \
  -d '{"reviewNotes": "Application approved"}'
```

## Next Steps

After setting up the basic system, you might want to add:

- **Email notifications** when applications are approved/rejected
- **User authentication** to track which admin reviewed applications
- **Application status history** to track changes over time
- **Bulk approval** for multiple applications
- **Advanced filtering** and search in the admin dashboard

The system is now ready to handle NGO registrations and admin approvals!
