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

module.exports = { bolumler, dersler, notlar, duyurular };