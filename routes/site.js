const express = require("express");
const router = express.Router();

const siteController = require("../controllers/siteController");

// Adres → Controller fonksiyonu
router.get("/", siteController.anasayfa);

module.exports = router;