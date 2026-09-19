const User = require("../models/User");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const jwt = require("jsonwebtoken");
const { createPublicKey } = require("crypto");

const GOOGLE_JWKS_URL = "https://www.googleapis.com/oauth2/v3/certs";
const GOOGLE_ISSUERS = ["accounts.google.com", "https://accounts.google.com"];

// Google rotates its signing keys, so cache them and honour the max-age that
// Google sends instead of fetching the key set on every sign-in.
let googleKeysCache = { keys: new Map(), expiresAt: 0 };

const signToken = (user) =>
  jwt.sign(
    { userId: user._id, email: user.email, role: user.role },
    process.env.JWT_SECRET || "moyu-dev-secret",
    { expiresIn: "7d" }
  );

const publicUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  avatar: user.avatar,
  googleId: user.googleId || "",
  theme: user.theme,
  streak: user.streak,
  onboarded: user.onboarded,
  createdAt: user.createdAt,
});

// Fetch Google's public signing key for a token's `kid`, caching the key set.
async function getGoogleSigningKey(kid) {
  if (Date.now() < googleKeysCache.expiresAt && googleKeysCache.keys.has(kid)) {
    return googleKeysCache.keys.get(kid);
  }

  const response = await fetch(GOOGLE_JWKS_URL);
  if (!response.ok) {
    throw new ApiError(502, "Google sign-in is temporarily unavailable. Please try again.");
  }

  const maxAge = Number(/max-age=(\d+)/.exec(response.headers.get("cache-control") || "")?.[1]) || 3600;
  const body = await response.json();
  const keys = new Map();

  for (const jwk of body.keys || []) {
    if (jwk.kty !== "RSA" || !jwk.kid) continue;
    try {
      keys.set(jwk.kid, createPublicKey({ key: jwk, format: "jwk" }).export({ type: "spki", format: "pem" }));
    } catch {
      // Skip keys that cannot be converted; another entry may match the kid.
    }
  }

  googleKeysCache = { keys, expiresAt: Date.now() + maxAge * 1000 };
  return googleKeysCache.keys.get(kid) || null;
}

// Verify a Google ID token (from Google Identity Services on the frontend)
// against Google's published public keys, checking signature, expiry, issuer
// and audience. Returns the token payload or throws.
async function verifyGoogleIdToken(idToken) {
  if (!idToken) throw new ApiError(400, "Google ID token is required");

  const expectedAud = process.env.GOOGLE_CLIENT_ID;
  if (!expectedAud) {
    throw new ApiError(500, "Google sign-in is not configured on the server");
  }

  const decoded = jwt.decode(idToken, { complete: true });
  const kid = decoded?.header?.kid;
  if (!kid) {
    throw new ApiError(401, "Google sign-in failed: the token is invalid or has expired");
  }

  const publicKey = await getGoogleSigningKey(kid);
  if (!publicKey) {
    throw new ApiError(401, "Google sign-in failed: the token was signed with an unknown key");
  }

  let payload;
  try {
    payload = jwt.verify(idToken, publicKey, {
      algorithms: ["RS256"],
      audience: expectedAud,
      issuer: GOOGLE_ISSUERS,
    });
  } catch {
    throw new ApiError(401, "Google sign-in failed: the token is invalid or has expired");
  }

  if (!payload.email || !(payload.email_verified === "true" || payload.email_verified === true)) {
    throw new ApiError(401, "Google sign-in failed: the Google account email is not verified");
  }

  return payload;
}

// POST /api/v1/google/auth  (public — token is verified server-side here)
// Exchanges a Google ID token for a real MOYU session (JWT + user).
const googleAuth = asyncHandler(async (req, res) => {
  const { idToken, credential } = req.body; // Google Identity Services sends `credential`
  const token = idToken || credential;

  const payload = await verifyGoogleIdToken(token);

  const email = String(payload.email).toLowerCase();
  const name = payload.name || email.split("@")[0];
  const picture = payload.picture || "";

  let user = await User.findOne({ email });

  if (!user) {
    // Auto-create the account from the verified Google profile
    user = await User.create({
      name,
      email,
      googleId: payload.sub || "",
      avatar: picture,
      // Google accounts have no local password (model allows this when googleId is set)
    });
  } else {
    // Link Google to an existing email/password account, and refresh the avatar
    let dirty = false;
    if (!user.googleId && payload.sub) {
      user.googleId = payload.sub;
      dirty = true;
    }
    if (picture && !user.avatar) {
      user.avatar = picture;
      dirty = true;
    }
    if (dirty) await user.save();
  }

  return res.status(200).json({
    success: true,
    message: "Signed in with Google",
    token: signToken(user),
    user: publicUser(user),
  });
});

module.exports = { googleAuth };