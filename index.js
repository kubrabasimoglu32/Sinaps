const express = require("express");
const path = require("path");

const app = express();

// ===== AYARLAR =====
app.set("view engine", "ejs");

// ===== MIDDLEWARE =====
app.use("/static", express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
// ===== OTURUM (SESSION) =====
const session = require("express-session");
app.use(session({
    secret: "sinaps-gizli-anahtar-degistir",  // çerezleri imzalamak için kullanılır
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 24 } // 1 gün (milisaniye cinsinden)
}));

// Oturumdaki kullanıcıyı bütün sayfalara gönder
app.use(require("./middleware/locals"));

// ===== ROUTES =====
// ===== ROUTES =====
const siteRouter = require("./routes/site");
const authRouter = require("./routes/auth");
app.use("/", siteRouter);
app.use("/", authRouter);

// ===== 404: Yukarıdaki hiçbir adrese uymayan istekler buraya düşer =====
app.use((req, res) => {
    res.status(404).render("404", { title: "Sayfa bulunamadı" });
});

// ===== SUNUCU =====
app.listen(3000, () => {
    console.log("🚀 Sunucu çalışıyor: http://localhost:3000");
});
