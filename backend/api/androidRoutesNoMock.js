const express = require('express');
const router = express.Router();
const logger = require('../utils/logger');

// Google Play Scraper kütüphanesini import et
const gplayLibModule = require('google-play-scraper');
const gplayLib = gplayLibModule.default || gplayLibModule;

// Tüm API fonksiyonlarını doğru şekilde tanımla
const appFunction = gplayLib.app || 
                 (gplayLibModule.__esModule && gplayLibModule.default && gplayLibModule.default.app) ||
                 (gplayLibModule.app);
                 
const reviewsFunction = gplayLib.reviews || 
                     (gplayLibModule.__esModule && gplayLibModule.default && gplayLibModule.default.reviews) ||
                     (gplayLibModule.reviews);

logger.info(`Google Play Scraper kütüphanesinin detaylı yapısı: ${JSON.stringify(gplayLibModule)}`);
logger.info(`appFunction türü: ${typeof appFunction}, reviewsFunction türü: ${typeof reviewsFunction}`);


// Uygulama bilgilerini getir
router.get('/app-info', async (req, res) => {
  try {
    // Sadece frontend'den gelen ID veya varsayılan ID'yi kullan
    const appId = req.query.appId || process.env.APP_ANDROID_ID || 'com.garantibbvadigitalassets.crypto';
    
    logger.info(`Android uygulama bilgileri isteniyor: ${appId}`);
    
    // Kütüphanenin yapısını kontrol et ve logla
    logger.info(`Google Play Scraper kütüphanesinin yapısı: ${JSON.stringify(Object.keys(gplayLib))}`);
    
    // Global tanımlı appFunction kullanılıyor
    if (typeof appFunction !== 'function') {
      throw new Error('Google Play Scraper kütüphanesinde app fonksiyonu bulunamadı');
    }
    
    try {
      // API çağrısı yap
      logger.info(`App function çağrılıyor appFunction: ${typeof appFunction}`);  
      const appInfo = await appFunction({ 
        appId: appId,
        lang: 'tr',
        country: 'tr'
      });
      
      logger.info(`App bilgilerinde dönen verinin türü: ${typeof appInfo}`);
      if (appInfo) {
        logger.info(`App bilgilerinde anahtarlar: ${Object.keys(appInfo).join(', ')}`);
      }
      
      // Eğer veri yoksa boş dönüş sağla
      if (!appInfo) {
        logger.info('App bilgileri bulunamadı, boş cevap döndürülüyor');
        return res.status(404).json({
          success: false,
          error: 'Android uygulama bilgileri bulunamadı.'
        });
      }
      
      return res.json({
        success: true,
        data: appInfo
      });
    } catch (apiError) {
      logger.error(`Google Play API hatası: ${apiError.message}`);
      
      // API hatası durumunda hata mesajı döndür
      return res.status(503).json({
        success: false,
        error: 'Android uygulama bilgileri şu anda çekilemiyor. Servis geçici olarak kullanılamaz durumda.',
        details: apiError.message
      });
    }
  } catch (error) {
    logger.error('Android uygulama bilgileri alınamadı', { error: error.message });
    
    // Kritik hata durumunda hata mesajı döndür
    return res.status(500).json({
      success: false,
      error: 'Android uygulama bilgileri alınamadı.',
      details: error.message
    });
  }
});

