const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const Ders = sequelize.define("Ders", {
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
    tableName: "dersler"
});

module.exports = Ders;
