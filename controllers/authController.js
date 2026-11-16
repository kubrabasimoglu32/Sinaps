const bcrypt = require("bcryptjs");
const { kullanicilar } = require("../data/dummy");

// ===== KAYIT SAYFASI =====
exports.kayitSayfasi = (req, res) => {
    res.render("auth/kayit", { title: "Kayıt ol", hata: null, eski: {} });
};

// ===== KAYIT İŞLEMİ =====
exports.kayitOl = async (req, res) => {
    const { ad, email, sifre, sifreTekrar } = req.body;

    // Hata olursa formu, kullanıcının yazdıklarıyla tekrar göster
    const hataGoster = (mesaj) =>
        res.render("auth/kayit", { title: "Kayıt ol", hata: mesaj, eski: { ad, email } });

    // 1) Kontroller
    if (!ad || !email || !sifre) return hataGoster("Bütün alanları doldur.");
    if (sifre.length < 6) return hataGoster("Şifre en az 6 karakter olmalı.");
    if (sifre !== sifreTekrar) return hataGoster("Şifreler birbiriyle uyuşmuyor.");
    if (kullanicilar.some(k => k.email === email)) return hataGoster("Bu e-posta zaten kayıtlı.");
    if (kullanicilar.some(k => k.ad === ad)) return hataGoster("Bu kullanıcı adı alınmış.");

    // 2) Şifreyi hash'le ve kullanıcıyı ekle
    const yeniKullanici = {
        id: Math.max(...kullanicilar.map(k => k.id)) + 1,
        ad: ad,
        email: email,
        sifre: await bcrypt.hash(sifre, 10),
        rol: "ogrenci",   // yeni kayıt olan herkes öğrenci olarak başlar
        puan: 0
    };
    kullanicilar.push(yeniKullanici);

    // 3) Kayıt olur olmaz giriş yapmış say
    req.session.kullanici = { id: yeniKullanici.id, ad: yeniKullanici.ad, rol: yeniKullanici.rol };
    res.redirect("/");
};

// ===== GİRİŞ SAYFASI =====
exports.girisSayfasi = (req, res) => {
    res.render("auth/giris", { title: "Giriş yap", hata: null, eski: {} });
};

// ===== GİRİŞ İŞLEMİ =====
exports.girisYap = async (req, res) => {
    const { email, sifre } = req.body;

    const kisi = kullanicilar.find(k => k.email === email);
    const sifreDogru = kisi && await bcrypt.compare(sifre, kisi.sifre);

    if (!sifreDogru) {
        return res.render("auth/giris", {
            title: "Giriş yap",
            hata: "E-posta veya şifre hatalı.",
            eski: { email }
        });
    }

    req.session.kullanici = { id: kisi.id, ad: kisi.ad, rol: kisi.rol };
    const donus = req.session.donus || "/";
    delete req.session.donus;
    res.redirect(donus);
};

// ===== ÇIKIŞ =====
exports.cikis = (req, res) => {
    req.session.destroy(() => res.redirect("/"));
};