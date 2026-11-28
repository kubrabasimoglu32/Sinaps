const { Kullanici, PuanHareketi } = require("../models/iliskiler");

// Kullanıcının puanını değiştirir ve geçmişe kaydeder
// Puan sıfırın altına düşmez, geçmişe gerçekte değişen miktar yazılır
const puanVer = async (kullaniciAdi, miktar, aciklama) => {
    const kisi = await Kullanici.findOne({ where: { ad: kullaniciAdi } });
    if (!kisi) return;

    const eskiPuan = kisi.puan;
    const yeniPuan = Math.max(0, eskiPuan + miktar);
    const gercekDegisim = yeniPuan - eskiPuan;

    kisi.puan = yeniPuan;
    await kisi.save();

    await PuanHareketi.create({
        kullaniciId: kisi.id,
        miktar: gercekDegisim,
        aciklama: aciklama
    });
};

module.exports = { puanVer };