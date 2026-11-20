const slugify = require("slugify");

// Metinden slug üretir. Aynı slug varsa sonuna -2, -3... ekler.
// mevcutSluglar: daha önce kullanılmış slug'ların listesi
const slugUret = (metin, mevcutSluglar = []) => {
    const temel = slugify(metin, {
        lower: true,   // küçük harfe çevir
        strict: true   // ! ? : ' gibi işaretleri at
    });

    let slug = temel;
    let sayac = 2;
    while (mevcutSluglar.includes(slug)) {
        slug = `${temel}-${sayac}`;
        sayac++;
    }
    return slug;
};

module.exports = slugUret;