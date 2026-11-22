const express = require("express");
const router = express.Router();

const siteController = require("../controllers/siteController");
const haritaController = require("../controllers/haritaController");

// Adres → Controller fonksiyonu
router.get("/", siteController.anasayfa);
router.get("/bolumler", siteController.bolumler);
router.get("/bolum/:slug", siteController.bolumDetay);
router.get("/ders/:slug", siteController.dersDetay);
router.get("/not/:slug", siteController.notDetay);
router.get("/duyurular", siteController.duyurular);
router.get("/duyuru/:slug", siteController.duyuruDetay);
router.get("/site-haritasi", haritaController.sayfa);
router.get("/sitemap.xml", haritaController.xml);
router.get("/robots.txt", haritaController.robots);
module.exports = router;