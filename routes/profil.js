const express = require("express");
const router = express.Router();

const { girisGerekli } = require("../middleware/yetki");
const profilController = require("../controllers/profilController");

router.get("/profil", girisGerekli, profilController.benimProfilim);
router.get("/kullanici/:ad", profilController.kullaniciProfili);

module.exports = router;