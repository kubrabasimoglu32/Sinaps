const Kullanici = require("../models/Kullanici");
const { bolumler, notlar, bekleyenNotlar, sorular, cevaplar, puanHareketleri } = require("../data/dummy");
const { seviyeDetay } = require("../helpers/seviye");
const { sinifAdi } = require("../helpers/sinif");

const rolAdi = { admin: "Admin", moderator: "Moderatör", ogrenci: "Öğrenci" };

// ===== Profil sayfasını hazırlayıp gösterir =====
// Not, soru, cevap ve puan verileri henüz dummy'de; onlar veritabanına geçince burası da değişecek
const profilGoster = (res, kisi, kendisiMi) => {
    const kisininNotlari = notlar.filter(n => n.yukleyen === kisi.ad);
    const kisininCevaplari = cevaplar.filter(c => c.yazan === kisi.ad);

    const cevapListesi = kisininCevaplari.map(c => {
        const soru = sorular.find(s => s.id === c.soruId);
        return { ...c, soru: soru, enIyiMi: !!soru && soru.enIyiCevapId === c.id };
    });

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
        sorular: sorular.filter(s => s.soran === kisi.ad),
        cevaplar: cevapListesi,

        katki: {
            not: kisininNotlari.length,
            cevap: kisininCevaplari.length,
            enIyiCevap: cevapListesi.filter(c => c.enIyiMi).length,
            indirme: kisininNotlari.reduce((toplam, n) => toplam + n.indirme, 0)
        }
    };

    res.render("profil", {
        title: kendisiMi ? "Profilim" : kisi.ad,
        profil: profil,
        kendisiMi: kendisiMi,
        puanGecmisi: kendisiMi
            ? puanHareketleri.filter(h => h.kullaniciAd === kisi.ad).sort((a, b) => b.id - a.id)
            : [],
        bekleyenNotlar: kendisiMi
            ? bekleyenNotlar.filter(n => n.yukleyen === kisi.ad)
            : []
    });
};

// ===== KENDİ PROFİLİM: /profil =====
exports.benimProfilim = async (req, res, next) => {
    try {
        const kisi = await Kullanici.findByPk(req.session.kullanici.id);
        profilGoster(res, kisi, true);
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

        profilGoster(res, kisi, false);
    } catch (err) {
        next(err);
    }
};