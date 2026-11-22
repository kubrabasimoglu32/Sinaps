// Seviyeler BÜYÜKTEN KÜÇÜĞE sıralı olmalı
const seviyeler = [
    { min: 1000, ad: "Beyin" },
    { min: 400,  ad: "Korteks" },
    { min: 150,  ad: "Nöron" },
    { min: 50,   ad: "Akson" },
    { min: 0,    ad: "Dentrit" }
];

// Puanı verilen kişinin seviye adını döndürür
const seviyeBul = (puan) => seviyeler.find(s => puan >= s.min).ad;

// Seviyenin ayrıntılarını verir: şu anki seviye, sonraki seviye, kalan puan ve ilerleme yüzdesi
const seviyeDetay = (puan) => {
    const sira = seviyeler.findIndex(s => puan >= s.min);
    const mevcut = seviyeler[sira];
    const sonraki = sira > 0 ? seviyeler[sira - 1] : null;  // liste büyükten küçüğe sıralı

    if (!sonraki) {
        return { ad: mevcut.ad, sonraki: null, kalan: 0, yuzde: 100 };  // en üst seviye
    }

    const yuzde = Math.round((puan - mevcut.min) / (sonraki.min - mevcut.min) * 100);
    return { ad: mevcut.ad, sonraki: sonraki.ad, kalan: sonraki.min - puan, yuzde: yuzde };
};

module.exports = seviyeBul;
module.exports.seviyeDetay = seviyeDetay;