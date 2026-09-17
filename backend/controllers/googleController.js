const User = require("../models/User");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const jwt = require("jsonwebtoken");

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

// Verify a Google ID token (from Google Identity Services on the frontend)
// against Google's tokeninfo endpoint. Returns the token payload or throws.
async function verifyGoogleIdToken(idToken) {
  if (!idToken) throw new ApiError(400, "Google ID token is required");

  const response = await fetch(
    `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`
  );
  if (!response.ok) {
    throw new ApiError(401, "Google sign-in failed: the token is invalid or has expired");
  }

  const payload = await response.json();

  // The tokeninfo endpoint only returns data for tokens signed by Google,
  // and it enforces expiry. We additionally check the intended audience.
  const expectedAud = process.env.GOOGLE_CLIENT_ID;
  if (!expectedAud) {
    throw new ApiError(500, "Google sign-in is not configured on the server");
  }
  if (payload.aud !== expectedAud) {
    throw new ApiError(401, "Google sign-in failed: token was issued to a different app");
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