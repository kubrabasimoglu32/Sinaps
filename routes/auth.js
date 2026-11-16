const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

router.get("/kayit", authController.kayitSayfasi);
router.post("/kayit", authController.kayitOl);

router.get("/giris", authController.girisSayfasi);
router.post("/giris", authController.girisYap);

router.post("/cikis", authController.cikis);

module.exports = router;