// Uygulama yorumlarını getir
router.get('/reviews', async (req, res) => {
  try {
    const appId = req.query.appId || process.env.APP_ANDROID_ID || 'com.garantibbvadigitalassets.crypto';
    const { limit = 100, sort = 'newest' } = req.query;
    
    logger.info(`Android uygulama yorumları isteniyor: ${appId}`, { limit, sort });
    
    try {
      // Kütüphanenin yapısını logla
      logger.info(`Google Play Scraper kütüphanesinin yapısı: ${JSON.stringify(Object.keys(gplayLib))}`);
      
      // Global tanımlı reviewsFunction kullanılıyor
      if (typeof reviewsFunction !== 'function') {
        logger.error('Google Play Scraper reviews fonksiyonu bulunamadı');
        throw new Error('Google Play Scraper kütüphanesinde reviews fonksiyonu bulunamadı');
      }
      
      // Sıralama parametrelerini ayarla
      let sortValue;
      
      // String olarak girildiyse - Google Play Scraper gerçek değerlerini kullan
      if (sort === 'rating') {
        sortValue = 3;  // RATING (3)
      } else if (sort === 'helpfulness') {
        sortValue = 1;  // HELPFULNESS (1) 
      } else if (sort === 'relevance') {
        sortValue = 0;  // RELEVANCE (varsayılan olarak)
      } else if (sort === 'newest') {
        sortValue = 2;  // NEWEST (2)
      } else {
        // Varsayılan olarak en yeni (newest)
        sortValue = 2;  // NEWEST (2)
      }
      
      logger.info(`Kullanılan sıralama parametresi: ${sort} -> ${sortValue}`);
      
      // API çağrısı parametreleri
      const options = {
        appId: appId,
        sort: sortValue,
        num: parseInt(limit),
        lang: 'tr',  // Türkçe yorumlar için
        country: 'tr'  // Türkiye bölgesi
      };
      
      logger.info(`API çağrısı parametreleri: ${JSON.stringify(options)}`);
      
      // API çağrısını yap
      logger.info(`Google Play Reviews API çağrılıyor. reviewsFunction: ${typeof reviewsFunction}`);
      const reviewsResult = await reviewsFunction(options);
      
      // Sonuçları logla
      logger.info(`Dönen veri yapısı: ${typeof reviewsResult}, Array mi: ${Array.isArray(reviewsResult)}`);
      
      // Tam obje yapısını logla
      logger.info(`Dönen obje anahtarları: ${reviewsResult ? Object.keys(reviewsResult).join(', ') : 'yok'}`);
      logger.info(`Dönen objenin JSON özeti: ${JSON.stringify(reviewsResult).substring(0, 200)}...`);
      
      // Veri formatına göre işlem yap
      let responseData;
      
      if (Array.isArray(reviewsResult)) {
        // Doğrudan dizi döndüyse
        responseData = reviewsResult;
        logger.info(`${responseData.length} adet yorum bulundu (dizi olarak)`);
      } else if (reviewsResult && reviewsResult.data && Array.isArray(reviewsResult.data)) {
        // { data: [...] } formatında döndüyse
        responseData = reviewsResult.data;
        logger.info(`${responseData.length} adet yorum bulundu (data içinde)`);
      } else if (reviewsResult && typeof reviewsResult === 'object') {
        // Object döndüyse ve data formatında değilse
        logger.info('Dönen obje formatı inceleniyor');
        logger.info(`Object anahtarları: ${Object.keys(reviewsResult).join(', ')}`);
        
        // reviews veya results gibi bir anahtar var mı kontrol et
        if (reviewsResult.reviews && Array.isArray(reviewsResult.reviews)) {
          responseData = reviewsResult.reviews;
          logger.info(`${responseData.length} adet yorum bulundu (reviews içinde)`);
        } else if (reviewsResult.results && Array.isArray(reviewsResult.results)) {
          responseData = reviewsResult.results;
          logger.info(`${responseData.length} adet yorum bulundu (results içinde)`);
        } else if (reviewsResult.data && Array.isArray(reviewsResult.data)) {
          responseData = reviewsResult.data;
          logger.info(`${responseData.length} adet yorum bulundu (data içinde)`);
        } else if (reviewsResult.items && Array.isArray(reviewsResult.items)) {
          responseData = reviewsResult.items;
          logger.info(`${responseData.length} adet yorum bulundu (items içinde)`);
        } else if (reviewsResult.comments && Array.isArray(reviewsResult.comments)) {
          responseData = reviewsResult.comments;
          logger.info(`${responseData.length} adet yorum bulundu (comments içinde)`);
        } else {
          // Eğer başka bir formatta geldiyse, tüm objeyi logla ve boş dizi döndür
          logger.error('Beklenmeyen obje formatı:', JSON.stringify(reviewsResult).substring(0, 500));
          responseData = [];
        }
      } else {
        // Beklenmeyen format, boş dizi döndür
        responseData = [];
        logger.error('Beklenmeyen veri formatı:', { reviewsResult });
      }
      
      // Veri formatını daha detaylı analiz et
      if (responseData && responseData.length > 0) {
        const sampleReview = responseData[0];
        logger.info(`Örnek yorum veri yapısı: ${JSON.stringify(Object.keys(sampleReview))}`);
        logger.info(`Örnek yorum içeriği: ${JSON.stringify(sampleReview).substring(0, 300)}...`);
        
        // Tarihleri kontrol et
        const dateField = sampleReview.date ? 'date' : (sampleReview.at ? 'at' : 'unknown');
        logger.info(`Yorum tarih alanı: ${dateField}, Örnek değer: ${sampleReview[dateField]}`);
      }
      
      // Yorum tarih sıralamasını kesin olarak uygula
      if (sort === 'newest' || !sort) {
        try {
          logger.info('Yorumlar tarih sıralaması uygulanıyor...');
          responseData.sort((a, b) => {
            // Yorum tarihlerini karşılaştır
            const dateA = new Date(a.date || a.at || 0);
            const dateB = new Date(b.date || b.at || 0);
            return dateB - dateA; // En yeni yorumlar önce (azalan)
          });
          logger.info('Tarih sıralaması başarıyla uygulandı.');
        } catch (sortErr) {
          logger.error('Yorum sıralama hatası:', sortErr);
        }
      }
      
      return res.json({
        success: true,
        data: responseData
      });
    } catch (apiError) {
      logger.error(`Google Play Reviews API hatası: ${apiError.message}`);
      
      // API hatası durumunda hata mesajı döndür
      return res.status(503).json({
        success: false,
        error: 'Android uygulama yorumları şu anda çekilemiyor. Servis geçici olarak kullanılamaz durumda.',
        details: apiError.message
      });
    }
  } catch (error) {
    logger.error('Android uygulama yorumları alınamadı', { error: error.message, stack: error.stack });
    
    // Kritik hata durumunda hata mesajı döndür
    return res.status(500).json({
      success: false,
      error: 'Android uygulama yorumları alınamadı.',
      details: error.message
    });
  }
});

