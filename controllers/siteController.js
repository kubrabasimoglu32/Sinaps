const { bolumler, dersler, notlar, duyurular, kullanicilar, sorular } = require("../data/dummy");

// Yardımcı fonksiyon: id'si verilen dersi bulur
const dersBul = (id) => dersler.find(d => d.id === id);

// ===== ANA SAYFA =====
exports.anasayfa = (req, res) => {

    const bolumListesi = bolumler.map(bolum => {
        const bolumunDersleri = dersler.filter(d => d.bolumId === bolum.id);
        const dersIdleri = bolumunDersleri.map(d => d.id);
        const notSayisi = notlar.filter(n => dersIdleri.includes(n.dersId)).length;
        return { ...bolum, dersSayisi: bolumunDersleri.length, notSayisi: notSayisi };
    });

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