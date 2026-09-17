const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const { listCompanies, getCompany } = require("../controllers/companyController");

const router = express.Router();

router.use(authMiddleware);

router.get("/", listCompanies);
router.get("/:id", getCompany);

module.exports = router;
