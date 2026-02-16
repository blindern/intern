import crypto from "node:crypto"

/**
 * Generate SSHA password hash for LDAP.
 * Format: {SSHA}base64(SHA1(password + salt) + salt)
 */
export function sshaHash(password: string): string {
  const salt = crypto.randomBytes(4)
  const hash = crypto.createHash("sha1")
  hash.update(password)
  hash.update(salt)
  const digest = hash.digest()
  const combined = Buffer.concat([digest, salt])
  return `{SSHA}${combined.toString("base64")}`
}
