const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const Cevap = sequelize.define("Cevap", {
    icerik: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    tarih: {
        type: DataTypes.DATEONLY,
        allowNull: true
    }
}, {
    tableName: "cevaplar"
});

module.exports = Cevap;