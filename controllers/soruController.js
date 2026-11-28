const { Soru, Cevap, Kullanici } = require("../models/iliskiler");
const { dersler, notlar } = require("../data/dummy");
const slugUret = require("../helpers/slug");
const seviyeBul = require("../helpers/seviye");
const { puanVer } = require("../helpers/puan");

// ===================================================
// YARDIMCI FONKSİYONLAR
// ===================================================
const dersBul = (id) => dersler.find(d => d.id === id);
const bugun = () => new Date().toISOString().slice(0, 10);
const bulunamadi = (res) => res.status(404).render("404", { title: "Sayfa bulunamadı" });

// Kullanıcının adını ve seviyesini verir
const kisiOzeti = (k) => k
    ? { ad: k.ad, seviye: seviyeBul(k.puan) }
    : { ad: "Silinmiş kullanıcı", seviye: "" };


// ===================================================
// SAYFALAR
// ===================================================

// ===== SORU LİSTESİ: /sorular =====
exports.liste = async (req, res, next) => {
    try {
        const kayitlar = await Soru.findAll({
            include: [
                { model: Kullanici, attributes: ["ad"] },
                { model: Cevap, attributes: ["id"] }
            ],
            order: [["tarih", "DESC"]]
        });

        const liste = kayitlar.map(s => ({
            id: s.id,
            baslik: s.baslik,
            slug: s.slug,
            icerik: s.icerik,
            tarih: s.tarih,
            dersId: s.dersId,
            enIyiCevapId: s.enIyiCevapId,
            soran: s.Kullanici ? s.Kullanici.ad : "",
            ders: dersBul(s.dersId),
            cevapSayisi: s.Cevaps.length
        }));

        res.render("sorular", { title: "Soru-Cevap", sorular: liste });
    } catch (err) {
        next(err);
    }
};

// ===== SORU DETAY: /soru/:slug =====
exports.detay = async (req, res, next) => {
    try {
        const soru = await Soru.findOne({
            where: { slug: req.params.slug },
            include: [
                { model: Kullanici, attributes: ["ad", "puan"] },
                { model: Cevap, include: [{ model: Kullanici, attributes: ["ad", "puan"] }] }
            ]
        });
        if (!soru) return bulunamadi(res);

        const tumCevaplar = soru.Cevaps.map(c => ({
            id: c.id,
            soruId: c.soruId,
            yazan: c.Kullanici ? c.Kullanici.ad : "",
            tarih: c.tarih,
            icerik: c.icerik,
            kisi: kisiOzeti(c.Kullanici)
        }));

        // En iyi cevap en üstte, diğerleri altında
        const enIyi = tumCevaplar.filter(c => c.id === soru.enIyiCevapId);
        const digerleri = tumCevaplar.filter(c => c.id !== soru.enIyiCevapId);

        // Sayfaya bakan kişi soruyu soran kişi mi? ("En iyi seç" butonu için)
        const oturum = req.session.kullanici;
        const soranBenim = !!oturum && oturum.id === soru.kullaniciId;

        const ders = dersBul(soru.dersId);
        const dersSoruSayisi = await Soru.count({ where: { dersId: soru.dersId } });

        res.render("soru", {
            title: soru.baslik,
            soru: {
                id: soru.id,
                baslik: soru.baslik,
                slug: soru.slug,
                icerik: soru.icerik,
                tarih: soru.tarih,
                dersId: soru.dersId,
                enIyiCevapId: soru.enIyiCevapId,
                ders: ders
            },
            soran: kisiOzeti(soru.Kullanici),
            ders: ders,
            dersNotSayisi: ders ? notlar.filter(n => n.dersId === ders.id).length : 0,
            dersSoruSayisi: dersSoruSayisi,
            cevaplar: [...enIyi, ...digerleri],
            soranBenim: soranBenim
        });
    } catch (err) {
        next(err);
    }
};

// ===== SORU SOR FORMU: GET /soru-sor =====
exports.soruSorSayfasi = (req, res) => {
    res.render("soru-sor", {
        title: "Soru sor",
        dersler: dersler,
        hata: null,
        eski: { dersSlug: req.query.ders || "" }
    });
};

