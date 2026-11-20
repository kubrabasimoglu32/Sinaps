const express = require("express");
const router = express.Router();

const { girisGerekli } = require("../middleware/yetki");
const soruController = require("../controllers/soruController");

// Herkes görebilir
router.get("/sorular", soruController.liste);
router.get("/soru/:slug", soruController.detay);

// Sadece giriş yapmış kullanıcılar
router.get("/soru-sor", girisGerekli, soruController.soruSorSayfasi);
router.post("/soru-sor", girisGerekli, soruController.soruSor);
router.post("/soru/:slug/cevap", girisGerekli, soruController.cevapYaz);
router.post("/soru/:slug/en-iyi/:cevapId", girisGerekli, soruController.enIyiSec);

module.exports = router;