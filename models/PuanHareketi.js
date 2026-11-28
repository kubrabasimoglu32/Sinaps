const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

// Her puan değişikliği bu tabloya bir satır olarak yazılır
const PuanHareketi = sequelize.define("PuanHareketi", {
    miktar: {
        type: DataTypes.INTEGER,          // pozitif ya da negatif olabilir
        allowNull: false
    },
    aciklama: {
        type: DataTypes.STRING(200),      // örnek: "Sorunu cevapladın"
        allowNull: false
    }
}, {
    tableName: "puan_hareketleri"
});

module.exports = PuanHareketi;