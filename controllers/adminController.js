const { notlar, bekleyenNotlar, duyurular } = require("../data/dummy");
const { Ders } = require("../models/iliskiler");
const slugUret = require("../helpers/slug");
const { istatistikGetir } = require("../middleware/sayac");
const { puanVer } = require("../helpers/puan");

// ===== YARDIMCILAR =====
// Bekleyen notlara ders bilgisini ekler (dersler veritabanından)
const bekleyenListesi = async () => {
    const dersler = await Ders.findAll({ raw: true });
    return bekleyenNotlar.map(n => ({ ...n, ders: dersler.find(d => d.id === n.dersId) }));
};

// İşlemden sonra kullanıcıyı geldiği sayfaya geri gönderir
const geriDon = (req, res) => res.redirect(req.get("Referer") || "/admin/notlar");


// ===== GENEL BAKIŞ: /admin =====
exports.genelBakis = async (req, res, next) => {
    try {
        res.render("admin/panel", {
            title: "Genel bakış",
            aktif: "genel",
            istatistik: istatistikGetir(),
            bekleyenler: await bekleyenListesi()
        });
    } catch (err) {
        next(err);
    }
};

// ===== NOT ONAYLARI: /admin/notlar =====
exports.notOnaylari = async (req, res, next) => {
    try {
        res.render("admin/notlar", {
            title: "Not onayları",
            aktif: "notlar",
            bekleyenler: await bekleyenListesi()
        });
    } catch (err) {
        next(err);
    }
};

// ===== NOTU ONAYLA: POST /admin/notlar/:id/onayla =====
// ===== NOTU ONAYLA: POST /admin/notlar/:id/onayla =====
exports.notOnayla = async (req, res, next) => {
    try {
        const id = Number(req.params.id);
        const sira = bekleyenNotlar.findIndex(n => n.id === id);
        if (sira === -1) return geriDon(req, res);

        const [not] = bekleyenNotlar.splice(sira, 1);
        notlar.push(not);

        await puanVer(not.yukleyen, 20, `Notun onaylandı: ${not.baslik}`);
        geriDon(req, res);
    } catch (err) {
        next(err);
    }
};

// ===== NOTU REDDET: POST /admin/notlar/:id/reddet =====
exports.notReddet = async (req, res, next) => {
    try {
        const id = Number(req.params.id);
        const sira = bekleyenNotlar.findIndex(n => n.id === id);
        if (sira === -1) return geriDon(req, res);

        const [not] = bekleyenNotlar.splice(sira, 1);

        await puanVer(not.yukleyen, -5, `Notun reddedildi: ${not.baslik}`);
        geriDon(req, res);
    } catch (err) {
        next(err);
    }
};
// ===== DUYURU LİSTESİ: /admin/duyurular =====
exports.duyuruListesi = (req, res) => {
    const sirali = [...duyurular].sort((a, b) => b.tarih.localeCompare(a.tarih));
    res.render("admin/duyurular", { title: "Duyurular", aktif: "duyurular", duyurular: sirali });
};

// ===== DUYURU EKLEME FORMU: GET /admin/duyurular/yeni =====
exports.duyuruEkleSayfasi = (req, res) => {
    res.render("admin/duyuru-form", {
        title: "Yeni duyuru",
        aktif: "duyurular",
        duzenleme: false,
        action: "/admin/duyurular/yeni",
        hata: null,
        eski: {}
    });
};

// ===== DUYURU KAYDET: POST /admin/duyurular/yeni =====
exports.duyuruEkle = (req, res) => {
    const baslik = (req.body.baslik || "").trim();
    const icerik = (req.body.icerik || "").trim();

    if (!baslik || !icerik) {
        return res.render("admin/duyuru-form", {
            title: "Yeni duyuru", aktif: "duyurular",
            duzenleme: false, action: "/admin/duyurular/yeni",
            hata: "Başlık ve içerik boş bırakılamaz.",
            eski: { baslik, icerik }
        });
    }

    const yeniDuyuru = {
        id: duyurular.length ? Math.max(...duyurular.map(d => d.id)) + 1 : 1,
        baslik: baslik,
        slug: slugUret(baslik, duyurular.map(d => d.slug)),    // ← SLUGIFY burada
        tarih: new Date().toISOString().slice(0, 10),            // bugün: "2026-11-16"
        yazar: req.session.kullanici.ad,
        icerik: icerik
    };
    duyurular.push(yeniDuyuru);

    res.redirect("/admin/duyurular");
};

// ===== DUYURU SİL: POST /admin/duyurular/:id/sil =====
exports.duyuruSil = (req, res) => {
    const sira = duyurular.findIndex(d => d.id === Number(req.params.id));
    if (sira !== -1) duyurular.splice(sira, 1);
    res.redirect("/admin/duyurular");
};

// ===== DUYURU DÜZENLEME FORMU: GET /admin/duyurular/:id/duzenle =====
exports.duyuruDuzenleSayfasi = (req, res) => {
    const duyuru = duyurular.find(d => d.id === Number(req.params.id));
    if (!duyuru) return res.redirect("/admin/duyurular");

    res.render("admin/duyuru-form", {
        title: "Duyuruyu düzenle",
        aktif: "duyurular",
        duzenleme: true,
        action: `/admin/duyurular/${duyuru.id}/duzenle`,
        hata: null,
        eski: duyuru   // form, mevcut başlık ve içerikle dolu açılsın
    });
};

// ===== DUYURU GÜNCELLE: POST /admin/duyurular/:id/duzenle =====
exports.duyuruGuncelle = (req, res) => {
    const duyuru = duyurular.find(d => d.id === Number(req.params.id));
    if (!duyuru) return res.redirect("/admin/duyurular");

    const baslik = (req.body.baslik || "").trim();
    const icerik = (req.body.icerik || "").trim();

    if (!baslik || !icerik) {
        return res.render("admin/duyuru-form", {
            title: "Duyuruyu düzenle", aktif: "duyurular",
            duzenleme: true, action: `/admin/duyurular/${duyuru.id}/duzenle`,
            hata: "Başlık ve içerik boş bırakılamaz.",
            eski: { baslik, icerik }
        });
    }

    // Başlık değiştiyse slug'ı yeniden üret
    if (baslik !== duyuru.baslik) {
        // Bu duyurunun kendi slug'ı hariç diğer slug'lar
        const digerSluglar = duyurular.filter(d => d.id !== duyuru.id).map(d => d.slug);
        duyuru.slug = slugUret(baslik, digerSluglar);
    }

    duyuru.baslik = baslik;
    duyuru.icerik = icerik;

    res.redirect("/admin/duyurular");
};