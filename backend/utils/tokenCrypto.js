// AES-256-GCM helpers for OAuth/PAT tokens at rest.
// Key: GITHUB_TOKEN_KEY (64 hex chars) or derived from JWT_SECRET.
// Tokens are never logged; only iv/tag/data ciphertext is persisted.
const crypto = require("crypto");

function getKey() {
  const hex = process.env.GITHUB_TOKEN_KEY;
  if (hex && /^[0-9a-fA-F]{64}$/.test(hex.trim())) {
    return Buffer.from(hex.trim(), "hex");
  }
  const fallback = process.env.JWT_SECRET || "moyu-dev-only-fallback-key";
  return crypto.scryptSync(String(fallback), "moyu-github-token-salt", 32);
}

const encryptToken = (plain) => {
  const key = getKey();
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const data = Buffer.concat([cipher.update(String(plain), "utf8"), cipher.final()]);
  return { iv: iv.toString("hex"), tag: cipher.getAuthTag().toString("hex"), data: data.toString("hex") };
};

const decryptToken = ({ iv, tag, data }) => {
  const key = getKey();
  const decipher = crypto.createDecipheriv("aes-256-gcm", key, Buffer.from(iv, "hex"));
  decipher.setAuthTag(Buffer.from(tag, "hex"));
  return Buffer.concat([decipher.update(Buffer.from(data, "hex")), decipher.final()]).toString("utf8");
};

module.exports = { encryptToken, decryptToken };
