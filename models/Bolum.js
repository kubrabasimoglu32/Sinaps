const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const Bolum = sequelize.define("Bolum", {
    ad: {
        type: DataTypes.STRING(120),
        allowNull: false
    },
    slug: {
        type: DataTypes.STRING(140),
        allowNull: false,
        unique: true
    }
}, {
    tableName: "bolumler"
});

module.exports = Bolum;
