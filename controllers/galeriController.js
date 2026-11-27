const slugify = require("slugify");
const { afisler } = require("../data/dummy");
const { turleriListele } = require("../helpers/afisTur");

// "Tiyatro" → "tiyatro" (adreste kullanmak için)
const tureGoreSlug = (tur) => slugify(tur, { lower: true, strict: true });

// GET /galeri?tur=tiyatro
exports.liste = (req, res) => {
    const turler = turleriListele(afisler);
    const secili = turler.find(t => tureGoreSlug(t) === req.query.tur) || null;

    const liste = afisler
        .filter(a => !secili || a.tur === secili)
        .sort((a, b) => a.tarih.localeCompare(b.tarih));

    res.render("galeri", {
        title: "Galeri",
        afisler: liste,
        turler: turler,
        secili: secili,
        tureGoreSlug: tureGoreSlug
    });
};