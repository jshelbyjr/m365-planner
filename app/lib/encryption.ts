
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12; // Recommended for GCM
const TAG_LENGTH = 16;

/**
 * Gets the encryption key from the environment variable or .encryption_key file.
 * If not set, auto-generates and persists a new key to .encryption_key in the project root.
 */
function getKey(): Buffer {
  let key = process.env.ENCRYPTION_KEY;
  if (!key) {
    // Try to read from .encryption_key file in project root
    const keyPath = path.resolve(process.cwd(), '.encryption_key');
    if (fs.existsSync(keyPath)) {
      key = fs.readFileSync(keyPath, 'utf8').trim();
    } else {
      // Generate a new 32-byte key and persist it
      const newKey = crypto.randomBytes(32);
      key = newKey.toString('base64');
      fs.writeFileSync(keyPath, key, { encoding: 'utf8', mode: 0o600 });
      // Optionally, log a warning (can be removed in production)
      // console.warn('Generated new ENCRYPTION_KEY and saved to .encryption_key');
    }
  }
  const buf = Buffer.from(key, 'base64');
  if (buf.length !== 32) throw new Error('ENCRYPTION_KEY must be 32 bytes (base64-encoded)');
  return buf;
}

/**
 * Encrypts a string using AES-256-GCM.
 * @param plaintext The string to encrypt.
 * @returns The encrypted value (base64-encoded: iv:ciphertext:tag)
 */
export function encrypt(plaintext: string): string {
  const iv = crypto.randomBytes(IV_LENGTH);
  const key = getKey();
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  const ciphertext = Buffer.concat([
    cipher.update(plaintext, 'utf8'),
    cipher.final()
  ]);
  const tag = cipher.getAuthTag();
  return [iv.toString('base64'), ciphertext.toString('base64'), tag.toString('base64')].join(':');
}

/**
 * Decrypts a string using AES-256-GCM.
 * @param encrypted The encrypted value (base64-encoded: iv:ciphertext:tag)
 * @returns The decrypted plaintext
 */
export function decrypt(encrypted: string): string {
  const [ivB64, ciphertextB64, tagB64] = encrypted.split(':');
  if (!ivB64 || !ciphertextB64 || !tagB64) throw new Error('Invalid encrypted value');
  const iv = Buffer.from(ivB64, 'base64');
  const ciphertext = Buffer.from(ciphertextB64, 'base64');
  const tag = Buffer.from(tagB64, 'base64');
  const key = getKey();
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(tag);
  const plaintext = Buffer.concat([
    decipher.update(ciphertext),
    decipher.final()
  ]);
  return plaintext.toString('utf8');
}
