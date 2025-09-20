# Fix: "New row violates row-level security policy" Error

## The Problem
You're getting this error because Supabase's Row Level Security (RLS) is blocking the campaign creation. This happens when:
1. No user is authenticated
2. The user doesn't have permission to insert into the campaigns table
3. The user_id is not included in the insert operation

## What I Fixed

### ✅ 1. Added Authentication Check
- Campaign creation now checks if user is authenticated
- Redirects to `/auth` if not logged in
- Includes user ID in campaign creation

### ✅ 2. Updated Database Insert
- Added `user_id: user.id` to campaign data
- Added `ngo: user.email` and `organizer: user.email`
- This ensures RLS policies can identify the campaign owner

### ✅ 3. Created RLS Policies
- Created `supabase-policies.sql` with proper policies
- Users can only insert/update/delete their own campaigns
- Anyone can view campaigns (for public access)

## Steps to Fix the Error

### Step 1: Set Up Your Database
Run the SQL commands in `supabase-policies.sql` in your Supabase SQL Editor:

1. Go to your Supabase dashboard
2. Navigate to SQL Editor
3. Copy and paste the contents of `supabase-policies.sql`
4. Click "Run" to execute the commands

### Step 2: Verify Your Environment Variables
Make sure your `.env.local` file has:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SITE_URL=http://localhost:3000
```

### Step 3: Test Authentication
1. Make sure users can sign in through your auth system
2. Try creating a campaign while logged in
3. Check the browser console for any errors

## How RLS Works Now

### Campaign Creation
- ✅ User must be authenticated
- ✅ User ID is included in the campaign data
- ✅ RLS policy allows authenticated users to insert their own campaigns

### Campaign Viewing
- ✅ Anyone can view campaigns (public access)
- ✅ Campaigns show on the public campaigns page

### Campaign Editing
- ✅ Only the campaign owner can edit their campaigns
- ✅ RLS policy enforces this at the database level

## Troubleshooting

### Still Getting RLS Error?
1. **Check if user is authenticated**: Look for user data in browser console
2. **Verify RLS policies**: Check Supabase dashboard → Authentication → Policies
3. **Check database schema**: Ensure `user_id` column exists in campaigns table
4. **Test with Supabase dashboard**: Try inserting a campaign directly in the dashboard

### Common Issues:
- **"User not authenticated"** → Check your auth flow
- **"Policy violation"** → Verify RLS policies are set up correctly
- **"Column doesn't exist"** → Run the SQL schema from `supabase-policies.sql`

## Testing Your Fix

1. **Sign in** to your app
2. **Navigate** to NGO dashboard
3. **Click** "Create Campaign"
4. **Fill out** the form and submit
5. **Check** if campaign appears in your Supabase dashboard

The campaign should now be created successfully with your user ID as the owner!
