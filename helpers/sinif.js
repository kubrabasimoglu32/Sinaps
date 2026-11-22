// Sınıflar veritabanında sayı olarak saklanır: 0 = Hazırlık, 1 = 1. sınıf ...
const SINIFLAR = [
    { deger: 0, ad: "Hazırlık" },
    { deger: 1, ad: "1. sınıf" },
    { deger: 2, ad: "2. sınıf" },
    { deger: 3, ad: "3. sınıf" },
    { deger: 4, ad: "4. sınıf" }
];

// Sayıdan ekranda gösterilecek adı verir: 0 → "Hazırlık"
const sinifAdi = (deger) => {
    const sinif = SINIFLAR.find(s => s.deger === deger);
    return sinif ? sinif.ad : "";
};

module.exports = { SINIFLAR, sinifAdi };