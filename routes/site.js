const express = require("express");
const router = express.Router();

const siteController = require("../controllers/siteController");

// Adres → Controller fonksiyonu
router.get("/", siteController.anasayfa);
router.get("/", siteController.anasayfa);
router.get("/bolumler", siteController.bolumler);
router.get("/bolum/:slug", siteController.bolumDetay);
router.get("/ders/:slug", siteController.dersDetay);
router.get("/not/:slug", siteController.notDetay);
module.exports = router;