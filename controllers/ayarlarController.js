const bcrypt = require("bcryptjs");
const fs = require("fs");
const path = require("path");
const { kullanicilar, bolumler } = require("../data/dummy");
const { SINIFLAR } = require("../helpers/sinif");

const MESAJLAR = {
    bilgi:          { tur: "success", metin: "Bölüm ve sınıf bilgilerin güncellendi." },
    bilgiHata:      { tur: "danger",  metin: "Geçerli bir bölüm ve sınıf seç." },
    sifre:          { tur: "success", metin: "Şifren değiştirildi." },
    sifreYanlis:    { tur: "danger",  metin: "Mevcut şifren yanlış." },
    sifreKisa:      { tur: "danger",  metin: "Yeni şifre en az 6 karakter olmalı." },
    sifreUyusmuyor: { tur: "danger",  metin: "Yeni şifreler birbiriyle uyuşmuyor." },
    sifreAyni:      { tur: "danger",  metin: "Yeni şifre eskisiyle aynı olamaz." },
    foto:           { tur: "success", metin: "Profil fotoğrafın güncellendi." },
    fotoKaldirildi: { tur: "success", metin: "Profil fotoğrafın kaldırıldı." },
    fotoYok:        { tur: "danger",  metin: "Önce bir fotoğraf seç." },
    fotoTur:        { tur: "danger",  metin: "Sadece JPG veya PNG yükleyebilirsin." },
    fotoBoyut:      { tur: "danger",  metin: "Fotoğraf en fazla 2 MB olabilir." },
    fotoHata:       { tur: "danger",  metin: "Fotoğraf yüklenemedi, tekrar dene." }
};

const geriDon = (res, durum) => res.redirect(`/profil/ayarlar?durum=${durum}`);

const benimKaydim = (req) => kullanicilar.find(k => k.id === req.session.kullanici.id);

const dosyaSil = (adres) => {
    if (!adres) return;
    const dosyaYolu = path.join(__dirname, "..", "public", adres.replace("/static/", ""));
    fs.unlink(dosyaYolu, () => {});
};

// GET /profil/ayarlar
exports.sayfa = (req, res) => {
    const ben = benimKaydim(req);
    res.render("ayarlar", {
        title: "Ayarlar",
        ben: { ad: ben.ad, email: ben.email, bolumId: ben.bolumId, sinif: ben.sinif, profilFoto: ben.profilFoto || null },
        bolumler: bolumler,
        siniflar: SINIFLAR,
        mesaj: MESAJLAR[req.query.durum] || null
    });
};

// POST /profil/ayarlar/bilgiler
exports.bilgiGuncelle = (req, res) => {
    const bolumId = Number(req.body.bolum);
    const sinif = Number(req.body.sinif);

    if (!bolumler.some(b => b.id === bolumId) || !SINIFLAR.some(s => s.deger === sinif)) {
        return geriDon(res, "bilgiHata");
    }

    const ben = benimKaydim(req);
    ben.bolumId = bolumId;
    ben.sinif = sinif;
    geriDon(res, "bilgi");
};

// POST /profil/ayarlar/sifre
exports.sifreDegistir = async (req, res) => {
    const mevcut = req.body.mevcutSifre || "";
    const yeni = req.body.yeniSifre || "";
    const yeniTekrar = req.body.yeniSifreTekrar || "";
    const ben = benimKaydim(req);

    if (!(await bcrypt.compare(mevcut, ben.sifre))) return geriDon(res, "sifreYanlis");
    if (yeni.length < 6) return geriDon(res, "sifreKisa");
    if (yeni !== yeniTekrar) return geriDon(res, "sifreUyusmuyor");
    if (await bcrypt.compare(yeni, ben.sifre)) return geriDon(res, "sifreAyni");

    ben.sifre = await bcrypt.hash(yeni, 10);
    geriDon(res, "sifre");
};

// POST /profil/ayarlar/foto  (önce resimYukleyici çalışır)
exports.fotoYukle = (req, res) => {
    if (req.yuklemeHatasi === "tur") return geriDon(res, "fotoTur");
    if (req.yuklemeHatasi === "boyut") return geriDon(res, "fotoBoyut");
    if (req.yuklemeHatasi) return geriDon(res, "fotoHata");
    if (!req.file) return geriDon(res, "fotoYok");

    const ben = benimKaydim(req);
    dosyaSil(ben.profilFoto);
    ben.profilFoto = `/static/uploads/profil/${req.file.filename}`;
    geriDon(res, "foto");
};

// POST /profil/ayarlar/foto/kaldir
exports.fotoKaldir = (req, res) => {
    const ben = benimKaydim(req);
    dosyaSil(ben.profilFoto);
    ben.profilFoto = null;
    geriDon(res, "fotoKaldirildi");
};