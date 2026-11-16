const express = require("express");
const path = require("path");

const app = express();

// ===== AYARLAR =====
app.set("view engine", "ejs");

// ===== MIDDLEWARE =====
app.use("/static", express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));

// ===== ROUTES =====
const siteRouter = require("./routes/site");
app.use("/", siteRouter);

// ===== 404: Yukarıdaki hiçbir adrese uymayan istekler buraya düşer =====
app.use((req, res) => {
    res.status(404).render("404", { title: "Sayfa bulunamadı" });
});

// ===== SUNUCU =====
app.listen(3000, () => {
    console.log("🚀 Sunucu çalışıyor: http://localhost:3000");
});