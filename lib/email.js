import nodemailer from 'nodemailer'

// Create transporter for sending emails
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  })
}

// Generic send email function
export const sendEmail = async ({ to, subject, html, text }) => {
  try {
    const transporter = createTransporter()

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject,
      html,
      text
    }

    const result = await transporter.sendMail(mailOptions)
    console.log('Email sent successfully:', result.messageId)
    return { success: true, messageId: result.messageId }
  } catch (error) {
    console.error('Error sending email:', error)
    throw error
  }
}

// Send password setup email to NGO
export const sendPasswordSetupEmail = async (email, orgName, setupToken) => {
  try {
    const transporter = createTransporter()
    
    // Encode the token properly for URL
    const encodedToken = encodeURIComponent(setupToken)
    const setupUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/setup-password?token=${encodedToken}`
    
    console.log('Sending password setup email:', {
      to: email,
      orgName,
      tokenLength: setupToken.length,
      urlLength: setupUrl.length
    })

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Welcome to ReliefConnect - Set Your Password',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to ReliefConnect!</h1>
          </div>
          
          <div style="padding: 30px; background: #f9f9f9;">
            <h2 style="color: #333; margin-top: 0;">Congratulations ${orgName}!</h2>
            
            <p style="color: #666; font-size: 16px; line-height: 1.6;">
              Your NGO registration has been approved by our admin team. You can now create your account and start using ReliefConnect to manage your disaster relief campaigns.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${setupUrl}" 
                 style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                        color: white; 
                        padding: 15px 30px; 
                        text-decoration: none; 
                        border-radius: 5px; 
                        font-weight: bold; 
                        display: inline-block;
                        font-size: 16px;">
                Set Your Password
              </a>
            </div>
            
            <p style="color: #666; font-size: 14px; line-height: 1.6;">
              This link will expire in 7 days for security reasons. If you need a new link, please contact our support team.
            </p>
            
            <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p style="color: #856404; font-size: 14px; margin: 0;">
                <strong>Important:</strong> This is a secure setup link unique to your organization. Do not share it with others.
              </p>
            </div>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
              <p style="color: #999; font-size: 12px; margin: 0;">
                If you didn't expect this email or did not register with ReliefConnect, please ignore it or contact our support team.
              </p>
            </div>
          </div>
          
          <div style="background: #333; color: white; padding: 20px; text-align: center;">
            <p style="margin: 0; font-size: 14px;">
              © 2024 ReliefConnect. Connecting NGOs with donors for disaster relief.
            </p>
          </div>
        </div>
      `
    }

    const result = await transporter.sendMail(mailOptions)
    console.log('Password setup email sent successfully:', result.messageId)
    return { success: true, messageId: result.messageId }
  } catch (error) {
    console.error('Error sending password setup email:', error)
    return { success: false, error: error.message }
  }
}

// Send forgot password email to donor
export const sendForgotPasswordEmail = async (email, resetUrl, name = 'Donor') => {
  try {
    const transporter = createTransporter()

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Reset Your ReliefConnect Password',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Password Reset Request</h1>
          </div>

          <div style="padding: 30px; background: #f9f9f9;">
            <h2 style="color: #333; margin-top: 0;">Hello ${name},</h2>

            <p style="color: #666; font-size: 16px; line-height: 1.6;">
              We received a request to reset your ReliefConnect password. If you made this request, click the button below to set a new password.
            </p>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}"
                 style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        color: white;
                        padding: 15px 30px;
                        text-decoration: none;
                        border-radius: 5px;
                        font-weight: bold;
                        display: inline-block;
                        font-size: 16px;">
                Reset Your Password
              </a>
            </div>

            <p style="color: #666; font-size: 14px; line-height: 1.6;">
              This link will expire in 1 hour for security reasons. If you need a new link, you can request another password reset.
            </p>

            <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p style="color: #856404; font-size: 14px; margin: 0;">
                <strong>Security Notice:</strong> If you didn't request this password reset, you can safely ignore this email. Your password will remain unchanged.
              </p>
            </div>

            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
              <p style="color: #999; font-size: 12px; margin: 0;">
                If the button doesn't work, copy and paste this link into your browser:<br>
                <span style="color: #667eea; word-break: break-all;">${resetUrl}</span>
              </p>
            </div>
          </div>

          <div style="background: #333; color: white; padding: 20px; text-align: center;">
            <p style="margin: 0; font-size: 14px;">
              © 2024 ReliefConnect. Connecting NGOs with donors for disaster relief.
            </p>
          </div>
        </div>
      `
    }

    const result = await transporter.sendMail(mailOptions)
    console.log('Forgot password email sent successfully:', result.messageId)
    return { success: true, messageId: result.messageId }
  } catch (error) {
    console.error('Error sending forgot password email:', error)
    return { success: false, error: error.message }
  }
}

// Send rejection email to NGO
export const sendRejectionEmail = async (email, orgName, reviewNotes) => {
  try {
    const transporter = createTransporter()

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'ReliefConnect Registration Update',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">ReliefConnect Registration Update</h1>
          </div>

          <div style="padding: 30px; background: #f9f9f9;">
            <h2 style="color: #333; margin-top: 0;">Dear ${orgName},</h2>

            <p style="color: #666; font-size: 16px; line-height: 1.6;">
              Thank you for your interest in joining ReliefConnect. After careful review of your application, we regret to inform you that we cannot approve your registration at this time.
            </p>

            ${reviewNotes ? `
              <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <h3 style="color: #856404; margin-top: 0;">Review Notes:</h3>
                <p style="color: #856404; margin: 0;">${reviewNotes}</p>
              </div>
            ` : ''}

            <p style="color: #666; font-size: 16px; line-height: 1.6;">
              We encourage you to address any concerns mentioned above and reapply in the future. If you have any questions or need clarification, please don't hesitate to contact our support team.
            </p>

            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
              <p style="color: #999; font-size: 12px; margin: 0;">
                Thank you for your understanding and interest in ReliefConnect.
              </p>
            </div>
          </div>

          <div style="background: #333; color: white; padding: 20px; text-align: center;">
            <p style="margin: 0; font-size: 14px;">
              © 2024 ReliefConnect. Connecting NGOs with donors for disaster relief.
            </p>
          </div>
        </div>
      `
    }

    const result = await transporter.sendMail(mailOptions)
    console.log('Rejection email sent successfully:', result.messageId)
    return { success: true, messageId: result.messageId }
  } catch (error) {
    console.error('Error sending rejection email:', error)
    return { success: false, error: error.message }
  }
}