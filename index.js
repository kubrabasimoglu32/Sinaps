const express = require("express");
const path = require("path");
const session = require("express-session");

const app = express();

// ===== AYARLAR =====
app.set("view engine", "ejs");

// ===== 1. STATİK DOSYALAR VE FORM VERİSİ =====
app.use("/static", express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));

// ===== 2. OTURUM (SESSION) =====
app.use(session({
    secret: "sinaps-gizli-anahtar-degistir",
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 24 } // 1 gün
}));

// ===== 3. ZİYARETÇİ SAYACI VE ÇEVRİMİÇİ =====
const { sayacMiddleware } = require("./middleware/sayac");
app.use(sayacMiddleware);

// ===== 4. KULLANICI VE CSRF KODUNU SAYFALARA GÖNDER =====
app.use(require("./middleware/locals"));

// ===== 5. CSRF KORUMASI =====
const { csrfKoruma } = require("./middleware/csrf");
app.use(csrfKoruma);

// ===== 6. ROUTES (yeni router eklerken HEP buraya ekle) =====
const siteRouter = require("./routes/site");
const authRouter = require("./routes/auth");
const soruRouter = require("./routes/soru");
const profilRouter = require("./routes/profil");
const adminRouter = require("./routes/admin");

app.use("/", siteRouter);
app.use("/", authRouter);
app.use("/", soruRouter);
app.use("/", profilRouter);
app.use("/admin", adminRouter);

// ===== 7. 404 =====
app.use((req, res) => {
    res.status(404).render("404", { title: "Sayfa bulunamadı" });
});

// ===== 8. HATA YAKALAYICI =====
app.use((err, req, res, next) => {
    if (err.code === "EBADCSRFTOKEN") {
        return res.status(403).render("403", {
            title: "Geçersiz istek",
            mesaj: "Güvenlik doğrulaması başarısız oldu. Sayfayı yenileyip tekrar dene."
        });
    }
    console.error(err);
    res.status(500).send("Sunucuda bir hata oluştu.");
});

// ===== SUNUCU =====
app.listen(3000, () => {
    console.log("🚀 Sunucu çalışıyor: http://localhost:3000");
});