const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const Soru = sequelize.define("Soru", {
    baslik: {
        type: DataTypes.STRING(200),
        allowNull: false
    },
    slug: {
        type: DataTypes.STRING(220),
        allowNull: false,
        unique: true
    },
    icerik: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    dersId: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    tarih: {
        type: DataTypes.DATEONLY,
        allowNull: true
    },
    enIyiCevapId: {
        type: DataTypes.INTEGER,
        allowNull: true
    }
}, {
    tableName: "sorular"
});

module.exports = Soru;