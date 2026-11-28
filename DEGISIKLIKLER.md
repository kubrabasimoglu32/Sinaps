# Sinaps – Değişiklik Günlüğü

Veritabanına (MySQL + Sequelize) geçiş sırasında yapılan değişiklikler, sırasıyla.

---

## 1. MySQL kurulumu ve bağlantı
- MySQL Server 8.0 ve Workbench kuruldu (Custom kurulum, port 3306).
- Workbench'te veritabanı oluşturuldu:
  `CREATE DATABASE sinaps CHARACTER SET utf8mb4 COLLATE utf8mb4_turkish_ci;`
  - `utf8mb4`: Türkçe karakterler ve emojiler doğru saklanır.
  - `utf8mb4_turkish_ci`: Sıralama ve karşılaştırma Türkçe kurallara göre (i/İ, ı/I), büyük/küçük harfe duyarsız.
- Paketler: `sequelize` (ORM), `mysql2` (MySQL sürücüsü), `dotenv` (.env okuma).
- `.env`: Veritabanı bilgileri ve şifre burada, `.gitignore` sayesinde GitHub'a gitmez.
- `config/database.js`: Sequelize bağlantısı ve `baglantiTest()`.

## 2. Kullanıcılar tablosu
- `models/Kullanici.js`: ad, email (ikisi de `unique`), sifre (bcrypt hash), rol (`ENUM`), kurucu, puan, bolumId, sinif, profilFoto.
  Sequelize `id`, `createdAt`, `updatedAt` alanlarını kendisi ekler. Kayıt tarihi olarak `createdAt` kullanılıyor.
- `index.js`: `sequelize.sync()` → modellere bakıp eksik tabloları oluşturur, var olan tabloyu değiştirmez.
- `models/seed.js`: Tablo boşsa dummy'deki örnek verileri ekler. Doluysa hiçbir şey yapmaz (veriler iki kez eklenmez).
- Kayıt artık `@gmail.com` adreslerini kabul ediyor (`authController.js` → `OKUL_ALAN_ADI`).
- Veritabanındaki örnek e-postalar SQL ile güncellendi (`REPLACE(... '@samsun.edu.tr', '@gmail.com') WHERE id > 0`).
  `WHERE id > 0`: Workbench'in "safe update" modu, anahtar sütun kullanmayan toplu güncellemeyi engelliyor.

## 3. Giriş, kayıt, oturum, ayarlar ve profil
- `authController.js`: Kayıt ve giriş veritabanından (`Kullanici.findOne`, `Kullanici.create`). `async/await` + `try/catch`.
- `middleware/locals.js`: Her istekte oturumdaki kullanıcının rolü ve fotoğrafı veritabanından güncelleniyor (`findByPk`). Kullanıcı silinmişse oturum kapanıyor.
- `ayarlarController.js`: Bölüm/sınıf `Kullanici.update`, şifre ve fotoğraf `findByPk` + `save()` ile kaydediliyor.
- `profilController.js`: Kullanıcı veritabanından okunuyor (yeni kayıtlı hesaplarda çıkan hata düzeltildi).

## 4. Soru-cevap ve puan sistemi
- `models/Soru.js`, `models/Cevap.js`, `models/PuanHareketi.js` (tablo: `puan_hareketleri`).
- `models/iliskiler.js`: Tablolar arası bağlar (`hasMany` / `belongsTo`).
  - Yazar artık isimle değil kullanıcı `id`'si (`kullaniciId`) ile tutuluyor. Kullanıcı adı değişse bile soru ve cevaplar kopmaz.
  - `onDelete: "CASCADE"`: Kullanıcı silinirse soruları ve cevapları, soru silinirse cevapları da silinir.
  - En iyi cevap bağlantısında `constraints: false`: Soru ↔ cevap birbirine bağlı olduğu için veritabanı kısıtı koyulmadı.
- `helpers/puan.js`: `puanVer` artık `async`, puanı veritabanına yazıyor ve her değişikliği `puan_hareketleri` tablosuna kaydediyor. Puan sıfırın altına inmez.
  Dışa aktarma `module.exports = { puanVer }` oldu, her yerde `const { puanVer } = require(...)` ile alınıyor.
