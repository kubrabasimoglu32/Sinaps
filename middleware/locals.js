const { tokenUret } = require("./csrf");
const { kullanicilar } = require("../data/dummy");

// Her istekte çalışır
module.exports = (req, res, next) => {

    // 1) Oturumdaki kullanıcının rolünü güncel tut
    if (req.session.kullanici) {
        const guncel = kullanicilar.find(k => k.id === req.session.kullanici.id);

        if (guncel) {
            req.session.kullanici.rol = guncel.rol; 
            req.session.kullanici.profilFoto = guncel.profilFoto || null;  // rol değiştiyse hemen geçerli olsun
        } else {
            delete req.session.kullanici;              // kullanıcı artık yoksa oturumu kapat
        }
    }

    // 2) Kullanıcıyı ve CSRF kodunu bütün sayfalara gönder
    res.locals.kullanici = req.session.kullanici || null;
    res.locals.csrfToken = tokenUret(req);
    next();
};