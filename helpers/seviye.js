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

module.exports = seviyeBul;