/**
 * Script to create the first super admin user
 *
 * Usage:
 * 1. Update the admin details below
 * 2. Run: node scripts/create-first-admin.js
 * 3. The script will create the admin in your database
 */

const bcrypt = require('bcryptjs');
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables manually
function loadEnvFile() {
  const envPath = path.join(__dirname, '..', '.env.local');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf-8');
    envContent.split('\n').forEach(line => {
      const [key, ...valueParts] = line.split('=');
      if (key && valueParts.length) {
        const value = valueParts.join('=').trim();
        process.env[key.trim()] = value;
      }
    });
  }
}

loadEnvFile();

// ===== CONFIGURE YOUR ADMIN DETAILS HERE =====
const ADMIN_CONFIG = {
  name: 'Super Admin',
  email: 'admin@reliefconnect.com',
  password: '12345678', // CHANGE THIS!
  role: 'super-admin',
};
// ==============================================

async function createFirstAdmin() {
  console.log('🚀 Creating first super admin...\n');

  // Validate environment variables
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    console.error('❌ Error: NEXT_PUBLIC_SUPABASE_URL not found in environment variables');
    process.exit(1);
  }

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('❌ Error: SUPABASE_SERVICE_ROLE_KEY not found in environment variables');
    console.log('   You need the service role key (not the anon key) to create admin users');
    process.exit(1);
  }

  // Create Supabase client with service role key
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  try {
    // Check if admin with this email already exists
    const { data: existingAdmin, error: checkError } = await supabase
      .from('admin_users')
      .select('email')
      .eq('email', ADMIN_CONFIG.email.toLowerCase())
      .single();

    if (existingAdmin) {
      console.error(`❌ Admin with email "${ADMIN_CONFIG.email}" already exists!`);
      process.exit(1);
    }

    // Hash the password
    console.log('🔐 Hashing password...');
    const passwordHash = await bcrypt.hash(ADMIN_CONFIG.password, 10);

    // Insert admin user
    console.log('💾 Creating admin user in database...');
    const { data, error } = await supabase
      .from('admin_users')
      .insert({
        name: ADMIN_CONFIG.name,
        email: ADMIN_CONFIG.email.toLowerCase(),
        password_hash: passwordHash,
        role: ADMIN_CONFIG.role,
        is_active: true,
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Error creating admin:', error.message);

      if (error.code === '42P01') {
        console.log('\n💡 The admin_users table does not exist yet.');
        console.log('   Please run the SQL scripts from ADMIN_SETUP.md first.\n');
      }

      process.exit(1);
    }

    console.log('\n✅ Success! Admin user created:\n');
    console.log('   Name:', data.name);
    console.log('   Email:', data.email);
    console.log('   Role:', data.role);
    console.log('   ID:', data.id);
    console.log('\n📝 Login credentials:');
    console.log('   Email:', ADMIN_CONFIG.email);
    console.log('   Password:', ADMIN_CONFIG.password);
    console.log('\n🔗 Login at: http://localhost:3000/auth/admin');
    console.log('\n⚠️  Make sure to change the password in the script after running!\n');

  } catch (err) {
    console.error('❌ Unexpected error:', err.message);
    process.exit(1);
  }
}

// Run the script
createFirstAdmin();
