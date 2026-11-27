const Kullanici = require("./Kullanici");
const { kullanicilar } = require("../data/dummy");

// Tablo boşsa örnek kullanıcıları ekler, doluysa bir şey yapmaz
const baslangicVerisiEkle = async () => {
    const sayi = await Kullanici.count();
    if (sayi > 0) return;

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

module.exports = baslangicVerisiEkle;