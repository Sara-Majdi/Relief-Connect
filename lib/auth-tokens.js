import crypto from 'crypto'
import bcrypt from 'bcryptjs'

/**
 * Generate a secure random token for password setup
 * @returns {string} A 64-character hexadecimal token
 */
export function generatePasswordSetupToken() {
  // Generate 32 random bytes and convert to hex (64 characters)
  return crypto.randomBytes(32).toString('hex')
}

/**
 * Hash a token using SHA256 for storage in database
 * This is different from password hashing - we use SHA256 for tokens
 * because we need deterministic hashing to look up tokens
 * @param {string} token - The plain token to hash
 * @returns {string} The SHA256 hash of the token
 */
export function hashToken(token) {
  return crypto
    .createHash('sha256')
    .update(token)
    .digest('hex')
}

/**
 * Hash a password using bcrypt
 * @param {string} password - The plain text password
 * @returns {Promise<string>} The bcrypt hash of the password
 */
export async function hashPassword(password) {
  const saltRounds = 10
  return await bcrypt.hash(password, saltRounds)
}

/**
 * Verify a password against a bcrypt hash
 * @param {string} password - The plain text password
 * @param {string} hash - The bcrypt hash to compare against
 * @returns {Promise<boolean>} True if password matches hash
 */
export async function verifyPassword(password, hash) {
  return await bcrypt.compare(password, hash)
}

/**
 * Generate a secure session token
 * @returns {string} A secure session token
 */
export function generateSessionToken() {
  return crypto.randomBytes(32).toString('hex')
}