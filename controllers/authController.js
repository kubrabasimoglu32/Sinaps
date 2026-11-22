const bcrypt = require("bcryptjs");
const { kullanicilar, bolumler } = require("../data/dummy");
const { SINIFLAR } = require("../helpers/sinif");

// ===== AYAR: Sadece bu okulun e-postasıyla kayıt olunabilir =====
// Öğrenci mailleri farklı bir uzantıyla bitiyorsa sadece bu satırı değiştir
const OKUL_ALAN_ADI = "samsun.edu.tr";

// E-posta okul adresi mi? ("ali@samsun.edu.tr" → evet, "ali@gmail.com" → hayır)
const okulMailiMi = (email) => {
    const parcalar = email.split("@");
    return parcalar.length === 2           // tam olarak bir tane @ olmalı
        && parcalar[0].length > 0          // @'den önce bir şey yazmalı
        && parcalar[1] === OKUL_ALAN_ADI;  // @'den sonrası okulun adresi olmalı
};

// Kayıt formunu gösterir (ilk açılışta da hata durumunda da kullanılır)
const kayitFormu = (res, hata, eski) => {
    res.render("auth/kayit", {
        title: "Kayıt ol",
        hata: hata,
        eski: eski,
        bolumler: bolumler,
        siniflar: SINIFLAR,
        okulAlanAdi: OKUL_ALAN_ADI
    });
};

// ===== KAYIT SAYFASI =====
// ===== KAYIT SAYFASI =====
exports.kayitSayfasi = (req, res) => {
    kayitFormu(res, null, {});
};

// ===== KAYIT İŞLEMİ =====
exports.kayitOl = async (req, res) => {
    const ad = (req.body.ad || "").trim();
    const email = (req.body.email || "").trim().toLowerCase();
    const sifre = req.body.sifre || "";
    const sifreTekrar = req.body.sifreTekrar || "";
    const bolumId = Number(req.body.bolum);
    const sinif = Number(req.body.sinif);

    // Hata olursa formu, yazılanlar silinmeden tekrar göster
    const hataGoster = (mesaj) => kayitFormu(res, mesaj, { ad, email, bolumId, sinif });

    // 1) Kontroller
    if (!ad || !email || !sifre) return hataGoster("Bütün alanları doldur.");
    if (!okulMailiMi(email)) return hataGoster(`Sadece @${OKUL_ALAN_ADI} uzantılı öğrenci e-postası ile kayıt olabilirsin.`);
    if (!bolumler.some(b => b.id === bolumId)) return hataGoster("Bölümünü seç.");
    if (!SINIFLAR.some(s => s.deger === sinif)) return hataGoster("Sınıfını seç.");
    if (sifre.length < 6) return hataGoster("Şifre en az 6 karakter olmalı.");
    if (sifre !== sifreTekrar) return hataGoster("Şifreler birbiriyle uyuşmuyor.");
    if (kullanicilar.some(k => k.email === email)) return hataGoster("Bu e-posta zaten kayıtlı.");
    if (kullanicilar.some(k => k.ad === ad)) return hataGoster("Bu kullanıcı adı alınmış.");

    // 2) Kullanıcıyı oluştur
    const yeniKullanici = {
        id: Math.max(...kullanicilar.map(k => k.id)) + 1,
        ad: ad,
        email: email,
        sifre: await bcrypt.hash(sifre, 10),
        rol: "ogrenci",
        puan: 0,
        bolumId: bolumId,
        sinif: sinif,
        kayitTarihi: new Date().toISOString().slice(0, 10)
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
    const email = (req.body.email || "").trim().toLowerCase();
    const sifre = req.body.sifre || "";

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