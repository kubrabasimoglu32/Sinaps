const express = require("express");
const router = express.Router();
const { rolGerekli } = require("../middleware/yetki");

// Bu router'daki BÜTÜN adresler için kontrol: sadece admin ve moderatör girebilir
router.use(rolGerekli("admin", "moderator"));

// GEÇİCİ: Admin paneli tasarlanınca controller'a taşınacak
router.get("/", (req, res) => {
    res.render("admin/panel", { title: "Admin paneli" });
});

module.exports = router;