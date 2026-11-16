const { notlar, bekleyenNotlar, dersler, kullanicilar } = require("../data/dummy");

// ===== YARDIMCILAR =====
const dersBul = (id) => dersler.find(d => d.id === id);

// Bekleyen notlara ders bilgisini ekler
const bekleyenListesi = () => bekleyenNotlar.map(n => ({ ...n, ders: dersBul(n.dersId) }));

// İşlemden sonra kullanıcıyı geldiği sayfaya geri gönderir
const geriDon = (req, res) => res.redirect(req.get("Referer") || "/admin/notlar");


// ===== GENEL BAKIŞ: /admin =====
exports.genelBakis = (req, res) => {
    // GEÇİCİ: Ziyaretçi sayacını yapınca gerçek sayılar gelecek
    const istatistik = {
        bugun: 124,
        toplam: 8430,
        cevrimici: 12,
        son7gun: [52, 68, 45, 90, 77, 110, 124]
    };

    res.render("admin/panel", {
        title: "Genel bakış",
        aktif: "genel",
        istatistik: istatistik,
        bekleyenler: bekleyenListesi()
    });
};

// ===== NOT ONAYLARI: /admin/notlar =====
exports.notOnaylari = (req, res) => {
    res.render("admin/notlar", {
        title: "Not onayları",
        aktif: "notlar",
        bekleyenler: bekleyenListesi()
    });
};

// ===== NOTU ONAYLA: POST /admin/notlar/:id/onayla =====
exports.notOnayla = (req, res) => {
    const id = Number(req.params.id);
    const sira = bekleyenNotlar.findIndex(n => n.id === id);
    if (sira === -1) return geriDon(req, res);

    // 1) Notu bekleyenlerden çıkar, yayındaki notlara ekle
    const [not] = bekleyenNotlar.splice(sira, 1);
    notlar.push(not);

    // 2) Ödül: yükleyene +20 puan
    const kisi = kullanicilar.find(k => k.ad === not.yukleyen);
    if (kisi) kisi.puan += 20;

    geriDon(req, res);
};

// ===== NOTU REDDET: POST /admin/notlar/:id/reddet =====
exports.notReddet = (req, res) => {
    const id = Number(req.params.id);
    const sira = bekleyenNotlar.findIndex(n => n.id === id);
    if (sira === -1) return geriDon(req, res);

    const [not] = bekleyenNotlar.splice(sira, 1);

    // Ceza: yükleyenden -5 puan (puan sıfırın altına düşmesin)
    const kisi = kullanicilar.find(k => k.ad === not.yukleyen);
    if (kisi) kisi.puan = Math.max(0, kisi.puan - 5);

    geriDon(req, res);
};