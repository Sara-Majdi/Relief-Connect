# Setting Up Donations Database

## Issue: Donations Not Being Saved

The donations are not appearing in the database because:

1. **Donations table doesn't exist** - The `donations` table needs to be created
2. **Donor profile uses hardcoded data** - The profile page was using mock data instead of real database data
3. **Missing database migration** - No migration script was run to create the table

## Solutions Implemented

### 1. Created Donations Table Migration
- File: `supabase/migrations/001_create_donations_table.sql`
- Creates the `donations` table with proper structure
- Sets up foreign keys, indexes, and Row Level Security (RLS)

### 2. Updated Donor Profile to Use Real Data
- File: `app/donor/profile/page.jsx`
- Now fetches real donation data from the database
- Calculates totals and impact levels dynamically
- Falls back gracefully if table doesn't exist

### 3. Added Webhook Handler
- File: `app/api/webhooks/stripe/route.js`
- Handles Stripe webhook events for completed payments
- Ensures donations are recorded even if the success page fails

### 4. Added Database Testing Endpoint
- File: `app/api/test-donations/route.js`
- Test if the donations table exists and is accessible
- Can test inserting sample data

## How to Fix

### Option 1: Using Supabase CLI (Recommended)

1. **Install Supabase CLI** (if not already installed):
   ```bash
   npm install -g supabase
   ```

2. **Login to Supabase**:
   ```bash
   supabase login
   ```

3. **Link your project**:
   ```bash
   supabase link --project-ref YOUR_PROJECT_REF
   ```

4. **Run the migration**:
   ```bash
   supabase db push
   ```

### Option 2: Using Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy and paste the contents of `supabase/migrations/001_create_donations_table.sql`
4. Run the SQL script

### Option 3: Manual Table Creation

Run this SQL in your Supabase SQL Editor:

```sql
-- Create donations table
CREATE TABLE IF NOT EXISTS donations (
    id TEXT PRIMARY KEY,
    campaign_id TEXT NOT NULL,
    donor_id TEXT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    tip_amount DECIMAL(10,2) DEFAULT 0,
    total_amount DECIMAL(10,2) NOT NULL,
    is_recurring BOOLEAN DEFAULT FALSE,
    recurring_interval TEXT DEFAULT 'monthly',
    receipt_number TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    stripe_session_id TEXT,
    donor_name TEXT,
    donor_email TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create foreign key relationship with campaigns table
ALTER TABLE donations 
ADD CONSTRAINT donations_campaign_id_fkey 
FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_donations_donor_id ON donations(donor_id);
CREATE INDEX IF NOT EXISTS idx_donations_campaign_id ON donations(campaign_id);
CREATE INDEX IF NOT EXISTS idx_donations_status ON donations(status);
CREATE INDEX IF NOT EXISTS idx_donations_created_at ON donations(created_at);

-- Enable Row Level Security (RLS)
ALTER TABLE donations ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own donations" ON donations
    FOR SELECT USING (auth.uid()::text = donor_id);

CREATE POLICY "Users can insert their own donations" ON donations
    FOR INSERT WITH CHECK (auth.uid()::text = donor_id);

CREATE POLICY "Service role can do everything" ON donations
    FOR ALL USING (auth.role() = 'service_role');
```

## Testing

### 1. Test Database Connection
Visit: `http://localhost:3000/api/test-donations`
- GET: Tests if table exists
- POST: Tests if you can insert data

### 2. Test Donation Flow
1. Go to a campaign page
2. Click "Donate Money"
3. Complete the donation flow
4. Check your donor profile to see if the donation appears

### 3. Check Logs
Look at your server logs for:
- "Donation successfully inserted" messages
- Any error messages about database operations

## Environment Variables

Make sure you have these environment variables set:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Stripe Webhook Configuration

To ensure donations are reliably saved, configure a Stripe webhook:

1. Go to your Stripe Dashboard
2. Navigate to **Developers > Webhooks**
3. Click **Add endpoint**
4. Set the endpoint URL to: `https://yourdomain.com/api/webhooks/stripe`
5. Select these events:
   - `checkout.session.completed`
6. Copy the webhook secret and add it to your environment variables as `STRIPE_WEBHOOK_SECRET`

## Troubleshooting

### If donations still don't appear:

1. **Check RLS Policies**: Make sure the RLS policies allow your user to insert/view donations
2. **Check User ID**: Verify that the `donor_id` matches the authenticated user's ID
3. **Check Campaign ID**: Ensure the `campaign_id` exists in the campaigns table
4. **Check Logs**: Look for error messages in the server logs
5. **Test API**: Use the test endpoint to verify table access

### Common Issues:

- **Foreign Key Constraint**: Make sure the campaign_id exists in the campaigns table
- **RLS Policy**: User might not have permission to insert/view donations
- **Data Type Mismatch**: Check that amounts are valid decimal numbers
- **Missing Required Fields**: Ensure all required fields are provided
