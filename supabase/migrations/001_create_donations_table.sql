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
-- Users can view their own donations
CREATE POLICY "Users can view their own donations" ON donations
    FOR SELECT USING (auth.uid()::text = donor_id);

-- Users can insert their own donations
CREATE POLICY "Users can insert their own donations" ON donations
    FOR INSERT WITH CHECK (auth.uid()::text = donor_id);

-- Service role can do everything (for server-side operations)
CREATE POLICY "Service role can do everything" ON donations
    FOR ALL USING (auth.role() = 'service_role');

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_donations_updated_at 
    BEFORE UPDATE ON donations 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
