const { Kullanici, Cevap } = require("../models/iliskiler");
const { notlar } = require("../data/dummy");
const seviyeBul = require("../helpers/seviye");

const GECERLI_ROLLER = ["ogrenci", "moderator", "admin"];

// İşlem sonrası gösterilecek mesajlar
const MESAJLAR = {
    guncellendi: { tur: "success", metin: "Rol güncellendi." },
    kendin:      { tur: "danger",  metin: "Kendi rolünü değiştiremezsin." },
    gecersiz:    { tur: "danger",  metin: "Geçersiz rol seçimi." },
    kurucu:      { tur: "danger",  metin: "Kurucunun rolü değiştirilemez." },
    yetki:       { tur: "danger",  metin: "Admin atama ve kaldırma yetkisi sadece kurucuda." }
};

const rolAdi = { admin: "Admin", moderator: "Moderatör", ogrenci: "Öğrenci" };


// ===== KULLANICI LİSTESİ: GET /admin/kullanicilar =====
exports.liste = async (req, res, next) => {
    try {
        const kayitlar = await Kullanici.findAll({
            attributes: ["id", "ad", "email", "rol", "kurucu", "puan"],   // şifre hiç okunmuyor
            include: [{ model: Cevap, attributes: ["id"] }],
            order: [["puan", "DESC"]]
        });

        const liste = kayitlar.map(k => ({
            id: k.id,
            ad: k.ad,
            email: k.email,
            rol: k.rol,
            kurucu: !!k.kurucu,
            puan: k.puan,
            seviye: seviyeBul(k.puan),
            notSayisi: notlar.filter(n => n.yukleyen === k.ad).length,   // notlar henüz dummy'de
            cevapSayisi: k.Cevaps.length
        }));

        const ben = kayitlar.find(k => k.id === req.session.kullanici.id);

        res.render("admin/kullanicilar", {
            title: "Kullanıcılar",
            aktif: "kullanicilar",
            kullanicilar: liste,
            rolAdi: rolAdi,
            sayilar: {
                toplam: liste.length,
                moderator: liste.filter(k => k.rol === "moderator").length,
                admin: liste.filter(k => k.rol === "admin").length
            },
            mesaj: MESAJLAR[req.query.durum] || null,
            benKurucu: !!(ben && ben.kurucu)
        });
    } catch (err) {
        next(err);
    }
};

// ===== ROL DEĞİŞTİR: POST /admin/kullanicilar/:id/rol =====
exports.rolDegistir = async (req, res, next) => {
    try {
        const yeniRol = req.body.rol;
        const kisi = await Kullanici.findByPk(Number(req.params.id));
        const islemYapan = await Kullanici.findByPk(req.session.kullanici.id);
        if (!kisi || !islemYapan) return res.redirect("/admin/kullanicilar");

        // 1) Kimse kendi rolünü değiştiremez
        if (kisi.id === islemYapan.id) return res.redirect("/admin/kullanicilar?durum=kendin");

        // 2) Sadece bilinen roller kabul edilir
        if (!GECERLI_ROLLER.includes(yeniRol)) return res.redirect("/admin/kullanicilar?durum=gecersiz");

        // 3) Kurucuya kimse dokunamaz
        if (kisi.kurucu) return res.redirect("/admin/kullanicilar?durum=kurucu");

        // 4) Bir adminin rolünü değiştirmek ya da birini admin yapmak sadece kurucunun işi
        const adminleIlgili = kisi.rol === "admin" || yeniRol === "admin";
        if (adminleIlgili && !islemYapan.kurucu) return res.redirect("/admin/kullanicilar?durum=yetki");

        kisi.rol = yeniRol;
        await kisi.save();
        res.redirect("/admin/kullanicilar?durum=guncellendi");
    } catch (err) {
        next(err);
    }
};
