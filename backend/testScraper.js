// Google Play Scraper kütüphanesini test etmek için
const gplay = require('google-play-scraper');

// Kütüphane yapısını kontrol et
console.log('Google Play Scraper kütüphanesinin içeriği:');
console.log(Object.keys(gplay));

if (gplay.__esModule) {
  console.log('ES modül yapısı tespit edildi, default özelliğindeki anahtarlar:');
  console.log(Object.keys(gplay.default));
  
  // Default'daki fonksiyonları kullan
  const app = gplay.default.app;
  const reviews = gplay.default.reviews;
  
  // Uygulama bilgilerini test et
  console.log('Uygulama bilgileri alınıyor...');
  app({ appId: 'com.garantibbvadigitalassets.crypto', lang: 'tr', country: 'tr' })
    .then(data => {
      console.log('Uygulama bilgileri başarıyla alındı!');
      console.log(`Uygulama adı: ${data.title}`);
      console.log(`Versiyon: ${data.version}`);
      console.log(`Puan: ${data.score}`);
    })
    .catch(err => {
      console.error('Uygulama bilgileri alınırken hata oluştu:', err);
    });
  
  // Test amaçlı farklı bir uygulama deneyelim
  console.log('Test için popüler bir uygulamanın yorumlarını alıyoruz...');
  reviews({
    appId: 'com.whatsapp',
    lang: 'tr',
    country: 'tr',
    sort: 0,
    num: 5
  })
    .then(data => {
      console.log('Yorumlar başarıyla alındı!');
      console.log(`Dönen veri yapısı: ${typeof data}, Array mi?: ${Array.isArray(data)}`);
      console.log('Dönen veri anahtarları:', Object.keys(data));
      console.log('Dönen veri:', JSON.stringify(data, null, 2).substring(0, 500) + '...');
    })
    .catch(err => {
      console.error('Yorumlar alınırken hata oluştu:', err);
    });

  // Şimdi test etmeye çalıştığımız uygulama için yorumlar
  console.log('Garanti BBVA Kripto uygulamasının yorumlarını alıyoruz...');
  reviews({
    appId: 'com.garantibbvadigitalassets.crypto',
    lang: 'tr',
    country: 'tr',
    sort: 0,
    num: 100
  })
    .then(data => {
      console.log('Yorumlar başarıyla alındı!');
      console.log(`Dönen veri yapısı: ${typeof data}, Array mi?: ${Array.isArray(data)}`);
      console.log('Dönen veri anahtarları:', Object.keys(data));
      console.log(`Alınan yorum sayısı: ${data.data?.length || 0}`);
      console.log('Dönen veri:', JSON.stringify(data, null, 2).substring(0, 500) + '...');
    })
    .catch(err => {
      console.error('Yorumlar alınırken hata oluştu:', err);
    });
} else {
  console.log('Normal CommonJS modülü olarak içe aktarıldı.');
  
  // Uygulama bilgilerini test et
  console.log('Uygulama bilgileri alınıyor...');
  gplay.app({ appId: 'com.garantibbvadigitalassets.crypto', lang: 'tr', country: 'tr' })
    .then(data => {
      console.log('Uygulama bilgileri başarıyla alındı!');
      console.log(`Uygulama adı: ${data.title}`);
      console.log(`Versiyon: ${data.version}`);
      console.log(`Puan: ${data.score}`);
    })
    .catch(err => {
      console.error('Uygulama bilgileri alınırken hata oluştu:', err);
    });
  
  // Test amaçlı farklı bir uygulama deneyelim
  console.log('Test için popüler bir uygulamanın yorumlarını alıyoruz...');
  gplay.reviews({
    appId: 'com.whatsapp',
    lang: 'tr',
    country: 'tr',
    sort: gplay.sort.NEWEST,
    num: 5
  })
    .then(data => {
      console.log('Yorumlar başarıyla alındı!');
      console.log(`Dönen veri yapısı: ${typeof data}, Array mi?: ${Array.isArray(data)}`);
      console.log('Dönen veri anahtarları:', Object.keys(data));
      console.log('Dönen veri:', JSON.stringify(data, null, 2).substring(0, 500) + '...');
    })
    .catch(err => {
      console.error('Yorumlar alınırken hata oluştu:', err);
    });

  // Şimdi test etmeye çalıştığımız uygulama için yorumlar
  console.log('Garanti BBVA Kripto uygulamasının yorumlarını alıyoruz...');
  gplay.reviews({
    appId: 'com.garantibbvadigitalassets.crypto',
    lang: 'tr',
    country: 'tr',
    sort: gplay.sort.NEWEST,
    num: 100
  })
    .then(data => {
      console.log('Yorumlar başarıyla alındı!');
      console.log(`Dönen veri yapısı: ${typeof data}, Array mi?: ${Array.isArray(data)}`);
      console.log('Dönen veri anahtarları:', Object.keys(data));
      console.log(`Alınan yorum sayısı: ${data.data?.length || 0}`);
      console.log('Dönen veri:', JSON.stringify(data, null, 2).substring(0, 500) + '...');
    })
    .catch(err => {
      console.error('Yorumlar alınırken hata oluştu:', err);
    });
}

