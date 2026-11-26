const multer = require("multer");
const path = require("path");
const fs = require("fs");

const IZINLI_TURLER = {
    "image/jpeg": ".jpg",
    "image/png": ".png"
};
const MAKS_BOYUT = 2 * 1024 * 1024; // 2 MB

const resimYukleyici = (klasorAdi, alanAdi) => {
    const klasor = path.join(__dirname, "..", "public", "uploads", klasorAdi);
    fs.mkdirSync(klasor, { recursive: true });

    const yukle = multer({
        storage: multer.diskStorage({
            destination: klasor,
            filename: (req, file, cb) => {
                const uzanti = IZINLI_TURLER[file.mimetype];
                cb(null, `${Date.now()}-${Math.round(Math.random() * 1e6)}${uzanti}`);
            }
        }),
        limits: { fileSize: MAKS_BOYUT },
        fileFilter: (req, file, cb) => {
            if (IZINLI_TURLER[file.mimetype]) {
                cb(null, true);
            } else {
                req.yuklemeHatasi = "tur";
                cb(null, false);
            }
        }
    }).single(alanAdi);

    return (req, res, next) => {
        yukle(req, res, (err) => {
            if (err) req.yuklemeHatasi = err.code === "LIMIT_FILE_SIZE" ? "boyut" : "hata";
            next();
        });
    };
};

module.exports = { resimYukleyici };