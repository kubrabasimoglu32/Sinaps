// Türü düzenler: boşlukları siler, ilk harfi büyütür, kalanını küçültür
const turTemizle = (metin) => {
    const t = (metin || "").trim().toLocaleLowerCase("tr-TR");
    return t.charAt(0).toLocaleUpperCase("tr-TR") + t.slice(1);
};

// Afişlerdeki türleri tekrarsız ve alfabetik olarak verir
const turleriListele = (afisler) =>
    [...new Set(afisler.map(a => a.tur))].sort((a, b) => a.localeCompare(b, "tr"));

module.exports = { turTemizle, turleriListele };