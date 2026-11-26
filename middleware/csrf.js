const { csrfSync } = require("csrf-sync");

const { csrfSynchronisedProtection, generateToken } = csrfSync({
    // Token'ı formdaki gizli "_csrf" alanından oku
        getTokenFromRequest: (req) => req.body?._csrf || req.query._csrf
});

module.exports = {
    csrfKoruma: csrfSynchronisedProtection,  // gelen POST isteklerini kontrol eder
    tokenUret: generateToken                 // formlara koyacağımız kodu üretir
};