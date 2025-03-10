// iOS yorum tarihlerini test etmek için script
const store = require('app-store-scraper');

console.log('App-Store-Scraper kütüphanesi sürümü:', require('./node_modules/app-store-scraper/package.json').version);

const appId = '6470199333';
const country = 'tr';

console.log('Test başlıyor...');
console.log(`AppID: ${appId}, Country: ${country}`);

// Test 1: Basit reviews çağrısı
console.log('\nTEST 1: Basit reviews çağrısı:');
const reviewOptions = {
  id: appId,
  country: country,
  sort: store.sort.RECENT,
  num: 10
};

// Basit hata ayıklama fonksiyonu
const logObjectStructure = (obj, label) => {
  console.log(`\n${label || 'Obje'} yapısı:`);
  console.log('Tipi:', typeof obj);
  console.log('Array mi?', Array.isArray(obj));
  
  if (Array.isArray(obj) && obj.length > 0) {
    console.log('İlk eleman yapısı:', typeof obj[0]);
    console.log('İlk eleman anahtar listesi:', Object.keys(obj[0]).join(', '));
    console.log('İlk eleman örneği:');
    console.log(JSON.stringify(obj[0], null, 2));
    
    // updated alanı için özel kontrol
    if (obj[0].updated) {
      console.log('updated alanı var!');
      console.log('updated değeri:', obj[0].updated);
    } else {
      console.log('updated alanı yok!');
    }
  } else if (typeof obj === 'object' && obj !== null) {
    console.log('Anahtar listesi:', Object.keys(obj).join(', '));
  }
};

// Şimdi testleri çalıştıralım
store.reviews(reviewOptions)
  .then(reviews => {
    logObjectStructure(reviews, 'Reviews API yanıtı');
    
    // Test 2: app sorgusu
    console.log('\nTEST 2: App bilgileri sorgusu:');
    return store.app({ id: appId, country });
  })
  .then(appInfo => {
    logObjectStructure(appInfo, 'App API yanıtı');
    
    console.log('\nTüm testler tamamlandı.');
  })
  .catch(err => {
    console.error('Hata oluştu:', err);
  });
