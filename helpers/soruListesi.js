const { Soru, Cevap, Kullanici, Ders } = require("../models/iliskiler");

// Veritabanındaki soruları; soran kişinin adı, ders bilgisi ve cevap sayısıyla birlikte verir
//   kosul: hangi sorular (ör. { dersId: 2 }), limit: en fazla kaç soru
const soruOzetleri = async (kosul = {}, limit) => {
    const kayitlar = await Soru.findAll({
        where: kosul,
        include: [
            { model: Kullanici, attributes: ["ad"] },
            { model: Cevap, attributes: ["id"] },
            { model: Ders, as: "ders", attributes: ["id", "ad", "slug", "bolumId"] }
        ],
        order: [["tarih", "DESC"], ["id", "DESC"]]
    });

    const liste = kayitlar.map(s => ({
        id: s.id,
        baslik: s.baslik,
        slug: s.slug,
        icerik: s.icerik,
        tarih: s.tarih,
        dersId: s.dersId,
        enIyiCevapId: s.enIyiCevapId,
        soran: s.Kullanici ? s.Kullanici.ad : "",
        ders: s.ders ? s.ders.get({ plain: true }) : null,
        cevapSayisi: s.Cevaps.length
    }));

    return limit ? liste.slice(0, limit) : liste;
};

module.exports = { soruOzetleri };
