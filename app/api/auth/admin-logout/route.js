import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

export async function POST() {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get("admin-session")?.value;

    if (sessionToken) {
      const supabase = await createClient();

      // Delete session from database
      await supabase
        .from("admin_sessions")
        .delete()
        .eq("session_token", sessionToken);

      // Clear the session cookie
      cookieStore.delete("admin-session");
    }

    return NextResponse.json(
      { success: true, message: "Logged out successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Admin logout error:", error);
    return NextResponse.json(
      { error: "An error occurred during logout" },
      { status: 500 }
    );
  }
}
