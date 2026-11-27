const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

// Her alan, dummy.js'deki kullanıcı nesnesinin bir özelliğine karşılık geliyor
const Kullanici = sequelize.define("Kullanici", {
    ad: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true
    },
    email: {
        type: DataTypes.STRING(120),
        allowNull: false,
        unique: true
    },
    sifre: {
        type: DataTypes.STRING(100),   // bcrypt ile hash'lenmiş şifre
        allowNull: false
    },
    rol: {
        type: DataTypes.ENUM("ogrenci", "moderator", "admin"),
        defaultValue: "ogrenci"
    },
    kurucu: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    puan: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    bolumId: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    sinif: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    profilFoto: {
        type: DataTypes.STRING(255),
        allowNull: true
    }
}, {
    tableName: "kullanicilar"
});

module.exports = Kullanici;