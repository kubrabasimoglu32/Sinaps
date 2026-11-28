const { notlar, duyurular } = require("../data/dummy");
const { Kullanici, Soru, Bolum, Ders } = require("../models/iliskiler");
const { soruOzetleri } = require("../helpers/soruListesi");
const seviyeBul = require("../helpers/seviye");

// ===================================================
// YARDIMCI FONKSİYONLAR (her zaman en üstte dursun)
// ===================================================

// Bölümleri ve dersleri veritabanından düz nesne olarak getirir ({ id, ad, slug, ... })
const bolumleriGetir = () => Bolum.findAll({ order: [["id", "ASC"]], raw: true });
const dersleriGetir = () => Ders.findAll({ order: [["id", "ASC"]], raw: true });

// Verilen listeden id'si tutan dersi bulur
const dersBul = (dersler, id) => dersler.find(d => d.id === id);

// Bir bölümün ders ve not sayısını hesaplar
const bolumOzeti = (bolum, dersler) => {
    const bolumunDersleri = dersler.filter(d => d.bolumId === bolum.id);
    const dersIdleri = bolumunDersleri.map(d => d.id);
    const notSayisi = notlar.filter(n => dersIdleri.includes(n.dersId)).length;
    return { ...bolum, dersSayisi: bolumunDersleri.length, notSayisi: notSayisi };
};

// 404 sayfasını gösterir
const bulunamadi = (res) => res.status(404).render("404", { title: "Sayfa bulunamadı" });

// Duyuruları yeniden eskiye sıralar
const yeniDuyurular = () => [...duyurular].sort((a, b) => b.tarih.localeCompare(a.tarih));

// ===================================================
// SAYFALAR
// ===================================================

// ===== ANA SAYFA =====
exports.anasayfa = async (req, res, next) => {
    try {
        const bolumler = await bolumleriGetir();
        const dersler = await dersleriGetir();
        const notListesi = notlar.map(not => ({ ...not, ders: dersBul(dersler, not.dersId) }));

        // Liderler ve sorular artık veritabanından
        const liderler = await Kullanici.findAll({
            attributes: ["ad", "puan"],
            order: [["puan", "DESC"]],
            limit: 5
        });

        res.render("index", {
            title: "Ana Sayfa",
            bolumler: bolumler.map(b => bolumOzeti(b, dersler)),
            notlar: notListesi,
            liderler: liderler,
            duyurular: yeniDuyurular().slice(0, 3),   // en yeni 3 duyuru
            sorular: await soruOzetleri({}, 5)        // en yeni 5 soru
        });
    } catch (err) {
        next(err);
    }
};

// ===== BÖLÜMLER LİSTESİ =====
exports.bolumler = async (req, res, next) => {
    try {
        const bolumler = await bolumleriGetir();
        const dersler = await dersleriGetir();
        res.render("bolumler", {
            title: "Bölümler",
            bolumler: bolumler.map(b => bolumOzeti(b, dersler))
        });
    } catch (err) {
        next(err);
    }
};

// ===== BÖLÜM DETAY: /bolum/:slug =====
exports.bolumDetay = async (req, res, next) => {
    try {
        const bolum = await Bolum.findOne({ where: { slug: req.params.slug }, raw: true });
        if (!bolum) return bulunamadi(res);
        const dersler = await Ders.findAll({ where: { bolumId: bolum.id }, order: [["id", "ASC"]], raw: true });

        // Her sorunun sadece ders numarasını al, derslere göre say
        const soruDersleri = (await Soru.findAll({ attributes: ["dersId"] })).map(s => s.dersId);

        const dersListesi = dersler
            .map(ders => ({
                ...ders,
                notSayisi: notlar.filter(n => n.dersId === ders.id).length,
                soruSayisi: soruDersleri.filter(id => id === ders.id).length
            }));

        res.render("bolum", { title: bolum.ad, bolum: bolum, dersler: dersListesi });
    } catch (err) {
        next(err);
    }
};

// ===== DERS DETAY: /ders/:slug =====
exports.dersDetay = async (req, res, next) => {
    try {
        const ders = await Ders.findOne({ where: { slug: req.params.slug }, raw: true });
        if (!ders) return bulunamadi(res);

        res.render("ders", {
            title: ders.ad,
            ders: ders,
            bolum: await Bolum.findByPk(ders.bolumId, { raw: true }),
            notlar: notlar.filter(n => n.dersId === ders.id),
            sorular: await soruOzetleri({ dersId: ders.id })
        });
    } catch (err) {
        next(err);
    }
};

// ===== NOT DETAY: /not/:slug =====
exports.notDetay = async (req, res, next) => {
    try {
        const not = notlar.find(n => n.slug === req.params.slug);
        if (!not) return bulunamadi(res);

        // Breadcrumb için ders ve bölüm
        const ders = await Ders.findByPk(not.dersId, { raw: true });
        const bolum = ders ? await Bolum.findByPk(ders.bolumId, { raw: true }) : null;

        // Yükleyen kişi ve seviyesi (veritabanından)
        const kisi = await Kullanici.findOne({ where: { ad: not.yukleyen }, attributes: ["ad", "puan"] });
        const yukleyen = kisi
            ? { ad: kisi.ad, puan: kisi.puan, seviye: seviyeBul(kisi.puan) }
            : { ad: not.yukleyen, puan: 0, seviye: "" };

        // Aynı dersin diğer notları (bu not hariç)
        const digerNotlar = notlar.filter(n => n.dersId === not.dersId && n.id !== not.id);

        // GEÇİCİ: İndirme hakkı sistemi gelince gerçek değer hesaplanacak
        const hak = { kalan: 3, toplam: 5 };

        res.render("not", {
            title: not.baslik,
            not: not,
            ders: ders,
            bolum: bolum,
            yukleyen: yukleyen,
            digerNotlar: digerNotlar,
            hak: hak
        });
    } catch (err) {
        next(err);
    }
};

// ===== DUYURULAR LİSTESİ: /duyurular =====
exports.duyurular = (req, res) => {
    res.render("duyurular", { title: "Duyurular", duyurular: yeniDuyurular() });
};

// ===== DUYURU DETAY: /duyuru/:slug =====
exports.duyuruDetay = (req, res) => {
    const duyuru = duyurular.find(d => d.slug === req.params.slug);
    if (!duyuru) return bulunamadi(res);

    // Kenar sütun için diğer duyurular (bu hariç, en yeni 3)
    const digerleri = yeniDuyurular().filter(d => d.id !== duyuru.id).slice(0, 3);

    res.render("duyuru", { title: duyuru.baslik, duyuru: duyuru, digerleri: digerleri });
};
