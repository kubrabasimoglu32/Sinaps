const { bolumler, dersler, notlar, duyurular, kullanicilar, sorular } = require("../data/dummy");

// ===================================================
// YARDIMCI FONKSİYONLAR (her zaman en üstte dursun)
// ===================================================

// id'si verilen dersi bulur
const dersBul = (id) => dersler.find(d => d.id === id);

// Bir bölümün ders ve not sayısını hesaplar
const bolumOzeti = (bolum) => {
    const bolumunDersleri = dersler.filter(d => d.bolumId === bolum.id);
    const dersIdleri = bolumunDersleri.map(d => d.id);
    const notSayisi = notlar.filter(n => dersIdleri.includes(n.dersId)).length;
    return { ...bolum, dersSayisi: bolumunDersleri.length, notSayisi: notSayisi };
};

// 404 sayfasını gösterir
const bulunamadi = (res) => res.status(404).render("404", { title: "Sayfa bulunamadı" });


// ===================================================
// SAYFALAR
// ===================================================

// ===== ANA SAYFA =====
exports.anasayfa = (req, res) => {
    const bolumListesi = bolumler.map(bolumOzeti);

    const notListesi = notlar.map(not => ({ ...not, ders: dersBul(not.dersId) }));

    const liderler = [...kullanicilar]
        .sort((a, b) => b.puan - a.puan)
        .slice(0, 5);

    const soruListesi = sorular.map(soru => ({ ...soru, ders: dersBul(soru.dersId) }));

    res.render("index", {
        title: "Ana Sayfa",
        bolumler: bolumListesi,
        notlar: notListesi,
        liderler: liderler,
        duyurular: duyurular,
        sorular: soruListesi
    });
};

// ===== BÖLÜMLER LİSTESİ =====
exports.bolumler = (req, res) => {
    res.render("bolumler", {
        title: "Bölümler",
        bolumler: bolumler.map(bolumOzeti)
    });
};

// ===== BÖLÜM DETAY: /bolum/:slug =====
exports.bolumDetay = (req, res) => {
    const bolum = bolumler.find(b => b.slug === req.params.slug);
    if (!bolum) return bulunamadi(res);

    const dersListesi = dersler
        .filter(d => d.bolumId === bolum.id)
        .map(ders => ({
            ...ders,
            notSayisi: notlar.filter(n => n.dersId === ders.id).length,
            soruSayisi: sorular.filter(s => s.dersId === ders.id).length
        }));

    res.render("bolum", { title: bolum.ad, bolum: bolum, dersler: dersListesi });
};

// ===== DERS DETAY: /ders/:slug =====
exports.dersDetay = (req, res) => {
    const ders = dersler.find(d => d.slug === req.params.slug);
    if (!ders) return bulunamadi(res);

    const bolum = bolumler.find(b => b.id === ders.bolumId);
    const dersNotlari = notlar.filter(n => n.dersId === ders.id);
    const dersSorulari = sorular.filter(s => s.dersId === ders.id);

    res.render("ders", {
        title: ders.ad,
        ders: ders,
        bolum: bolum,
        notlar: dersNotlari,
        sorular: dersSorulari
    });
};