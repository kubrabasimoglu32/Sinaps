const { kullanicilar, puanHareketleri } = require("../data/dummy");

// Kullanıcıya puan ekler (miktar eksi ise düşer) ve hareketi kaydeder.
// Puan sıfırın altına inmez.
const puanVer = (kullaniciAdi, miktar, aciklama) => {
    const kisi = kullanicilar.find(k => k.ad === kullaniciAdi);
    if (!kisi) return;

    const onceki = kisi.puan;
    kisi.puan = Math.max(0, kisi.puan + miktar);
    const gercekDegisim = kisi.puan - onceki;

    // Puan gerçekten değiştiyse geçmişe kaydet
    if (gercekDegisim !== 0) {
        puanHareketleri.push({
            id: puanHareketleri.length ? Math.max(...puanHareketleri.map(h => h.id)) + 1 : 1,
            kullaniciAd: kisi.ad,
            miktar: gercekDegisim,
            aciklama: aciklama || "Puan değişikliği",
            tarih: new Date().toISOString().slice(0, 10)
        });
    }
};

module.exports = puanVer;