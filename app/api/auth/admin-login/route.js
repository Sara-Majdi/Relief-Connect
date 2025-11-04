import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { verifyPassword, generateSessionToken } from "@/lib/auth-tokens";
import { cookies } from "next/headers";

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    console.log('=== ADMIN LOGIN ATTEMPT ===');
    console.log('Email:', email);
    console.log('Password length:', password?.length);

    // Validate input
    if (!email || !password) {
      console.log('❌ Missing email or password');
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    // Check if admin user exists in database
    const { data: admin, error: adminError } = await supabase
      .from("admin_users")
      .select("*")
      .eq("email", email.toLowerCase())
      .single();

    console.log('Admin query error:', adminError);
    console.log('Admin found:', admin ? 'YES' : 'NO');

    if (adminError || !admin) {
      console.log('❌ Admin not found or error:', adminError?.message);
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Check if admin account is active
    if (!admin.is_active) {
      return NextResponse.json(
        { error: "Admin account is not active" },
        { status: 403 }
      );
    }

    // Verify password
    console.log('Attempting to verify password for admin:', admin.email);
    console.log('Password hash from DB:', admin.password_hash);
    const isPasswordValid = await verifyPassword(password, admin.password_hash);
    console.log('Password valid:', isPasswordValid);

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Generate session token
    const sessionToken = generateSessionToken();

    // Update last login timestamp
    await supabase
      .from("admin_users")
      .update({ last_login: new Date().toISOString() })
      .eq("id", admin.id);

    // Set session cookie
    const cookieStore = await cookies();
    cookieStore.set("admin-session", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 8, // 8 hours
      path: "/",
    });

    // Store session in database
    await supabase.from("admin_sessions").insert({
      admin_id: admin.id,
      session_token: sessionToken,
      expires_at: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(), // 8 hours
    });

    return NextResponse.json(
      {
        success: true,
        admin: {
          id: admin.id,
          email: admin.email,
          name: admin.name,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Admin login error:", error);
    return NextResponse.json(
      { error: "An error occurred during login" },
      { status: 500 }
    );
  }
}
