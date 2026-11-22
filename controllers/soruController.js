const { sorular, cevaplar, dersler, notlar, kullanicilar } = require("../data/dummy");
const slugUret = require("../helpers/slug");
const seviyeBul = require("../helpers/seviye");
const puanVer = require("../helpers/puan");

// ===================================================
// YARDIMCI FONKSİYONLAR
// ===================================================
const dersBul = (id) => dersler.find(d => d.id === id);
const bugun = () => new Date().toISOString().slice(0, 10);
const yeniId = (liste) => liste.length ? Math.max(...liste.map(x => x.id)) + 1 : 1;
const bulunamadi = (res) => res.status(404).render("404", { title: "Sayfa bulunamadı" });

// Kullanıcının adını ve seviyesini verir
const kisiBilgisi = (ad) => {
    const kisi = kullanicilar.find(k => k.ad === ad);
    return { ad: ad, seviye: kisi ? seviyeBul(kisi.puan) : "" };
};

// Soruya ders bilgisini ve cevap sayısını ekler
const soruOzeti = (soru) => ({
    ...soru,
    ders: dersBul(soru.dersId),
    cevapSayisi: cevaplar.filter(c => c.soruId === soru.id).length
});


// ===================================================
// SAYFALAR
// ===================================================

// ===== SORU LİSTESİ: /sorular =====
exports.liste = (req, res) => {
    const liste = [...sorular]
        .sort((a, b) => b.tarih.localeCompare(a.tarih))
        .map(soruOzeti);
    res.render("sorular", { title: "Soru-Cevap", sorular: liste });
};

// ===== SORU DETAY: /soru/:slug =====
exports.detay = (req, res) => {
    const soru = sorular.find(s => s.slug === req.params.slug);
    if (!soru) return bulunamadi(res);

    // Bu sorunun cevapları, yazanların seviyeleriyle
    const tumCevaplar = cevaplar
        .filter(c => c.soruId === soru.id)
        .map(c => ({ ...c, kisi: kisiBilgisi(c.yazan) }));

    // En iyi cevap en üstte, diğerleri altında
    const enIyi = tumCevaplar.filter(c => c.id === soru.enIyiCevapId);
    const digerleri = tumCevaplar.filter(c => c.id !== soru.enIyiCevapId);

    // Sayfaya bakan kişi soruyu soran kişi mi? ("En iyi seç" butonu için)
    const oturum = req.session.kullanici;
    const soranBenim = !!oturum && oturum.ad === soru.soran;

    const ders = dersBul(soru.dersId);

    res.render("soru", {
        title: soru.baslik,
        soru: soru,
        soran: kisiBilgisi(soru.soran),
        ders: ders,
        dersNotSayisi: notlar.filter(n => n.dersId === ders.id).length,
        dersSoruSayisi: sorular.filter(s => s.dersId === ders.id).length,
        cevaplar: [...enIyi, ...digerleri],
        soranBenim: soranBenim
    });
};

// ===== SORU SOR FORMU: GET /soru-sor =====
exports.soruSorSayfasi = (req, res) => {
    res.render("soru-sor", {
        title: "Soru sor",
        dersler: dersler,
        hata: null,
        // Ders sayfasından gelindiyse o ders seçili gelsin: /soru-sor?ders=veri-yapilari
        eski: { dersSlug: req.query.ders || "" }
    });
};

// ===== SORU KAYDET: POST /soru-sor =====
exports.soruSor = (req, res) => {
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

    const yeniSoru = {
        id: yeniId(sorular),
        dersId: ders.id,
        baslik: baslik,
        slug: slugUret(baslik, sorular.map(s => s.slug)),
        soran: req.session.kullanici.ad,
        tarih: bugun(),
        enIyiCevapId: null,
        icerik: icerik
    };
    sorular.push(yeniSoru);

    puanVer(yeniSoru.soran, 1, `Soru sordun: ${yeniSoru.baslik}`);  // Ödül: soru sormak +1
    res.redirect(`/soru/${yeniSoru.slug}`);
};

// ===== CEVAP YAZ: POST /soru/:slug/cevap =====
exports.cevapYaz = (req, res) => {
    const soru = sorular.find(s => s.slug === req.params.slug);
    if (!soru) return bulunamadi(res);

    const icerik = (req.body.icerik || "").trim();
    if (!icerik) return res.redirect(`/soru/${soru.slug}`);

    const yeniCevap = {
        id: yeniId(cevaplar),
        soruId: soru.id,
        yazan: req.session.kullanici.ad,
        tarih: bugun(),
        icerik: icerik
    };
    cevaplar.push(yeniCevap);

    // Ödül: cevap yazmak +5 (kendi sorusunu cevaplayan puan almaz)
    if (yeniCevap.yazan !== soru.soran) puanVer(yeniCevap.yazan, 5, `Cevap yazdın: ${soru.baslik}`);

    res.redirect(`/soru/${soru.slug}#cevap-${yeniCevap.id}`);
};

// ===== EN İYİ CEVABI SEÇ: POST /soru/:slug/en-iyi/:cevapId =====
exports.enIyiSec = (req, res) => {
    const soru = sorular.find(s => s.slug === req.params.slug);
    if (!soru) return bulunamadi(res);

    // Sadece soruyu soran kişi seçebilir
    if (req.session.kullanici.ad !== soru.soran) {
        return res.status(403).render("403", {
            title: "Yetkin yok",
            mesaj: "En iyi cevabı sadece soruyu soran kişi seçebilir."
        });
    }

    const cevap = cevaplar.find(c => c.id === Number(req.params.cevapId) && c.soruId === soru.id);
    if (!cevap) return res.redirect(`/soru/${soru.slug}`);

    // Kendi cevabını seçemez, zaten seçili olanı tekrar seçmenin anlamı yok
    if (cevap.yazan === soru.soran || soru.enIyiCevapId === cevap.id) {
        return res.redirect(`/soru/${soru.slug}`);
    }

    // Daha önce başka bir cevap seçildiyse onun puanını geri al
    if (soru.enIyiCevapId) {
        const eskiCevap = cevaplar.find(c => c.id === soru.enIyiCevapId);
        if (eskiCevap) puanVer(cevap.yazan, -15, "En iyi cevabın moderasyon tarafından kaldırıldı");
    }

    soru.enIyiCevapId = cevap.id;
    puanVer(cevap.yazan, 15, `Cevabın en iyi seçildi: ${soru.baslik}`);   // Ödül: en iyi cevap +15

    res.redirect(`/soru/${soru.slug}`);
};