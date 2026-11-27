const fs = require("fs");
const path = require("path");
const { afisler } = require("../data/dummy");
const { turTemizle, turleriListele } = require("../helpers/afisTur");

const MESAJLAR = {
    eklendi:     { tur: "success", metin: "Afiş eklendi." },
    guncellendi: { tur: "success", metin: "Afiş güncellendi." },
    silindi:     { tur: "success", metin: "Afiş silindi." },
    eksik:       { tur: "danger",  metin: "Başlık, tür ve tarih zorunlu." },
    resimYok:    { tur: "danger",  metin: "Afiş için bir resim seç." },
    tur:         { tur: "danger",  metin: "Sadece JPG veya PNG yükleyebilirsin." },
    boyut:       { tur: "danger",  metin: "Resim en fazla 2 MB olabilir." },
    hata:        { tur: "danger",  metin: "Resim yüklenemedi, tekrar dene." },
    bulunamadi:  { tur: "danger",  metin: "Afiş bulunamadı." }
};

// Multer'ın hatasını kısa bir anahtara çevirir
const yuklemeDurumu = (req) => {
    if (req.yuklemeHatasi === "tur") return "tur";
    if (req.yuklemeHatasi === "boyut") return "boyut";
    if (req.yuklemeHatasi) return "hata";
    return null;
};

const resimAdresi = (dosya) => `/static/uploads/galeri/${dosya.filename}`;

// "/static/uploads/galeri/123.jpg" dosyasını diskten siler
const dosyaSil = (adres) => {
    if (!adres) return;
    fs.unlink(path.join(__dirname, "..", "public", adres.replace("/static/", "")), () => {});
};

// GET /admin/galeri
exports.liste = (req, res) => {
    const liste = [...afisler].sort((a, b) => b.tarih.localeCompare(a.tarih));
    res.render("admin/galeri", {
        title: "Galeri yönetimi",
        aktif: "galeri",
        afisler: liste,
        mesaj: MESAJLAR[req.query.durum] || null
    });
};

// GET /admin/galeri/ekle
exports.yeniFormu = (req, res) => {
    res.render("admin/afis-form", {
        title: "Yeni afiş",
        aktif: "galeri",
        afis: null,
        turler: turleriListele(afisler),
        action: "/admin/galeri/ekle",
        mesaj: MESAJLAR[req.query.durum] || null
    });
};

// POST /admin/galeri/ekle
exports.ekle = (req, res) => {
    const hata = yuklemeDurumu(req);
    if (hata) return res.redirect(`/admin/galeri/ekle?durum=${hata}`);
    if (!req.file) return res.redirect("/admin/galeri/ekle?durum=resimYok");

    const baslik = (req.body.baslik || "").trim();
    const tur = turTemizle(req.body.tur);
    const tarih = req.body.tarih;

    if (!baslik || !tur || !tarih) {
        dosyaSil(resimAdresi(req.file));   // kaydetmediğimiz resmi diskten temizle
        return res.redirect("/admin/galeri/ekle?durum=eksik");
    }

    afisler.push({
        id: Math.max(0, ...afisler.map(a => a.id)) + 1,
        baslik: baslik,
        tur: tur,
        tarih: tarih,
        aciklama: (req.body.aciklama || "").trim(),
        dosya: resimAdresi(req.file),
        ekleyen: req.session.kullanici.ad
    });
    res.redirect("/admin/galeri?durum=eklendi");
};

// GET /admin/galeri/:id/duzenle
exports.duzenleFormu = (req, res) => {
    const afis = afisler.find(a => a.id === Number(req.params.id));
    if (!afis) return res.redirect("/admin/galeri?durum=bulunamadi");

    res.render("admin/afis-form", {
        title: "Afişi düzenle",
        aktif: "galeri",
        afis: afis,
        turler: turleriListele(afisler),
        action: `/admin/galeri/${afis.id}/duzenle`,
        mesaj: MESAJLAR[req.query.durum] || null
    });
};

// POST /admin/galeri/:id/duzenle
exports.guncelle = (req, res) => {
    const id = Number(req.params.id);
    const afis = afisler.find(a => a.id === id);

    if (!afis) {
        if (req.file) dosyaSil(resimAdresi(req.file));
        return res.redirect("/admin/galeri?durum=bulunamadi");
    }

    const hata = yuklemeDurumu(req);
    const baslik = (req.body.baslik || "").trim();
    const tur = turTemizle(req.body.tur);
    const tarih = req.body.tarih;

    if (hata || !baslik || !tur || !tarih) {
        if (req.file) dosyaSil(resimAdresi(req.file));
        return res.redirect(`/admin/galeri/${id}/duzenle?durum=${hata || "eksik"}`);
    }

    if (req.file) {
        dosyaSil(afis.dosya);                 // yeni resim geldiyse eskisini sil
        afis.dosya = resimAdresi(req.file);
    }
    afis.baslik = baslik;
    afis.tur = tur;
    afis.tarih = tarih;
    afis.aciklama = (req.body.aciklama || "").trim();

    res.redirect("/admin/galeri?durum=guncellendi");
};

// POST /admin/galeri/:id/sil (sadece admin, route dosyasında korunuyor)
exports.sil = (req, res) => {
    const index = afisler.findIndex(a => a.id === Number(req.params.id));
    if (index === -1) return res.redirect("/admin/galeri?durum=bulunamadi");

    dosyaSil(afisler[index].dosya);
    afisler.splice(index, 1);
    res.redirect("/admin/galeri?durum=silindi");
};