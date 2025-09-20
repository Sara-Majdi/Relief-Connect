# Supabase Setup Guide

## Current File Organization ✅

Your Supabase files are now properly organized:

```
lib/
├── supabase/
│   ├── client.js     # Browser client (for client components)
│   └── server.js     # Server client (for server components/actions)
├── supabaseClient.js # Legacy client (deprecated, kept for compatibility)
└── utils.js
```

## Required Environment Variables

Create a `.env.local` file in your project root with:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Site URL for OAuth redirects
SITE_URL=http://localhost:3000
```

## How to Get Your Supabase Credentials

1. Go to [supabase.com](https://supabase.com) and sign in
2. Select your project (or create a new one)
3. Go to Settings → API
4. Copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Usage Patterns

### Client Components (use `lib/supabase/client.js`)
```javascript
import { createClient } from '@/lib/supabase/client'

export default function MyComponent() {
  const supabase = createClient()
  
  // Use supabase here
}
```

### Server Components/Actions (use `lib/supabase/server.js`)
```javascript
import { createClient } from '@/lib/supabase/server'

export async function MyServerAction() {
  const supabase = await createClient()
  
  // Use supabase here
}
```

## Database Schema Requirements

Your campaign creation forms expect these tables:

### `campaigns` table
```sql
CREATE TABLE campaigns (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  long_description TEXT,
  goal NUMERIC NOT NULL,
  raised NUMERIC DEFAULT 0,
  urgency TEXT NOT NULL,
  disaster TEXT NOT NULL,
  state TEXT NOT NULL,
  location TEXT NOT NULL,
  start_date DATE NOT NULL,
  target_date DATE NOT NULL,
  beneficiaries INTEGER NOT NULL,
  image_url TEXT,
  verified BOOLEAN DEFAULT false,
  financial_breakdown JSONB,
  needed_items JSONB,
  donors INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Storage Bucket
Create a storage bucket named `campaign-images` for campaign photos.

## Migration Steps

1. **Create `.env.local`** with your Supabase credentials
2. **Update your database** with the schema above
3. **Create storage bucket** for campaign images
4. **Test the setup** by running your app

## Troubleshooting

### Common Issues:
- **"Missing Supabase environment variables"** → Check your `.env.local` file
- **"Invalid API key"** → Verify your credentials in Supabase dashboard
- **Storage upload fails** → Ensure `campaign-images` bucket exists and has proper permissions

### Testing Your Setup:
1. Start your dev server: `npm run dev`
2. Try creating a campaign
3. Check the browser console for any errors
4. Verify data appears in your Supabase dashboard

## Next Steps

1. Set up your Supabase project
2. Create the database schema
3. Configure storage bucket
4. Test the campaign creation flow
