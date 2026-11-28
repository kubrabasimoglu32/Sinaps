const Kullanici = require("./Kullanici");
const Soru = require("./Soru");
const Cevap = require("./Cevap");
const PuanHareketi = require("./PuanHareketi");

// Bir kullanıcının çok puan hareketi olabilir
Kullanici.hasMany(PuanHareketi, { foreignKey: { name: "kullaniciId", allowNull: false }, onDelete: "CASCADE" });
PuanHareketi.belongsTo(Kullanici, { foreignKey: "kullaniciId" });

// Bir kullanıcının çok sorusu ve çok cevabı olabilir
Kullanici.hasMany(Soru, { foreignKey: { name: "kullaniciId", allowNull: false }, onDelete: "CASCADE" });
Soru.belongsTo(Kullanici, { foreignKey: "kullaniciId" });

Kullanici.hasMany(Cevap, { foreignKey: { name: "kullaniciId", allowNull: false }, onDelete: "CASCADE" });
Cevap.belongsTo(Kullanici, { foreignKey: "kullaniciId" });

// Bir sorunun çok cevabı olabilir, bir cevap bir soruya aittir
Soru.hasMany(Cevap, { foreignKey: { name: "soruId", allowNull: false }, onDelete: "CASCADE" });
Cevap.belongsTo(Soru, { foreignKey: "soruId" });

// En iyi cevap bağlantısı: döngüsel olmasın diye veritabanı kısıtı koymuyoruz
Soru.belongsTo(Cevap, {
    as: "enIyiCevap",
    foreignKey: { name: "enIyiCevapId", allowNull: true },
    constraints: false
});

module.exports = { Kullanici, Soru, Cevap, PuanHareketi };