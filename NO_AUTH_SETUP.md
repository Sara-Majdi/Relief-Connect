# No Authentication Setup (Temporary)

## Overview
This setup allows anyone to create and manage campaigns without authentication. This is temporary until you implement proper user authentication for organizers and donors.

## What Changed

### ✅ Database Policies
- **Anyone can create campaigns** - No authentication required
- **Anyone can edit campaigns** - No ownership restrictions
- **Anyone can delete campaigns** - No ownership restrictions
- **Anyone can view campaigns** - Public access maintained

### ✅ Campaign Creation Form
- **No login required** - Removed authentication checks
- **Default values** - Uses "Anonymous NGO" and "Anonymous Organizer"
- **No user_id** - Set to null for now

### ✅ Campaign Edit Form
- **No ownership checks** - Anyone can edit any campaign
- **No authentication** - Works without login

## How to Apply Changes

### Step 1: Update Database Policies
Run the updated `supabase-policies.sql` in your Supabase SQL Editor:

1. Go to Supabase Dashboard → SQL Editor
2. Copy the contents of `supabase-policies.sql`
3. Paste and run the commands

### Step 2: Test Campaign Creation
1. Go to your app
2. Navigate to NGO Dashboard
3. Click "Create Campaign"
4. Fill out the form and submit
5. Should work without any authentication errors

## Current Behavior

### ✅ What Works
- Anyone can create campaigns
- Anyone can edit campaigns
- Anyone can view campaigns
- No RLS errors
- Campaigns appear in database

### ⚠️ What's Missing (For Later)
- User authentication
- Campaign ownership
- User-specific dashboards
- Permission controls
- User profiles

## When You're Ready for Authentication

When you want to add proper authentication later:

1. **Update RLS policies** to require authentication
2. **Add user authentication** to the forms
3. **Implement user management** system
4. **Add ownership checks** for campaigns
5. **Create user-specific dashboards**

## Testing

Try these actions to verify everything works:

1. **Create a campaign** - Should work without login
2. **Edit a campaign** - Should work without login
3. **View campaigns** - Should show all campaigns
4. **Check database** - Should see campaigns with null user_id

The system should now work without any authentication requirements!
