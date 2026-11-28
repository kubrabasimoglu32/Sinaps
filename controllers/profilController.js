const { Kullanici, Soru, Cevap, PuanHareketi } = require("../models/iliskiler");
const { bolumler, notlar, bekleyenNotlar } = require("../data/dummy");
const { seviyeDetay } = require("../helpers/seviye");
const { sinifAdi } = require("../helpers/sinif");

const rolAdi = { admin: "Admin", moderator: "Moderatör", ogrenci: "Öğrenci" };

// ===== Profil sayfasını hazırlayıp gösterir =====
// kendisiMi: sayfaya bakan kişi profilin sahibi mi? (puan geçmişi sadece ona görünür)
// Sorular, cevaplar ve puan geçmişi veritabanından; notlar henüz dummy'de
const profilGoster = async (res, kisi, kendisiMi) => {
    const kisininNotlari = notlar.filter(n => n.yukleyen === kisi.ad);

    const sorular = await Soru.findAll({
        where: { kullaniciId: kisi.id },
        order: [["tarih", "DESC"]]
    });

    // Cevaplar, ait oldukları soruyla birlikte
    const cevaplar = await Cevap.findAll({
        where: { kullaniciId: kisi.id },
        include: [{ model: Soru, attributes: ["id", "baslik", "slug", "enIyiCevapId"] }],
        order: [["tarih", "DESC"]]
    });
    const cevapListesi = cevaplar.map(c => ({
        id: c.id,
        icerik: c.icerik,
        tarih: c.tarih,
        soru: c.Soru,
        enIyiMi: !!c.Soru && c.Soru.enIyiCevapId === c.id
    }));

    const profil = {
        ad: kisi.ad,
        profilFoto: kisi.profilFoto || null,
        email: kisi.email,
        rol: rolAdi[kisi.rol],
        puan: kisi.puan,
        seviye: seviyeDetay(kisi.puan),
        bolum: bolumler.find(b => b.id === kisi.bolumId),
        sinif: sinifAdi(kisi.sinif),
        kayitTarihi: kisi.createdAt,

        notlar: kisininNotlari,
        sorular: sorular,
        cevaplar: cevapListesi,

        katki: {
            not: kisininNotlari.length,
            cevap: cevapListesi.length,
            enIyiCevap: cevapListesi.filter(c => c.enIyiMi).length,
            indirme: kisininNotlari.reduce((toplam, n) => toplam + n.indirme, 0)
        }
    };

    // Puan geçmişi sadece profilin sahibine
    let puanGecmisi = [];
    if (kendisiMi) {
        const hareketler = await PuanHareketi.findAll({
            where: { kullaniciId: kisi.id },
            order: [["id", "DESC"]],
            limit: 50
        });
        puanGecmisi = hareketler.map(h => ({
            miktar: h.miktar,
            aciklama: h.aciklama,
            tarih: h.createdAt.toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" })
        }));
    }

    res.render("profil", {
        title: kendisiMi ? "Profilim" : kisi.ad,
        profil: profil,
        kendisiMi: kendisiMi,
        puanGecmisi: puanGecmisi,
        bekleyenNotlar: kendisiMi ? bekleyenNotlar.filter(n => n.yukleyen === kisi.ad) : []
    });
};

// ===== KENDİ PROFİLİM: /profil =====
exports.benimProfilim = async (req, res, next) => {
    try {
        const kisi = await Kullanici.findByPk(req.session.kullanici.id);
        await profilGoster(res, kisi, true);
    } catch (err) {
        next(err);
    }
};

// ===== BAŞKASININ PROFİLİ: /kullanici/:ad =====
exports.kullaniciProfili = async (req, res, next) => {
    try {
        const kisi = await Kullanici.findOne({ where: { ad: req.params.ad } });
        if (!kisi) return res.status(404).render("404", { title: "Sayfa bulunamadı" });

        // Kendi profiline bu adresten geldiyse /profil'e yönlendir
        const oturum = req.session.kullanici;
        if (oturum && oturum.id === kisi.id) return res.redirect("/profil");

        await profilGoster(res, kisi, false);
    } catch (err) {
        next(err);
    }
};
