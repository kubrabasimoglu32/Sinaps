const bcrypt = require("bcryptjs");
const Kullanici = require("../models/Kullanici");
const { bolumler } = require("../data/dummy");
const { SINIFLAR } = require("../helpers/sinif");

// Kabul edilen e-posta alan adı
const OKUL_ALAN_ADI = "gmail.com";

const okulMailiMi = (email) => {
    const parcalar = email.split("@");
    return parcalar.length === 2 && parcalar[1] === OKUL_ALAN_ADI;
};

// Kayıt formunu hata mesajı ve girilen bilgilerle yeniden gösterir
const kayitFormu = (res, hata, eski = {}) => {
    res.render("auth/kayit", {
        title: "Kayıt ol",
        hata: hata,
        eski: eski,
        bolumler: bolumler,
        siniflar: SINIFLAR,
        okulAlanAdi: OKUL_ALAN_ADI
    });
};

// GET /kayit
exports.kayitSayfasi = (req, res) => {
    kayitFormu(res, null, {});
};

// POST /kayit
exports.kayitOl = async (req, res) => {
    try {
        const ad = (req.body.ad || "").trim();
        const email = (req.body.email || "").trim().toLowerCase();
        const bolumId = Number(req.body.bolum);
        const sinif = Number(req.body.sinif);
        const sifre = req.body.sifre || "";
        const sifreTekrar = req.body.sifreTekrar || "";
        const eski = { ad, email, bolum: bolumId, sinif };

        if (!ad || !email || !sifre) return kayitFormu(res, "Tüm alanları doldur.", eski);
        if (!okulMailiMi(email)) return kayitFormu(res, `E-posta adresi @${OKUL_ALAN_ADI} ile bitmeli.`, eski);
        if (sifre.length < 6) return kayitFormu(res, "Şifre en az 6 karakter olmalı.", eski);
        if (sifre !== sifreTekrar) return kayitFormu(res, "Şifreler birbiriyle uyuşmuyor.", eski);
        if (!bolumler.some(b => b.id === bolumId)) return kayitFormu(res, "Geçerli bir bölüm seç.", eski);
        if (!SINIFLAR.some(s => s.deger === sinif)) return kayitFormu(res, "Geçerli bir sınıf seç.", eski);

        // Aynı ad ya da e-posta var mı?
        const varMi = await Kullanici.findOne({
            where: { email: email }
        }) || await Kullanici.findOne({ where: { ad: ad } });
        if (varMi) return kayitFormu(res, "Bu ad ya da e-posta zaten kayıtlı.", eski);

        const yeni = await Kullanici.create({
            ad: ad,
            email: email,
            sifre: await bcrypt.hash(sifre, 10),
            rol: "ogrenci",
            puan: 0,
            bolumId: bolumId,
            sinif: sinif
        });

        // Kayıttan sonra otomatik giriş yaptır
        req.session.kullanici = {
            id: yeni.id,
            ad: yeni.ad,
            rol: yeni.rol,
            profilFoto: null
        };
        res.redirect("/");
    } catch (err) {
        console.error(err);
        kayitFormu(res, "Kayıt sırasında bir hata oluştu, tekrar dene.", {});
    }
};

// GET /giris
exports.girisSayfasi = (req, res) => {
    res.render("auth/giris", {
        title: "Giriş yap",
        hata: null,
        eski: {}
    });
};

// POST /giris
exports.girisYap = async (req, res) => {
    try {
        const email = (req.body.email || "").trim().toLowerCase();
        const sifre = req.body.sifre || "";

        const kisi = await Kullanici.findOne({ where: { email: email } });
        const sifreDogruMu = kisi ? await bcrypt.compare(sifre, kisi.sifre) : false;

        if (!sifreDogruMu) {
            return res.render("auth/giris", {
                title: "Giriş yap",
                hata: "E-posta ya da şifre yanlış.",
                eski: { email: email }
            });
        }

        req.session.kullanici = {
            id: kisi.id,
            ad: kisi.ad,
            rol: kisi.rol,
            profilFoto: kisi.profilFoto || null
        };

        const donus = req.session.donus || "/";
        delete req.session.donus;
        res.redirect(donus);
    } catch (err) {
        console.error(err);
        res.render("auth/giris", {
            title: "Giriş yap",
            hata: "Giriş sırasında bir hata oluştu, tekrar dene.",
            eski: {}
        });
    }
};

// POST /cikis
exports.cikis = (req, res) => {
    req.session.destroy(() => {
        res.redirect("/");
    });
};