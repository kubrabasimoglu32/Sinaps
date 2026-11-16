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
    { id: 1, dersId: 1, baslik: "Vize Özeti", slug: "vize-ozeti", yukleyen: "kubra", indirme: 42 },
    { id: 2, dersId: 1, baslik: "Bağlı Listeler Ders Notu", slug: "bagli-listeler-ders-notu", yukleyen: "ahmet", indirme: 17 },
    { id: 3, dersId: 2, baslik: "Express Router Özeti", slug: "express-router-ozeti", yukleyen: "zeynep", indirme: 8 }
];

const duyurular = [
    { id: 1, baslik: "Final Programı Açıklandı", slug: "final-programi-aciklandi", tarih: "2026-11-15", icerik: "Final sınav programı yayınlandı." }
];

const kullanicilar = [
    { id: 1, ad: "kubra", puan: 340 },
    { id: 2, ad: "ahmet", puan: 215 },
    { id: 3, ad: "zeynep", puan: 180 },
    { id: 4, ad: "mehmet", puan: 95 },
    { id: 5, ad: "elif", puan: 60 },
    { id: 6, ad: "can", puan: 20 }
];

const sorular = [
    { id: 1, dersId: 1, baslik: "Bağlı liste ile dizi farkı nedir?", slug: "bagli-liste-ile-dizi-farki-nedir", soran: "mehmet", cevapSayisi: 3 },
    { id: 2, dersId: 2, baslik: "Express'te middleware ne işe yarar?", slug: "expresste-middleware-ne-ise-yarar", soran: "elif", cevapSayisi: 1 }
];

module.exports = { bolumler, dersler, notlar, duyurular, kullanicilar, sorular };