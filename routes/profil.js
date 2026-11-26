const express = require("express");
const router = express.Router();

const { girisGerekli } = require("../middleware/yetki");
const { resimYukleyici } = require("../middleware/yukleme");
const profilController = require("../controllers/profilController");
const ayarlarController = require("../controllers/ayarlarController");

router.get("/profil", girisGerekli, profilController.benimProfilim);
router.get("/kullanici/:ad", profilController.kullaniciProfili);

router.get("/profil/ayarlar", girisGerekli, ayarlarController.sayfa);
router.post("/profil/ayarlar/bilgiler", girisGerekli, ayarlarController.bilgiGuncelle);
router.post("/profil/ayarlar/sifre", girisGerekli, ayarlarController.sifreDegistir);
router.post("/profil/ayarlar/foto", girisGerekli, resimYukleyici("profil", "foto"), ayarlarController.fotoYukle);
router.post("/profil/ayarlar/foto/kaldir", girisGerekli, ayarlarController.fotoKaldir);

module.exports = router;