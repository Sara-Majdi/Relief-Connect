import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { hashToken } from '@/lib/auth-tokens';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(request) {
  try {
    const { token, password } = await request.json();

    if (!token || !password) {
      return NextResponse.json(
        { error: 'Token and password are required' },
        { status: 400 }
      );
    }

    // Validate password strength
    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 }
      );
    }

    // Hash the token to match stored hash
    const tokenHash = hashToken(token);

    // Find the token in database
    const { data: tokenData, error: tokenError } = await supabase
      .from('password_setup_tokens')
      .select('*')
      .eq('token_hash', tokenHash)
      .is('used_at', null)
      .single();

    if (tokenError || !tokenData) {
      return NextResponse.json(
        { error: 'Invalid or expired reset token' },
        { status: 400 }
      );
    }

    // Check if token is expired
    const now = new Date();
    const expiresAt = new Date(tokenData.expires_at);

    if (now > expiresAt) {
      return NextResponse.json(
        { error: 'Reset token has expired. Please request a new one.' },
        { status: 400 }
      );
    }

    // Get the user from Supabase Auth using the email
    const { data: { users }, error: userError } = await supabase.auth.admin.listUsers();

    if (userError) {
      console.error('Error fetching users:', userError);
      return NextResponse.json(
        { error: 'Failed to update password. Please try again.' },
        { status: 500 }
      );
    }

    const user = users.find(u => u.email === tokenData.email);

    if (!user) {
      return NextResponse.json(
        { error: 'User account not found.' },
        { status: 404 }
      );
    }

    // Update user password in Supabase Auth
    const { error: updateError } = await supabase.auth.admin.updateUserById(
      user.id,
      { password }
    );

    if (updateError) {
      console.error('Error updating password:', updateError);
      return NextResponse.json(
        { error: 'Failed to update password. Please try again.' },
        { status: 500 }
      );
    }

    // Mark token as used
    await supabase
      .from('password_setup_tokens')
      .update({ used_at: new Date().toISOString() })
      .eq('id', tokenData.id);

    return NextResponse.json({
      message: 'Password has been reset successfully. You can now log in with your new password.'
    });

  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    );
  }
}
