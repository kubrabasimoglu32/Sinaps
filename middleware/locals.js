const { tokenUret } = require("./csrf");

// Her istekte çalışır: kullanıcıyı ve CSRF kodunu bütün sayfalara gönderir
module.exports = (req, res, next) => {
    res.locals.kullanici = req.session.kullanici || null;
    res.locals.csrfToken = tokenUret(req);
    next();
};