// ===== SORU KAYDET: POST /soru-sor =====
exports.soruSor = async (req, res, next) => {
    try {
        const dersSlug = req.body.ders || "";
        const baslik = (req.body.baslik || "").trim();
        const icerik = (req.body.icerik || "").trim();
        const ders = dersler.find(d => d.slug === dersSlug);

        if (!ders || !baslik || !icerik) {
            return res.render("soru-sor", {
                title: "Soru sor",
                dersler: dersler,
                hata: "Ders, başlık ve açıklama alanlarının hepsini doldur.",
                eski: { dersSlug, baslik, icerik }
            });
        }

        const mevcutSluglar = (await Soru.findAll({ attributes: ["slug"] })).map(s => s.slug);

        const yeniSoru = await Soru.create({
            baslik: baslik,
            slug: slugUret(baslik, mevcutSluglar),
            icerik: icerik,
            dersId: ders.id,
            tarih: bugun(),
            enIyiCevapId: null,
            kullaniciId: req.session.kullanici.id
        });

        await puanVer(req.session.kullanici.ad, 1, `Soru sordun: ${baslik}`);   // Ödül: soru sormak +1
        res.redirect(`/soru/${yeniSoru.slug}`);
    } catch (err) {
        next(err);
    }
};

// ===== CEVAP YAZ: POST /soru/:slug/cevap =====
exports.cevapYaz = async (req, res, next) => {
    try {
        const soru = await Soru.findOne({ where: { slug: req.params.slug } });
        if (!soru) return bulunamadi(res);

        const icerik = (req.body.icerik || "").trim();
        if (!icerik) return res.redirect(`/soru/${soru.slug}`);

        const yeniCevap = await Cevap.create({
            soruId: soru.id,
            icerik: icerik,
            tarih: bugun(),
            kullaniciId: req.session.kullanici.id
        });

        // Ödül: cevap yazmak +5 (kendi sorusunu cevaplayan puan almaz)
        if (req.session.kullanici.id !== soru.kullaniciId) {
            await puanVer(req.session.kullanici.ad, 5, `Cevap yazdın: ${soru.baslik}`);
        }

        res.redirect(`/soru/${soru.slug}#cevap-${yeniCevap.id}`);
    } catch (err) {
        next(err);
    }
};

// ===== EN İYİ CEVABI SEÇ: POST /soru/:slug/en-iyi/:cevapId =====
exports.enIyiSec = async (req, res, next) => {
    try {
        const soru = await Soru.findOne({ where: { slug: req.params.slug } });
        if (!soru) return bulunamadi(res);

        // Sadece soruyu soran kişi seçebilir
        if (req.session.kullanici.id !== soru.kullaniciId) {
            return res.status(403).render("403", {
                title: "Yetkin yok",
                mesaj: "En iyi cevabı sadece soruyu soran kişi seçebilir."
            });
        }

        const cevap = await Cevap.findOne({
            where: { id: Number(req.params.cevapId), soruId: soru.id },
            include: [{ model: Kullanici, attributes: ["ad"] }]
        });
        if (!cevap) return res.redirect(`/soru/${soru.slug}`);

        // Kendi cevabını seçemez, zaten seçili olanı tekrar seçmenin anlamı yok
        if (cevap.kullaniciId === soru.kullaniciId || soru.enIyiCevapId === cevap.id) {
            return res.redirect(`/soru/${soru.slug}`);
        }

        // Daha önce seçilen cevabın sahibinden 15 puanı geri al
        if (soru.enIyiCevapId) {
            const eskiCevap = await Cevap.findByPk(soru.enIyiCevapId, {
                include: [{ model: Kullanici, attributes: ["ad"] }]
            });
            if (eskiCevap && eskiCevap.Kullanici) {
                await puanVer(eskiCevap.Kullanici.ad, -15, "En iyi cevap seçimi değişti");
            }
        }

        soru.enIyiCevapId = cevap.id;
        await soru.save();
        await puanVer(cevap.Kullanici.ad, 15, `Cevabın en iyi seçildi: ${soru.baslik}`);   // Ödül: en iyi cevap +15

        res.redirect(`/soru/${soru.slug}`);
    } catch (err) {
        next(err);
    }
};