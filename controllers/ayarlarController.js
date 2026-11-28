const bcrypt = require("bcryptjs");
const fs = require("fs");
const path = require("path");
const { Kullanici, Bolum } = require("../models/iliskiler");
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

// "/static/uploads/profil/123.jpg" dosyasını diskten siler
const dosyaSil = (adres) => {
    if (!adres) return;
    const dosyaYolu = path.join(__dirname, "..", "public", adres.replace("/static/", ""));
    fs.unlink(dosyaYolu, () => {});   // dosya zaten yoksa hatayı görmezden gel
};

// GET /profil/ayarlar
exports.sayfa = async (req, res, next) => {
    try {
        const ben = await Kullanici.findByPk(req.session.kullanici.id);
        res.render("ayarlar", {
            title: "Ayarlar",
            ben: {
                ad: ben.ad,
                email: ben.email,
                bolumId: ben.bolumId,
                sinif: ben.sinif,
                profilFoto: ben.profilFoto || null
            },
            bolumler: await Bolum.findAll({ order: [["ad", "ASC"]], raw: true }),
            siniflar: SINIFLAR,
            mesaj: MESAJLAR[req.query.durum] || null
        });
    } catch (err) {
        next(err);
    }
};

// POST /profil/ayarlar/bilgiler
exports.bilgiGuncelle = async (req, res, next) => {
    try {
        const bolumId = Number(req.body.bolum);
        const sinif = Number(req.body.sinif);

        if (!(await Bolum.findByPk(bolumId)) || !SINIFLAR.some(s => s.deger === sinif)) {
            return geriDon(res, "bilgiHata");
        }

        await Kullanici.update(
            { bolumId: bolumId, sinif: sinif },
            { where: { id: req.session.kullanici.id } }
        );
        geriDon(res, "bilgi");
    } catch (err) {
        next(err);
    }
};

// POST /profil/ayarlar/sifre
exports.sifreDegistir = async (req, res, next) => {
    try {
        const mevcut = req.body.mevcutSifre || "";
        const yeni = req.body.yeniSifre || "";
        const yeniTekrar = req.body.yeniSifreTekrar || "";
        const ben = await Kullanici.findByPk(req.session.kullanici.id);

        if (!(await bcrypt.compare(mevcut, ben.sifre))) return geriDon(res, "sifreYanlis");
        if (yeni.length < 6) return geriDon(res, "sifreKisa");
        if (yeni !== yeniTekrar) return geriDon(res, "sifreUyusmuyor");
        if (await bcrypt.compare(yeni, ben.sifre)) return geriDon(res, "sifreAyni");

        ben.sifre = await bcrypt.hash(yeni, 10);
        await ben.save();
        geriDon(res, "sifre");
    } catch (err) {
        next(err);
    }
};

// POST /profil/ayarlar/foto  (önce resimYukleyici çalışır)
exports.fotoYukle = async (req, res, next) => {
    try {
        if (req.yuklemeHatasi === "tur") return geriDon(res, "fotoTur");
        if (req.yuklemeHatasi === "boyut") return geriDon(res, "fotoBoyut");
        if (req.yuklemeHatasi) return geriDon(res, "fotoHata");
        if (!req.file) return geriDon(res, "fotoYok");

        const ben = await Kullanici.findByPk(req.session.kullanici.id);
        dosyaSil(ben.profilFoto);   // eski fotoğrafı diskten sil
        ben.profilFoto = `/static/uploads/profil/${req.file.filename}`;
        await ben.save();
        geriDon(res, "foto");
    } catch (err) {
        next(err);
    }
};

// POST /profil/ayarlar/foto/kaldir
exports.fotoKaldir = async (req, res, next) => {
    try {
        const ben = await Kullanici.findByPk(req.session.kullanici.id);
        dosyaSil(ben.profilFoto);
        ben.profilFoto = null;
        await ben.save();
        geriDon(res, "fotoKaldirildi");
    } catch (err) {
        next(err);
    }
};