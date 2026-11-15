const express = require("express");
const path = require("path");

const app = express();

// Görünüm motoru
app.set("view engine", "ejs");

// Statik dosyalar (css, resimler)
app.use("/static", express.static(path.join(__dirname, "public")));

// Formdan gelen verileri okumak için
app.use(express.urlencoded({ extended: true }));

// Geçici ana sayfa
app.get("/", (req, res) => {
    res.render("index", { title: "NotKutusu" });
});

app.listen(3000, () => {
    console.log("🚀 Sunucu çalışıyor: http://localhost:3000");
});