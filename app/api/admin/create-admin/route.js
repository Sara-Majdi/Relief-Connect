import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { hashPassword } from "@/lib/auth-tokens";
import { cookies } from "next/headers";

export async function POST(request) {
  try {
    // Check if requester is authenticated as admin
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get("admin-session")?.value;

    if (!sessionToken) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    const supabase = await createClient();

    // Verify admin session and get admin details
    const { data: session, error: sessionError } = await supabase
      .from("admin_sessions")
      .select("*, admin_users(*)")
      .eq("session_token", sessionToken)
      .single();

    if (sessionError || !session) {
      return NextResponse.json(
        { error: "Invalid session" },
        { status: 401 }
      );
    }

    // Check if requesting admin has permission to create other admins
    // Only super-admin can create new admins
    if (session.admin_users.role !== "super-admin") {
      return NextResponse.json(
        { error: "Insufficient permissions. Only super admins can create admin accounts." },
        { status: 403 }
      );
    }

    const { name, email, password, role } = await request.json();

    // Validate input
    if (!name || !email || !password || !role) {
      return NextResponse.json(
        { error: "Name, email, password, and role are required" },
        { status: 400 }
      );
    }

    // Validate role
    if (!["admin", "super-admin"].includes(role)) {
      return NextResponse.json(
        { error: "Invalid role. Must be 'admin' or 'super-admin'" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Validate password strength (minimum 8 characters)
    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters long" },
        { status: 400 }
      );
    }

    // Check if admin with this email already exists
    const { data: existingAdmin, error: checkError } = await supabase
      .from("admin_users")
      .select("id")
      .eq("email", email.toLowerCase())
      .single();

    if (existingAdmin) {
      return NextResponse.json(
        { error: "Admin with this email already exists" },
        { status: 409 }
      );
    }

    // Hash the password
    const passwordHash = await hashPassword(password);

    // Create new admin user
    const { data: newAdmin, error: createError } = await supabase
      .from("admin_users")
      .insert({
        name,
        email: email.toLowerCase(),
        password_hash: passwordHash,
        role,
        is_active: true,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (createError) {
      console.error("Error creating admin:", createError);
      return NextResponse.json(
        { error: "Failed to create admin account" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        admin: {
          id: newAdmin.id,
          name: newAdmin.name,
          email: newAdmin.email,
          role: newAdmin.role,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create admin error:", error);
    return NextResponse.json(
      { error: "An error occurred creating admin account" },
      { status: 500 }
    );
  }
}
