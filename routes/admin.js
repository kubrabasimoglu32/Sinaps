const express = require("express");
const router = express.Router();

const { rolGerekli } = require("../middleware/yetki");
const { bekleyenNotlar } = require("../data/dummy");
const adminController = require("../controllers/adminController");

// 1) Bu router'daki her sayfa için: sadece admin ve moderatör
router.use(rolGerekli("admin", "moderator"));

// 2) Menüdeki turuncu sayaç için bekleyen not sayısını her admin sayfasına gönder
router.use((req, res, next) => {
    res.locals.bekleyenSayisi = bekleyenNotlar.length;
    next();
});

// 3) Sayfalar
router.get("/", adminController.genelBakis);
router.get("/notlar", adminController.notOnaylari);
router.post("/notlar/:id/onayla", adminController.notOnayla);
router.post("/notlar/:id/reddet", adminController.notReddet);

module.exports = router;