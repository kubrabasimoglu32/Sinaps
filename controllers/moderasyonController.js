const { sorular, cevaplar, dersler } = require("../data/dummy");
const puanVer = require("../helpers/puan");

// ===================================================
// YARDIMCI FONKSİYONLAR
// ===================================================
const dersBul = (id) => dersler.find(d => d.id === id);

// Listeden şarta uyan bütün elemanları siler (listenin kendisini değiştirir)
const listedenSil = (liste, sart) => {
    for (let i = liste.length - 1; i >= 0; i--) {
        if (sart(liste[i])) liste.splice(i, 1);
    }
};


// ===================================================
// SAYFALAR
// ===================================================

// ===== SORU LİSTESİ: GET /admin/sorular =====
exports.soruListesi = (req, res) => {
    const liste = [...sorular]
        .sort((a, b) => b.tarih.localeCompare(a.tarih))
        .map(s => ({
            ...s,
            ders: dersBul(s.dersId),
            cevapSayisi: cevaplar.filter(c => c.soruId === s.id).length
        }));

    res.render("admin/sorular", { title: "Sorular", aktif: "sorular", sorular: liste });
};

// ===== BİR SORUNUN CEVAPLARI: GET /admin/sorular/:id =====
exports.soruDetay = (req, res) => {
    const soru = sorular.find(s => s.id === Number(req.params.id));
    if (!soru) return res.redirect("/admin/sorular");

    res.render("admin/soru-cevaplar", {
        title: "Cevaplar",
        aktif: "sorular",
        soru: { ...soru, ders: dersBul(soru.dersId) },
        cevaplar: cevaplar.filter(c => c.soruId === soru.id)
    });
};

// ===== SORU SİL: POST /admin/sorular/:id/sil =====
exports.soruSil = (req, res) => {
    const id = Number(req.params.id);

    // Önce sorunun bütün cevaplarını, sonra sorunun kendisini sil
    listedenSil(cevaplar, c => c.soruId === id);
    listedenSil(sorular, s => s.id === id);

    res.redirect("/admin/sorular");
};

// ===== CEVAP SİL: POST /admin/cevaplar/:id/sil =====
exports.cevapSil = (req, res) => {
    const cevap = cevaplar.find(c => c.id === Number(req.params.id));
    if (!cevap) return res.redirect("/admin/sorular");

    // Silinen cevap en iyi cevapsa: soru çözülmemiş olur, verilen puan geri alınır
    const soru = sorular.find(s => s.id === cevap.soruId);
    if (soru && soru.enIyiCevapId === cevap.id) {
        soru.enIyiCevapId = null;
        puanVer(cevap.yazan, -15);
    }

    listedenSil(cevaplar, c => c.id === cevap.id);
    res.redirect(`/admin/sorular/${cevap.soruId}`);
};