# Install Required Dependencies

## New Dependencies for NGO Authentication System

Run this command to install the required packages:

```bash
npm install nodemailer bcryptjs
```

## Dependencies Added:

- **nodemailer**: For sending email notifications (password setup, rejection emails)
- **bcryptjs**: For secure password hashing and verification

## Alternative Installation Methods:

### Using Yarn:
```bash
yarn add nodemailer bcryptjs
```

### Using pnpm:
```bash
pnpm add nodemailer bcryptjs
```

## What These Dependencies Do:

### nodemailer
- Sends professional HTML emails to NGOs
- Handles email delivery for password setup links
- Sends rejection notifications with admin feedback
- Supports multiple email providers (Gmail, SendGrid, Mailgun, etc.)

### bcryptjs
- Securely hashes passwords before storing in database
- Verifies passwords during login
- Uses salt rounds for enhanced security
- Prevents password breaches even if database is compromised

## After Installation:

1. Set up your email configuration in `.env.local`
2. Run the database migrations
3. Test the complete authentication flow

The system is ready to use once these dependencies are installed!

