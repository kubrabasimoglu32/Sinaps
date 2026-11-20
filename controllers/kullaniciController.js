const { kullanicilar, notlar, cevaplar } = require("../data/dummy");
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
exports.liste = (req, res) => {
    const liste = [...kullanicilar]
        .sort((a, b) => b.puan - a.puan)
        .map(k => ({
            id: k.id,
            ad: k.ad,
            email: k.email,
            rol: k.rol,
            kurucu: !!k.kurucu,
            puan: k.puan,
            seviye: seviyeBul(k.puan),
            notSayisi: notlar.filter(n => n.yukleyen === k.ad).length,
            cevapSayisi: cevaplar.filter(c => c.yazan === k.ad).length
        }));
    // Dikkat: listeye şifreyi (hash'i bile) eklemiyoruz

    res.render("admin/kullanicilar", {
        title: "Kullanıcılar",
        aktif: "kullanicilar",
        kullanicilar: liste,
        rolAdi: rolAdi,
        sayilar: {
            toplam: kullanicilar.length,
            moderator: kullanicilar.filter(k => k.rol === "moderator").length,
            admin: kullanicilar.filter(k => k.rol === "admin").length
        },
        mesaj: MESAJLAR[req.query.durum] || null,
        benKurucu: !!kullanicilar.find(k => k.id === req.session.kullanici.id)?.kurucu
    });
};

// ===== ROL DEĞİŞTİR: POST /admin/kullanicilar/:id/rol =====
// ===== ROL DEĞİŞTİR: POST /admin/kullanicilar/:id/rol =====
exports.rolDegistir = (req, res) => {
    const id = Number(req.params.id);
    const yeniRol = req.body.rol;

    const kisi = kullanicilar.find(k => k.id === id);
    const islemYapan = kullanicilar.find(k => k.id === req.session.kullanici.id);
    if (!kisi || !islemYapan) return res.redirect("/admin/kullanicilar");

    // 1) Kimse kendi rolünü değiştiremez
    if (kisi.id === islemYapan.id) {
        return res.redirect("/admin/kullanicilar?durum=kendin");
    }

    // 2) Sadece bilinen roller kabul edilir
    if (!GECERLI_ROLLER.includes(yeniRol)) {
        return res.redirect("/admin/kullanicilar?durum=gecersiz");
    }

    // 3) Kurucuya kimse dokunamaz
    if (kisi.kurucu) {
        return res.redirect("/admin/kullanicilar?durum=kurucu");
    }

    // 4) Bir adminin rolünü değiştirmek ya da birini admin yapmak sadece kurucunun işi
    const adminleIlgili = kisi.rol === "admin" || yeniRol === "admin";
    if (adminleIlgili && !islemYapan.kurucu) {
        return res.redirect("/admin/kullanicilar?durum=yetki");
    }

    kisi.rol = yeniRol;
    res.redirect("/admin/kullanicilar?durum=guncellendi");
};