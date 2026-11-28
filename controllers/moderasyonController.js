const { Soru, Cevap, Kullanici, Ders } = require("../models/iliskiler");
const { puanVer } = require("../helpers/puan");


// ===== SORU LİSTESİ: GET /admin/sorular =====
exports.soruListesi = async (req, res, next) => {
    try {
        const kayitlar = await Soru.findAll({
            include: [
                { model: Kullanici, attributes: ["ad"] },
                { model: Cevap, attributes: ["id"] },
                { model: Ders, as: "ders", attributes: ["id", "ad", "slug"] }
            ],
            order: [["tarih", "DESC"]]
        });

        const liste = kayitlar.map(s => ({
            id: s.id,
            baslik: s.baslik,
            slug: s.slug,
            tarih: s.tarih,
            dersId: s.dersId,
            soran: s.Kullanici ? s.Kullanici.ad : "",
            ders: s.ders ? s.ders.get({ plain: true }) : null,
            cevapSayisi: s.Cevaps.length
        }));

        res.render("admin/sorular", { title: "Sorular", aktif: "sorular", sorular: liste });
    } catch (err) {
        next(err);
    }
};

// ===== BİR SORUNUN CEVAPLARI: GET /admin/sorular/:id =====
exports.soruDetay = async (req, res, next) => {
    try {
        const soru = await Soru.findByPk(Number(req.params.id), {
            include: [{ model: Kullanici, attributes: ["ad"] }]
        });
        if (!soru) return res.redirect("/admin/sorular");

        const cevaplar = await Cevap.findAll({
            where: { soruId: soru.id },
            include: [{ model: Kullanici, attributes: ["ad"] }],
            order: [["id", "ASC"]]
        });

        res.render("admin/soru-cevaplar", {
            title: "Cevaplar",
            aktif: "sorular",
            soru: {
                id: soru.id,
                baslik: soru.baslik,
                slug: soru.slug,
                tarih: soru.tarih,
                dersId: soru.dersId,
                enIyiCevapId: soru.enIyiCevapId,
                soran: soru.Kullanici ? soru.Kullanici.ad : "",
                ders: await Ders.findByPk(soru.dersId, { raw: true })
            },
            cevaplar: cevaplar.map(c => ({
                id: c.id,
                soruId: c.soruId,
                yazan: c.Kullanici ? c.Kullanici.ad : "",
                tarih: c.tarih,
                icerik: c.icerik
            }))
        });
    } catch (err) {
        next(err);
    }
};

// ===== SORU SİL: POST /admin/sorular/:id/sil =====
exports.soruSil = async (req, res, next) => {
    try {
        const id = Number(req.params.id);

        // Önce cevaplar, sonra soru silinir
        await Cevap.destroy({ where: { soruId: id } });
        await Soru.destroy({ where: { id: id } });

        res.redirect("/admin/sorular");
    } catch (err) {
        next(err);
    }
};

// ===== CEVAP SİL: POST /admin/cevaplar/:id/sil =====
exports.cevapSil = async (req, res, next) => {
    try {
        const cevap = await Cevap.findByPk(Number(req.params.id), {
            include: [{ model: Kullanici, attributes: ["ad"] }]
        });
        if (!cevap) return res.redirect("/admin/sorular");

        // Silinen cevap en iyi cevapsa: soru çözülmemiş olur, verilen 15 puan geri alınır
        const soru = await Soru.findByPk(cevap.soruId);
        if (soru && soru.enIyiCevapId === cevap.id) {
            soru.enIyiCevapId = null;
            await soru.save();
            if (cevap.Kullanici) {
                await puanVer(cevap.Kullanici.ad, -15, "En iyi cevap silindi");
            }
        }

        const soruId = cevap.soruId;
        await cevap.destroy();
        res.redirect(`/admin/sorular/${soruId}`);
    } catch (err) {
        next(err);
    }
};