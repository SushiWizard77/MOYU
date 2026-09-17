const express = require("express");
const { forgotPassword, resetPassword } = require("../controllers/resetController");

const router = express.Router();

// Forgot password (public — responds 200 regardless to avoid email enumeration)
router.post("/forgot", forgotPassword);

// Reset password (public — the one-time reset token itself proves identity,
// the requester is by definition locked out of their account)
router.post("/reset", resetPassword);

module.exports = router;