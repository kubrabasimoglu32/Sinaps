require("dotenv").config();
const { Sequelize } = require("sequelize");

const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASS,
    {
        host: process.env.DB_HOST,
        port: Number(process.env.DB_PORT) || 3306,
        dialect: "mysql",
        logging: false,        // Terminalde her SQL sorgusunu gösterme
        timezone: "+03:00"     // Tarihler Türkiye saatiyle kaydedilsin
    }
);

// Bağlantıyı test eder ve sonucu terminale yazar
const baglantiTest = async () => {
    try {
        await sequelize.authenticate();
        console.log("MySQL bağlantısı başarılı.");
    } catch (err) {
        console.error("MySQL bağlantı hatası:", err.message);
    }
};

module.exports = { sequelize, baglantiTest };