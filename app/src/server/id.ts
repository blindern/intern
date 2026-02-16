import crypto from "node:crypto"

let counter = crypto.randomInt(0xffffff)

/**
 * Generate a 24-char hex ID matching MongoDB ObjectId format.
 * 4-byte timestamp + 5-byte random + 3-byte counter.
 */
export function generateId(): string {
  const buf = Buffer.alloc(12)

  // 4-byte timestamp (seconds)
  buf.writeUInt32BE(Math.floor(Date.now() / 1000), 0)

  // 5-byte random
  const random = crypto.randomBytes(5)
  random.copy(buf, 4)

  // 3-byte counter
  counter = (counter + 1) % 0xffffff
  buf.writeUIntBE(counter, 9, 3)

  return buf.toString("hex")
}
