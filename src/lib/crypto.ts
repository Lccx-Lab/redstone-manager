import "server-only";
import crypto from "node:crypto";

const IV_LENGTH = 12;
const AUTH_TAG_LENGTH = 16;

function getKey(): Buffer {
  const raw = process.env.CREDENTIALS_ENCRYPTION_KEY;
  if (!raw) {
    throw new Error("CREDENTIALS_ENCRYPTION_KEY is not set");
  }
  const key = Buffer.from(raw, "base64");
  if (key.length !== 32) {
    throw new Error("CREDENTIALS_ENCRYPTION_KEY must decode to exactly 32 bytes");
  }
  return key;
}

/** 文字列をAES-256-GCMで暗号化し、base64の1文字列（iv+authTag+暗号文）として返す */
export function encryptSecret(plaintext: string): string {
  const key = getKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const ciphertext = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return Buffer.concat([iv, authTag, ciphertext]).toString("base64");
}

/** encryptSecret で暗号化された文字列を復号する */
export function decryptSecret(encoded: string): string {
  const key = getKey();
  const raw = Buffer.from(encoded, "base64");
  const iv = raw.subarray(0, IV_LENGTH);
  const authTag = raw.subarray(IV_LENGTH, IV_LENGTH + AUTH_TAG_LENGTH);
  const ciphertext = raw.subarray(IV_LENGTH + AUTH_TAG_LENGTH);
  const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(authTag);
  const plaintext = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
  return plaintext.toString("utf8");
}
