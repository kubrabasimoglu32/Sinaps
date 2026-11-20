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
// ===== SADECE ADMİN =====
const sadeceAdmin = rolGerekli("admin");

router.get("/duyurular", sadeceAdmin, adminController.duyuruListesi);
router.get("/duyurular/yeni", sadeceAdmin, adminController.duyuruEkleSayfasi);
router.post("/duyurular/yeni", sadeceAdmin, adminController.duyuruEkle);
router.get("/duyurular/:id/duzenle", sadeceAdmin, adminController.duyuruDuzenleSayfasi);
router.post("/duyurular/:id/duzenle", sadeceAdmin, adminController.duyuruGuncelle);
router.post("/duyurular/:id/sil", sadeceAdmin, adminController.duyuruSil);
module.exports = router;