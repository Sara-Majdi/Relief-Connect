import { NextResponse } from 'next/server'
import { sendEmail } from '@/lib/email'

export async function POST(request) {
  try {
    const { to, message, campaignTitle, campaignUrl, campaignDescription } = await request.json()

    // Validate required fields
    if (!to || !campaignTitle || !campaignUrl) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(to)) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      )
    }

    // Prepare email content
    const personalMessage = message ? `
      <div style="background-color: #f3f4f6; padding: 16px; border-radius: 8px; margin: 20px 0;">
        <p style="margin: 0; color: #374151; font-style: italic;">"${message}"</p>
      </div>
    ` : ''

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(to right, #3b82f6, #8b5cf6); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Relief Connect</h1>
          </div>

          <div style="background-color: white; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
            <p style="font-size: 16px; margin-bottom: 20px;">Hello!</p>

            <p style="font-size: 16px; margin-bottom: 20px;">
              Someone thought you might be interested in supporting this campaign on Relief Connect:
            </p>

            ${personalMessage}

            <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #3b82f6;">
              <h2 style="margin: 0 0 12px 0; color: #1f2937; font-size: 20px;">${campaignTitle}</h2>
              ${campaignDescription ? `<p style="color: #6b7280; margin: 0; line-height: 1.5;">${campaignDescription.substring(0, 200)}${campaignDescription.length > 200 ? '...' : ''}</p>` : ''}
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${campaignUrl}"
                 style="display: inline-block; background: linear-gradient(to right, #3b82f6, #8b5cf6); color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
                View Campaign
              </a>
            </div>

            <p style="font-size: 14px; color: #6b7280; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
              Every contribution makes a difference. Visit the campaign page to learn more and support this cause.
            </p>

            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; color: #9ca3af; font-size: 12px;">
              <p style="margin: 5px 0;">This email was sent from Relief Connect</p>
              <p style="margin: 5px 0;">Connecting communities in need with those who care</p>
            </div>
          </div>
        </body>
      </html>
    `

    const textContent = `
Someone thought you might be interested in supporting this campaign on Relief Connect:

${campaignTitle}
${campaignDescription ? '\n' + campaignDescription.substring(0, 200) + (campaignDescription.length > 200 ? '...' : '') : ''}

${message ? '\nPersonal message:\n"' + message + '"\n' : ''}

View the campaign here: ${campaignUrl}

Every contribution makes a difference. Visit the campaign page to learn more and support this cause.

---
This email was sent from Relief Connect
Connecting communities in need with those who care
    `

    // Send email using the existing email utility
    await sendEmail({
      to,
      subject: `Someone shared a campaign with you: ${campaignTitle}`,
      html: htmlContent,
      text: textContent
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error sending campaign share email:', error)
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    )
  }
}
