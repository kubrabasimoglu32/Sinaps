const { bolumler, dersler, notlar, duyurular, sorular } = require("../data/dummy");

// Sabit sayfalar (xml: false olanlar arama motorlarına bildirilmez)
// Galeri modülü eklenince buraya da eklenecek
const sabitSayfalar = [
    { ad: "Ana Sayfa",   yol: "/" },
    { ad: "Bölümler",    yol: "/bolumler" },
    { ad: "Duyurular",   yol: "/duyurular" },
    { ad: "Soru-Cevap",  yol: "/sorular" },
    { ad: "Giriş yap",   yol: "/giris", xml: false },
    { ad: "Kayıt ol",    yol: "/kayit", xml: false }
];

// Sitenin tam adresini verir: http://localhost:3000 ya da deploy sonrası gerçek adres
const siteAdresi = (req) => `${req.protocol}://${req.get("host")}`;


// ===== SİTE HARİTASI SAYFASI: /site-haritasi =====
exports.sayfa = (req, res) => {
    // Bölüm → ders → not ağacı
    const agac = bolumler.map(bolum => ({
        ...bolum,
        dersler: dersler
            .filter(d => d.bolumId === bolum.id)
            .map(ders => ({ ...ders, notlar: notlar.filter(n => n.dersId === ders.id) }))
    }));

    res.render("site-haritasi", {
        title: "Site haritası",
        sabitSayfalar: sabitSayfalar,
        agac: agac,
        duyurular: duyurular,
        sorular: sorular
    });
};

// ===== ARAMA MOTORLARI İÇİN: /sitemap.xml =====
exports.xml = (req, res) => {
    const site = siteAdresi(req);

    // Sitedeki bütün herkese açık adresler
    const adresler = [
        ...sabitSayfalar.filter(s => s.xml !== false).map(s => ({ yol: s.yol })),
        ...bolumler.map(b => ({ yol: `/bolum/${b.slug}` })),
        ...dersler.map(d => ({ yol: `/ders/${d.slug}` })),
        ...notlar.map(n => ({ yol: `/not/${n.slug}`, tarih: n.tarih })),
        ...duyurular.map(d => ({ yol: `/duyuru/${d.slug}`, tarih: d.tarih })),
        ...sorular.map(s => ({ yol: `/soru/${s.slug}`, tarih: s.tarih }))
    ];

    // Her adres için bir <url> bloğu üret
    const satirlar = adresler.map(a => {
        const tarihSatiri = a.tarih ? `\n    <lastmod>${a.tarih}</lastmod>` : "";
        return `  <url>\n    <loc>${site}${a.yol}</loc>${tarihSatiri}\n  </url>`;
    });

    const xml =
        `<?xml version="1.0" encoding="UTF-8"?>\n` +
        `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
        satirlar.join("\n") +
        `\n</urlset>`;

    res.type("application/xml").send(xml);
};

// ===== ARAMA MOTORLARINA KURALLAR: /robots.txt =====
exports.robots = (req, res) => {
    const metin =
        "User-agent: *\n" +
        "Disallow: /admin\n" +
        `Sitemap: ${siteAdresi(req)}/sitemap.xml\n`;

    res.type("text/plain").send(metin);
};