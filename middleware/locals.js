const { tokenUret } = require("./csrf");
const Kullanici = require("../models/Kullanici");

// Her istekte çalışır
module.exports = async (req, res, next) => {
    try {
        // 1) Oturumdaki kullanıcının rolünü ve fotoğrafını veritabanından güncel tut
        if (req.session.kullanici) {
            const guncel = await Kullanici.findByPk(req.session.kullanici.id);

            if (guncel) {
                req.session.kullanici.rol = guncel.rol;               // rol değiştiyse hemen geçerli olsun
                req.session.kullanici.profilFoto = guncel.profilFoto || null;
            } else {
                delete req.session.kullanici;                         // kullanıcı artık yoksa oturumu kapat
            }
        }

        // 2) Kullanıcıyı ve CSRF kodunu bütün sayfalara gönder
        res.locals.kullanici = req.session.kullanici || null;
        res.locals.csrfToken = tokenUret(req);
        next();
    } catch (err) {
        next(err);
    }
};