- `soruController.js`, `moderasyonController.js`: Soru listesi, detay, soru sorma, cevap yazma, en iyi seçme, silme veritabanından.
  - Düzeltilen hata: En iyi cevap değiştirildiğinde -15 puan yanlışlıkla **yeni** cevabın sahibinden düşüyordu, artık **eski** cevabın sahibinden düşüyor.
  - "Soruyu soran ben miyim?" kontrolü isim yerine `id` ile yapılıyor.
- `adminController.js`: Not onay/ret puanları veritabanına yazılıyor (notlar henüz dummy'de).
- Karşılaşılan hata: `puan_hareketleri` tablosu bağlantı tanımlanmadan önce oluştuğu için `kullaniciId` sütunu yoktu (`sync()` mevcut tabloyu değiştirmez). Tablo `DROP TABLE` ile silindi, sunucu yeniden oluşturdu.

## 5. Dummy'den okumaya devam eden sayfaların düzeltilmesi
- `models/soru.js` → `Soru.js`, `models/cevap.js` → `Cevap.js`: Windows büyük/küçük harfe bakmaz ama Render (Linux) bakar, yanlış adla site açılmazdı.
- `kullaniciController.js`: Admin > Kullanıcılar veritabanından. **Önemli hata:** Rol değişikliği önceden dummy'ye yazılıyordu, giriş kontrolü veritabanına baktığı için etkisizdi.
- `siteController.js`: Ana sayfadaki liderler ve son sorular, bölüm/ders sayfalarındaki soru sayıları, not sayfasındaki yükleyen kişi veritabanından.
- `haritaController.js`: Site haritası ve `sitemap.xml` soruları veritabanından.
- `profilController.js`: Sorular, cevaplar ve puan geçmişi veritabanından.
- Yeni `helpers/soruListesi.js`: `soruOzetleri(kosul, limit)` – ana sayfa ve ders sayfası soru listesini aynı yerden alıyor.

## 6. Bölümler ve dersler
- `models/Bolum.js` (`bolumler`), `models/Ders.js` (`dersler`).
- `iliskiler.js`: Bölüm → ders (`CASCADE`), ders → soru, bölüm → kullanıcı.
  - Ders → soru ve bölüm → kullanıcı bağlarında `constraints: false`: Eski tablolara veritabanı kısıtı eklenmiyor, bağlantı sadece kodda kuruluyor. Böylece mevcut tablolarda değişiklik gerekmedi.
  - `Soru.belongsTo(Ders, { as: "ders" })`: Sequelize "Ders" adını İngilizce çoğul sanıp "Der" yapıyordu (`s.Ders` boş geliyordu). Adı biz verdik, veri `s.ders` olarak geliyor.
- `seed.js`: Bölüm ve dersler, diğer her şeyden **önce** ekleniyor.
- Bölüm/ders okuyan controller'lar veritabanına geçti: `siteController`, `soruController`, `moderasyonController`, `authController`, `ayarlarController`, `profilController`, `haritaController`, `adminController`, `helpers/soruListesi.js`.
  View dosyalarına dokunulmadı: Veriler `raw: true` ile aynı şekilde (`{ id, ad, slug, bolumId }`) getiriliyor.
- `sync({ alter: true })` planlanmıştı ama **yapılmadı**: MySQL'de her yeniden başlatmada `unique` alanlar için yeni indeks ekleyebiliyor, nodemon çok sık yeniden başlattığı için zamanla "çok fazla indeks" hatası verebilirdi. Bağlantılar `constraints: false` ile kurulduğu için gerek de kalmadı.
- Test: Projenin bir kopyası SQLite ile çalıştırılıp bütün sayfalar, giriş, soru sorma, cevap, en iyi cevap ve rol değiştirme denendi.

---

## Hâlâ dummy'de olanlar
- Notlar ve bekleyen notlar
- Duyurular
- Galeri afişleri
