const express = require("express");
const { googleAuth } = require("../controllers/googleController");

const router = express.Router();

// Public — the Google ID token is verified server-side inside the controller.
// Mounted at /api/v1/auth/google
router.post("/", googleAuth);

module.exports = router;