// 1) Sadece giriş yapmış kullanıcılar geçebilir
exports.girisGerekli = (req, res, next) => {
    if (!req.session.kullanici) {
        // Girişten sonra bu sayfaya geri dönebilmesi için adresi hatırla
        req.session.donus = req.originalUrl;
        return res.redirect("/giris");
    }
    next();
};

// 2) Sadece belirtilen rollerdeki kullanıcılar geçebilir
//    Kullanımı: rolGerekli("admin")  veya  rolGerekli("admin", "moderator")
exports.rolGerekli = (...roller) => {
    return (req, res, next) => {
        if (!req.session.kullanici) {
            req.session.donus = req.originalUrl;
            return res.redirect("/giris");
        }
        if (!roller.includes(req.session.kullanici.rol)) {
            return res.status(403).render("403", { title: "Yetkin yok" });
        }
        next();
    };
};