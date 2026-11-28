const { Kullanici, Soru, Cevap, Bolum, Ders } = require("./iliskiler");
const { kullanicilar, sorular, cevaplar, bolumler, dersler } = require("../data/dummy");

// Bölümler ve dersler (diğer her şey bunlara bağlı olduğu için ilk sırada)
const bolumVeDersleriEkle = async () => {
    if ((await Bolum.count()) > 0) return;

    await Bolum.bulkCreate(bolumler.map((b) => ({ id: b.id, ad: b.ad, slug: b.slug })));
    await Ders.bulkCreate(dersler.map((d) => ({ id: d.id, bolumId: d.bolumId, ad: d.ad, slug: d.slug })));
    console.log("Örnek bölümler ve dersler eklendi.");
};

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
    await bolumVeDersleriEkle();
    await kullanicilariEkle();
    await sorulariEkle();
};

module.exports = baslangicVerisiEkle;