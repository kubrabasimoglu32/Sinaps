const { kullanicilar } = require("../data/dummy");

// Kullanıcıya puan ekler (miktar eksi ise düşer). Puan sıfırın altına inmez.
const puanVer = (kullaniciAdi, miktar) => {
    const kisi = kullanicilar.find(k => k.ad === kullaniciAdi);
    if (kisi) kisi.puan = Math.max(0, kisi.puan + miktar);
};

module.exports = puanVer;