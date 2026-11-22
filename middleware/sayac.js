// ===================================================
// SAYAÇ VERİLERİ (sunucu belleğinde; veritabanı gelince tabloya taşınacak)
// ===================================================
const gunlukZiyaret = {};             // { "2026-11-20": 14, "2026-11-21": 9, ... }
let toplamZiyaret = 0;
const aktifOturumlar = new Map();     // oturum kimliği → { zaman, uye }

const CEVRIMICI_SURE = 5 * 60 * 1000; // 5 dakika (milisaniye)


// ===================================================
// YARDIMCI FONKSİYONLAR
// ===================================================

// Türkiye saatine göre "2026-11-20" biçiminde gün anahtarı verir
const gunAnahtari = (tarih = new Date()) =>
    tarih.toLocaleDateString("sv-SE", { timeZone: "Europe/Istanbul" });

// Son 5 dakikada aktif olanları sayar, eskileri listeden atar
const cevrimiciSay = () => {
    const sinir = Date.now() - CEVRIMICI_SURE;
    let uye = 0;

    for (const [oturumId, bilgi] of aktifOturumlar) {
        if (bilgi.zaman < sinir) {
            aktifOturumlar.delete(oturumId);   // 5 dakikadır sessiz: artık çevrimiçi değil
        } else if (bilgi.uye) {
            uye++;
        }
    }
    return { toplam: aktifOturumlar.size, uye: uye };
};

// Footer ve admin paneli için bütün istatistikleri hazırlar
const istatistikGetir = () => {
    const bugun = gunAnahtari();

    // Son 7 günün ziyaret sayıları (eskiden yeniye; son eleman bugün)
    const son7gun = [];
    for (let i = 6; i >= 0; i--) {
        const gun = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
        son7gun.push(gunlukZiyaret[gunAnahtari(gun)] || 0);
    }

    const cevrimici = cevrimiciSay();
    return {
        bugun: gunlukZiyaret[bugun] || 0,
        toplam: toplamZiyaret,
        cevrimici: cevrimici.toplam,
        uyeCevrimici: cevrimici.uye,
        son7gun: son7gun
    };
};


// ===================================================
// MIDDLEWARE: Her istekte çalışır
// ===================================================
const sayacMiddleware = (req, res, next) => {
    const bugun = gunAnahtari();

    // 1) Ziyaretçi sayacı: bu kişi bugün sayılmadıysa say
    if (req.session.sayilanGun !== bugun) {
        req.session.sayilanGun = bugun;
        toplamZiyaret++;
        gunlukZiyaret[bugun] = (gunlukZiyaret[bugun] || 0) + 1;
    }

    // 2) Çevrimiçi: bu oturumun son görülme zamanını güncelle
    aktifOturumlar.set(req.sessionID, {
        zaman: Date.now(),
        uye: !!req.session.kullanici
    });

    // 3) Bütün sayfalara gönder (footer için)
    res.locals.istatistik = istatistikGetir();
    next();
};

module.exports = { sayacMiddleware, istatistikGetir };