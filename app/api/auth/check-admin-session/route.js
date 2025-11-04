import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get("admin-session")?.value;

    console.log('=== CHECK ADMIN SESSION ===');
    console.log('Session token exists:', !!sessionToken);

    if (!sessionToken) {
      console.log('❌ No session token found');
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    const supabase = createAdminClient();

    // Check if session exists and is valid
    const { data: session, error: sessionError } = await supabase
      .from("admin_sessions")
      .select("*, admin_users(*)")
      .eq("session_token", sessionToken)
      .single();

    console.log('Session query error:', sessionError);
    console.log('Session found:', session ? 'YES' : 'NO');

    if (sessionError || !session) {
      console.log('❌ Session not found:', sessionError?.message);
      return NextResponse.json(
        { error: "Invalid session" },
        { status: 401 }
      );
    }

    // Check if session has expired
    const expiresAt = new Date(session.expires_at);
    if (expiresAt < new Date()) {
      // Delete expired session
      await supabase
        .from("admin_sessions")
        .delete()
        .eq("session_token", sessionToken);

      return NextResponse.json(
        { error: "Session expired" },
        { status: 401 }
      );
    }

    // Check if admin user is still active
    if (!session.admin_users.is_active) {
      return NextResponse.json(
        { error: "Admin account is not active" },
        { status: 403 }
      );
    }

    return NextResponse.json(
      {
        authenticated: true,
        admin: {
          id: session.admin_users.id,
          email: session.admin_users.email,
          name: session.admin_users.name,
          role: session.admin_users.role,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Admin session check error:", error);
    return NextResponse.json(
      { error: "An error occurred checking session" },
      { status: 500 }
    );
  }
}
