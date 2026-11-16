// Her istekte çalışır: oturumdaki kullanıcıyı bütün sayfalara gönderir
module.exports = (req, res, next) => {
    res.locals.kullanici = req.session.kullanici || null;
    next();
};