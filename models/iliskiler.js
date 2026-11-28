const Kullanici = require("./Kullanici");
const Soru = require("./Soru");
const Cevap = require("./Cevap");
const PuanHareketi = require("./PuanHareketi");
const Bolum = require("./Bolum");
const Ders = require("./Ders");

// Bir bölümün çok dersi olabilir, bir ders bir bölüme aittir
Bolum.hasMany(Ders, { foreignKey: { name: "bolumId", allowNull: false }, onDelete: "CASCADE" });
Ders.belongsTo(Bolum, { foreignKey: "bolumId" });

// Bir dersin çok sorusu olabilir
// (constraints: false → eski tablolara veritabanı kısıtı eklenmez, bağlantı sadece kodda kurulur)
// as: "ders" → Sequelize "Ders" adını çoğul sanıp "Der" yapmasın diye adı biz veriyoruz
Ders.hasMany(Soru, { foreignKey: "dersId", constraints: false });
Soru.belongsTo(Ders, { as: "ders", foreignKey: "dersId", constraints: false });

// Bir kullanıcı bir bölümde okur
Bolum.hasMany(Kullanici, { foreignKey: "bolumId", constraints: false });
Kullanici.belongsTo(Bolum, { foreignKey: "bolumId", constraints: false });

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

module.exports = { Kullanici, Soru, Cevap, PuanHareketi, Bolum, Ders };
