const { Kullanici, Soru, Cevap } = require("./iliskiler");
const { kullanicilar, sorular, cevaplar } = require("../data/dummy");

const kullanicilariEkle = async () => {
    if ((await Kullanici.count()) > 0) return;

    await Kullanici.bulkCreate(
        kullanicilar.map((k) => ({
            id: k.id,
            ad: k.ad,
            email: k.email,
            sifre: k.sifre,
            rol: k.rol,
            kurucu: k.kurucu || false,
            puan: k.puan || 0,
            bolumId: k.bolumId,
            sinif: k.sinif,
            profilFoto: k.profilFoto || null
        }))
    );
    console.log("Örnek kullanıcılar eklendi.");
};

const sorulariEkle = async () => {
    if ((await Soru.count()) > 0) return;

    // Kullanıcı adından id'sine geçiş tablosu: { kubra: 1, mehmet: 4, ... }
    const idler = {};
    (await Kullanici.findAll()).forEach((k) => { idler[k.ad] = k.id; });

    await Soru.bulkCreate(
        sorular.map((s) => ({
            id: s.id,
            baslik: s.baslik,
            slug: s.slug,
            icerik: s.icerik,
            dersId: s.dersId,
            tarih: s.tarih,
            enIyiCevapId: s.enIyiCevapId,
            kullaniciId: idler[s.soran]
        }))
    );

    await Cevap.bulkCreate(
        cevaplar.map((c) => ({
            id: c.id,
            soruId: c.soruId,
            icerik: c.icerik,
            tarih: c.tarih,
            kullaniciId: idler[c.yazan]
        }))
    );
    console.log("Örnek sorular ve cevaplar eklendi.");
};

const baslangicVerisiEkle = async () => {
    await kullanicilariEkle();
    await sorulariEkle();
};

module.exports = baslangicVerisiEkle;