// Belirli bir derecelendirmedeki yorumları getir
router.get('/reviews/rating/:rating', async (req, res) => {
  try {
    const appId = req.query.appId || process.env.APP_ANDROID_ID || 'com.garantibbvadigitalassets.crypto';
    const rating = parseInt(req.params.rating);
    const { limit = 100, sort = 'newest' } = req.query;
    
    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        error: 'Rating 1-5 arasında olmalıdır'
      });
    }

    logger.info(`Android uygulama ${rating} yıldızlı yorumları isteniyor: ${appId}`, { limit, sort });
    
    try {
      // Kütüphanenin yapısını logla
      logger.info(`Google Play Scraper kütüphanesinin yapısı: ${JSON.stringify(Object.keys(gplayLib))}`);
      
      // Global tanımlı reviewsFunction kullanılıyor
      if (typeof reviewsFunction !== 'function') {
        logger.error('Google Play Scraper reviews fonksiyonu bulunamadı');
        throw new Error('Google Play Scraper kütüphanesinde reviews fonksiyonu bulunamadı');
      }
      
      // Sıralama parametrelerini ayarla
      let sortValue;
      
      // String olarak girildiyse - Google Play Scraper gerçek değerlerini kullan
      if (sort === 'rating') {
        sortValue = 3;  // RATING (3)
      } else if (sort === 'helpfulness') {
        sortValue = 1;  // HELPFULNESS (1) 
      } else if (sort === 'relevance') {
        sortValue = 0;  // RELEVANCE (varsayılan olarak)
      } else if (sort === 'newest') {
        sortValue = 2;  // NEWEST (2)
      } else {
        // Varsayılan olarak en yeni (newest)
        sortValue = 2;  // NEWEST (2)
      }
      
      logger.info(`Rating için kullanılan sıralama parametresi: ${sort} -> ${sortValue}`);
      
      // API çağrısı parametreleri - daha fazla yorum alıp filtreleyeceğiz
      const options = {
        appId: appId,
        sort: sortValue,
        num: parseInt(limit) * 3,  // Filtreleme için fazladan yorum al
        lang: 'tr',  // Türkçe yorumlar için
        country: 'tr'  // Türkiye bölgesi
      };
      
      logger.info(`Rating API çağrısı parametreleri: ${JSON.stringify(options)}`);
      
      // API çağrısını yap
      logger.info(`Rating için Google Play Reviews API çağrılıyor. reviewsFunction: ${typeof reviewsFunction}`);
      const reviewsResult = await reviewsFunction(options);
      
      // Sonuçları logla
      logger.info(`Rating için dönen veri yapısı: ${typeof reviewsResult}, Array mi: ${Array.isArray(reviewsResult)}`);
      
      // Veri formatına göre işlem yap ve derecelendirmeye göre filtrele
      let allReviews = [];
      
      if (Array.isArray(reviewsResult)) {
        // Doğrudan dizi döndüyse
        allReviews = reviewsResult;
        logger.info(`Toplam ${allReviews.length} adet yorum bulundu (dizi olarak)`);
      } else if (reviewsResult && reviewsResult.data && Array.isArray(reviewsResult.data)) {
        // { data: [...] } formatında döndüyse
        allReviews = reviewsResult.data;
        logger.info(`Toplam ${allReviews.length} adet yorum bulundu (data içinde)`);
      } else if (reviewsResult && typeof reviewsResult === 'object') {
        // Object döndüyse ve data formatında değilse
        logger.info('Rating için dönen obje formatı inceleniyor');
        logger.info(`Object anahtarları: ${Object.keys(reviewsResult).join(', ')}`);
        
        // reviews veya results gibi bir anahtar var mı kontrol et
        if (reviewsResult.reviews && Array.isArray(reviewsResult.reviews)) {
          allReviews = reviewsResult.reviews;
          logger.info(`Toplam ${allReviews.length} adet yorum bulundu (reviews içinde)`);
        } else if (reviewsResult.results && Array.isArray(reviewsResult.results)) {
          allReviews = reviewsResult.results;
          logger.info(`Toplam ${allReviews.length} adet yorum bulundu (results içinde)`);
        } else if (reviewsResult.data && Array.isArray(reviewsResult.data)) {
          allReviews = reviewsResult.data;
          logger.info(`Toplam ${allReviews.length} adet yorum bulundu (data içinde)`);
        } else if (reviewsResult.items && Array.isArray(reviewsResult.items)) {
          allReviews = reviewsResult.items;
          logger.info(`Toplam ${allReviews.length} adet yorum bulundu (items içinde)`);
        } else if (reviewsResult.comments && Array.isArray(reviewsResult.comments)) {
          allReviews = reviewsResult.comments;
          logger.info(`Toplam ${allReviews.length} adet yorum bulundu (comments içinde)`);
        } else {
          // Eğer başka bir formatta geldiyse, tüm objeyi logla
          logger.error('Beklenmeyen obje formatı:', JSON.stringify(reviewsResult).substring(0, 500));
        }
      } else {
        // Beklenmeyen format
        logger.error('Beklenmeyen veri formatı:', { reviewsResult });
      }
      
      // Veri formatını daha detaylı analiz et
      if (allReviews && allReviews.length > 0) {
        const sampleReview = allReviews[0];
        logger.info(`Rating için örnek yorum veri yapısı: ${JSON.stringify(Object.keys(sampleReview))}`);
        logger.info(`Rating için örnek yorum içeriği: ${JSON.stringify(sampleReview).substring(0, 300)}...`);
        
        // Tarihleri kontrol et
        const dateField = sampleReview.date ? 'date' : (sampleReview.at ? 'at' : 'unknown');
        logger.info(`Rating yorumları tarih alanı: ${dateField}, Örnek değer: ${sampleReview[dateField]}`);
      }
      
      // Yorum tarih sıralamasını kesin olarak uygula
      if (sort === 'newest' || !sort) {
        try {
          logger.info('Rating için yorumlar tarih sıralaması uygulanıyor...');
          allReviews.sort((a, b) => {
            // Yorum tarihlerini karşılaştır
            const dateA = new Date(a.date || a.at || 0);
            const dateB = new Date(b.date || b.at || 0);
            return dateB - dateA; // En yeni yorumlar önce (azalan)
          });
          logger.info('Rating için tarih sıralaması başarıyla uygulandı.');
        } catch (sortErr) {
          logger.error('Rating için yorum sıralama hatası:', sortErr);
        }
      }
      
      // Derecelendirmeye göre filtrele
      const filteredReviews = allReviews.filter(review => Math.round(review.score) === rating);
      logger.info(`${rating} yıldız için filtrelenen yorum sayısı: ${filteredReviews.length}`);
      
      // Limit kadar veri döndür
      const limitedReviews = filteredReviews.slice(0, parseInt(limit));
      
      return res.json({
        success: true,
        data: limitedReviews
      });
    } catch (apiError) {
      logger.error(`Google Play Rating Reviews API hatası: ${apiError.message}`);
      
      // API hatası durumunda hata mesajı döndür
      return res.status(503).json({
        success: false,
        error: `Android uygulama ${rating} yıldızlı yorumları şu anda çekilemiyor. Servis geçici olarak kullanılamaz durumda.`,
        details: apiError.message
      });
    }
  } catch (error) {
    logger.error(`Android uygulama ${req.params.rating} yıldızlı yorumları alınamadı`, { error: error.message, stack: error.stack });
    
    // Kritik hata durumunda hata mesajı döndür
    return res.status(500).json({
      success: false,
      error: `Android uygulama yorumları alınamadı.`,
      details: error.message
    });
  }
});

module.exports = router;