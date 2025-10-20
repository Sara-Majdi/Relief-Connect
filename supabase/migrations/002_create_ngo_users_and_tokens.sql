-- Create NGO users table
CREATE TABLE IF NOT EXISTS ngo_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT,
    org_name TEXT NOT NULL,
    registration_id UUID REFERENCES ngo_registrations(id) ON DELETE CASCADE,
    is_active BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create password setup tokens table
CREATE TABLE IF NOT EXISTS password_setup_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL,
    token_hash TEXT NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    used_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_ngo_users_email ON ngo_users(email);
CREATE INDEX IF NOT EXISTS idx_ngo_users_registration_id ON ngo_users(registration_id);
CREATE INDEX IF NOT EXISTS idx_password_setup_tokens_email ON password_setup_tokens(email);
CREATE INDEX IF NOT EXISTS idx_password_setup_tokens_token_hash ON password_setup_tokens(token_hash);
CREATE INDEX IF NOT EXISTS idx_password_setup_tokens_expires_at ON password_setup_tokens(expires_at);

-- Enable Row Level Security (RLS)
ALTER TABLE ngo_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE password_setup_tokens ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for ngo_users
-- Allow anyone to insert NGO users (for registration)
CREATE POLICY "Anyone can insert NGO users" ON ngo_users
    FOR INSERT WITH CHECK (true);

-- Allow users to view their own data
CREATE POLICY "Users can view their own data" ON ngo_users
    FOR SELECT USING (auth.uid()::text = id::text);

-- Allow users to update their own data
CREATE POLICY "Users can update their own data" ON ngo_users
    FOR UPDATE USING (auth.uid()::text = id::text);

-- Allow service role to do everything
CREATE POLICY "Service role can do everything on ngo_users" ON ngo_users
    FOR ALL USING (auth.role() = 'service_role');

-- Create RLS policies for password_setup_tokens
-- Allow anyone to insert tokens (for password setup)
CREATE POLICY "Anyone can insert password setup tokens" ON password_setup_tokens
    FOR INSERT WITH CHECK (true);

-- Allow anyone to select tokens (for verification)
CREATE POLICY "Anyone can select password setup tokens" ON password_setup_tokens
    FOR SELECT USING (true);

-- Allow anyone to update tokens (for marking as used)
CREATE POLICY "Anyone can update password setup tokens" ON password_setup_tokens
    FOR UPDATE USING (true);

-- Allow service role to do everything
CREATE POLICY "Service role can do everything on password_setup_tokens" ON password_setup_tokens
    FOR ALL USING (auth.role() = 'service_role');

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update updated_at
CREATE TRIGGER update_ngo_users_updated_at 
    BEFORE UPDATE ON ngo_users 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Add function to clean up expired tokens
CREATE OR REPLACE FUNCTION cleanup_expired_tokens()
RETURNS void AS $$
BEGIN
    DELETE FROM password_setup_tokens 
    WHERE expires_at < NOW() AND used_at IS NULL;
END;
$$ LANGUAGE plpgsql;