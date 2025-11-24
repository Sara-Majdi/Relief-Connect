import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { generatePasswordSetupToken, hashToken } from '@/lib/auth-tokens';
import { sendForgotPasswordEmail } from '@/lib/email';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Check if user exists in Supabase Auth
    const { data: { users }, error: userError } = await supabase.auth.admin.listUsers();

    if (userError) {
      console.error('Error fetching users:', userError);
      return NextResponse.json(
        { error: 'An error occurred. Please try again.' },
        { status: 500 }
      );
    }

    const user = users.find(u => u.email === email.toLowerCase());

    // Always return success to prevent email enumeration
    if (!user) {
      return NextResponse.json({
        message: 'If an account exists with this email, a password reset link has been sent.'
      });
    }

    // Generate reset token
    const token = generatePasswordSetupToken();
    const tokenHash = hashToken(token);

    // Store token in database (expires in 1 hour)
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1);

    // Delete any existing unused tokens for this email
    await supabase
      .from('password_setup_tokens')
      .delete()
      .eq('email', email.toLowerCase())
      .is('used_at', null);

    const { error: tokenError } = await supabase
      .from('password_setup_tokens')
      .insert({
        email: email.toLowerCase(),
        token_hash: tokenHash,
        expires_at: expiresAt.toISOString()
      });

    if (tokenError) {
      console.error('Error storing token:', tokenError);
      return NextResponse.json(
        { error: 'An error occurred. Please try again.' },
        { status: 500 }
      );
    }

    // Send email with reset link
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/reset-password?token=${token}`;

    try {
      await sendForgotPasswordEmail(email, resetUrl, user.user_metadata?.name || 'Donor');
    } catch (emailError) {
      console.error('Error sending email:', emailError);
      // Continue even if email fails - token is stored
    }

    return NextResponse.json({
      message: 'If an account exists with this email, a password reset link has been sent.'
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    );
  }
}
