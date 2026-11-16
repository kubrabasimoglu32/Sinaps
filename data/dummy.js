const bcrypt = require("bcryptjs");

// Örnek kullanıcıların hepsinin şifresi: 123456
// hashSync: şifreyi uygulama başlarken bir kez hash'ler
const ornekSifre = bcrypt.hashSync("123456", 10);
const bolumler = [
    { id: 1, ad: "Yapay Zeka ve Veri Mühendisliği", slug: "yapay-zeka-ve-veri-muhendisligi" },
    { id: 2, ad: "Yazılım Mühendisliği", slug: "yazilim-muhendisligi" }
];

const dersler = [
    { id: 1, bolumId: 1, ad: "Veri Yapıları", slug: "veri-yapilari" },
    { id: 2, bolumId: 1, ad: "Web Programlama", slug: "web-programlama" },
    { id: 3, bolumId: 2, ad: "Siber Güvenlik", slug: "siber-guvenlik" }
];

const notlar = [
    {
        id: 1, dersId: 1, baslik: "Vize Özeti", slug: "vize-ozeti",
        yukleyen: "kubra", indirme: 42, begeni: 5,
        tur: "Özet", dosyaTuru: "PDF", sayfaSayisi: 8, tarih: "2026-11-15",
        aciklama: "Ağaçlar, yığıtlar ve kuyruklar konularının vize öncesi özeti. Çıkmış sorulardan örnekler var."
    },
    {
        id: 2, dersId: 1, baslik: "Bağlı Listeler Ders Notu", slug: "bagli-listeler-ders-notu",
        yukleyen: "ahmet", indirme: 17, begeni: 2,
        tur: "Ders notu", dosyaTuru: "PDF", sayfaSayisi: 12, tarih: "2026-11-10",
        aciklama: "Tek ve çift yönlü bağlı listeler; ekleme, silme ve arama işlemleri."
    },
    {
        id: 3, dersId: 2, baslik: "Express Router Özeti", slug: "express-router-ozeti",
        yukleyen: "zeynep", indirme: 8, begeni: 1,
        tur: "Özet", dosyaTuru: "PDF", sayfaSayisi: 4, tarih: "2026-11-12",
        aciklama: "Express'te router yapısı, middleware ve route parametreleri."
    }
    
];
    // Yüklenmiş ama henüz moderatör onayı almamış notlar
const bekleyenNotlar = [
    {
        id: 4, dersId: 1, baslik: "Yığıt ve Kuyruk Özeti", slug: "yigit-ve-kuyruk-ozeti",
        yukleyen: "can", indirme: 0, begeni: 0,
        tur: "Özet", dosyaTuru: "PDF", sayfaSayisi: 5, tarih: "2026-11-16",
        aciklama: "Yığıt ve kuyruk yapılarının özeti, örnek sorularla."
    },
    {
        id: 5, dersId: 3, baslik: "Siber Güvenlik Vize Notları", slug: "siber-guvenlik-vize-notlari",
        yukleyen: "elif", indirme: 0, begeni: 0,
        tur: "Ders notu", dosyaTuru: "PDF", sayfaSayisi: 10, tarih: "2026-11-16",
        aciklama: "Temel kavramlar, saldırı türleri ve şifreleme."
    }
];

const duyurular = [
    { id: 1, baslik: "Final Programı Açıklandı", slug: "final-programi-aciklandi", tarih: "2026-11-15", icerik: "Final sınav programı yayınlandı." }
];

const kullanicilar = [
    { id: 1, ad: "kubra",  email: "kubra@sinaps.com",  sifre: ornekSifre, rol: "admin",     puan: 340 },
    { id: 2, ad: "ahmet",  email: "ahmet@sinaps.com",  sifre: ornekSifre, rol: "moderator", puan: 215 },
    { id: 3, ad: "zeynep", email: "zeynep@sinaps.com", sifre: ornekSifre, rol: "ogrenci",   puan: 180 },
    { id: 4, ad: "mehmet", email: "mehmet@sinaps.com", sifre: ornekSifre, rol: "ogrenci",   puan: 95 },
    { id: 5, ad: "elif",   email: "elif@sinaps.com",   sifre: ornekSifre, rol: "ogrenci",   puan: 60 },
    { id: 6, ad: "can",    email: "can@sinaps.com",    sifre: ornekSifre, rol: "ogrenci",   puan: 20 }
];

const sorular = [
    { id: 1, dersId: 1, baslik: "Bağlı liste ile dizi farkı nedir?", slug: "bagli-liste-ile-dizi-farki-nedir", soran: "mehmet", cevapSayisi: 3 },
    { id: 2, dersId: 2, baslik: "Express'te middleware ne işe yarar?", slug: "expresste-middleware-ne-ise-yarar", soran: "elif", cevapSayisi: 1 }
];

module.exports = { bolumler, dersler, notlar,bekleyenNotlar, duyurular, kullanicilar, sorular };