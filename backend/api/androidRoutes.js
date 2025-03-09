const express = require('express');
const router = express.Router();
const logger = require('../utils/logger');

// Google Play Scraper kütüphanesini import et
const gplayLib = require('google-play-scraper');

// Mock data yok - Gerçek API kullanılıyor

// Uygulama bilgilerini getir
router.get('/app-info', async (req, res) => {
  try {
    // Sadece frontend'den gelen ID veya varsayılan ID'yi kullan
    const appId = req.query.appId || process.env.APP_ANDROID_ID || 'com.garantibbvadigitalassets.crypto';
    
    logger.info(`Android uygulama bilgileri isteniyor: ${appId}`);
    
    try {
      // Kütüphanenin yapısını kontrol et
      logger.info(`Google Play Scraper kütüphanesinin yapısı: ${JSON.stringify(Object.keys(gplayLib))}`);
      
      // Fonksiyon kontrolü
      let appFunction;
      if (gplay && typeof gplay.app === 'function') {
        appFunction = gplay.app;
      } else if (gplayLib.default && typeof gplayLib.default.app === 'function') {
        appFunction = gplayLib.default.app;
      } else {
        throw new Error('google-play-scraper kütüphanesinde app fonksiyonu bulunamadı');
      }
      
      // API çağrısı yap
      const appInfo = await appFunction({ appId: appId });
      
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
      
      // API çağrısı buraya gelecek - doğrudan gplayLib.reviews kullan
      if (typeof gplayLib.reviews !== 'function') {
        logger.error('Google Play Scraper reviews fonksiyonu bulunamadı');
        throw new Error('google-play-scraper kütüphanesinde reviews fonksiyonu bulunamadı');
      }
      
      // API çağrısı - daha özgün parametrelerle
      logger.info(`API çağrısı parametreleri ayarlanıyor...`);
      
      // Sıralama parametrelerini ayarla
      const sortInt = parseInt(sort) || 0; // Direk numara olarak girildiyse
      let sortValue;
      
      if (!isNaN(sortInt) && sortInt >= 0 && sortInt <= 3) {
        sortValue = sortInt;
      } else {
        // String olarak girildiyse
        if (sort.toLowerCase() === 'rating') {
          sortValue = 1;
        } else if (sort.toLowerCase() === 'helpfulness') {
          sortValue = 2;
        } else if (sort.toLowerCase() === 'relevance') {
          sortValue = 3;
        } else {
          // Varsayılan olarak en yeni (newest)
          sortValue = 0;
        }
      }
      
      logger.info(`Kullanılan sıralama parametresi: ${sort} -> ${sortValue}`);
      
      // API çağrısı doğrudan gplayLib.reviews ile yap
      const options = {
        appId: appId,
        sort: sortValue,
        num: parseInt(limit),
        lang: 'tr' // Türkçe yorumlar için
      };
      
      logger.info(`API çağrısı parametreleri: ${JSON.stringify(options)}`);
      const reviews = await gplayLib.reviews(options);
      
      // Log işlemi - detaylı 
      logger.info(`Dönen veri türü: ${typeof reviewsResult}, Array mi: ${Array.isArray(reviewsResult)}`);
      
      if (reviewsResult && typeof reviewsResult === 'object') {
        logger.info(`Dönen veri yapısı: ${JSON.stringify(Object.keys(reviewsResult))}`);
        
        // Data varsa içeriğini kontrol et
        if (reviewsResult.data) {
          logger.info(`Data dizisi uzunluğu: ${reviewsResult.data.length}`);
          
          if (reviewsResult.data.length > 0) {
            logger.info(`İlk yorum: ${JSON.stringify(reviewsResult.data[0])}`);
          } else {
            logger.info('Data dizisi boş');
          }
        }
      }
      
      // Veri yapısını kontrol et ve düzgün yanıt ver
      let responseData;
      
      if (Array.isArray(reviewsResult)) {
        responseData = reviewsResult;
      } else if (reviewsResult && reviewsResult.data && Array.isArray(reviewsResult.data)) {
        responseData = reviewsResult.data;
      } else {
        logger.warn('Beklenmeyen veri formatı, mock veri döndürülüyor');
        responseData = mockReviews;
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
    logger.error('Android uygulama yorumları alınamadı', { error: error.message });
    
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
      
      // API çağrısı doğrudan gplayLib.reviews ile
      if (typeof gplayLib.reviews !== 'function') {
        logger.error('Google Play Scraper reviews fonksiyonu bulunamadı');
        throw new Error('google-play-scraper kütüphanesinde reviews fonksiyonu bulunamadı');
      }
      
      // Sıralama parametrelerini logla
      const sortValue = (sort.toLowerCase() === 'newest') ? 0 :
                       (sort.toLowerCase() === 'rating') ? 1 :
                       (sort.toLowerCase() === 'helpfulness') ? 2 : 0;
      
      logger.info(`Rating için kullanılan sıralama parametresi: ${sort} -> ${sortValue}`);
      
      // API çağrısı doğrudan gplayLib.reviews ile yap - çok sayıda yorum al
      const reviewsResult = await gplayLib.reviews({
        appId: appId,
        sort: sortValue,
        num: parseInt(limit) * 3, // Filtrelemek için daha fazla yorum al
        lang: 'tr' // Türkçe yorumlar için
      });
      
      // Log işlemi - detaylı 
      logger.info(`Rating için dönen veri türü: ${typeof reviewsResult}, Array mi: ${Array.isArray(reviewsResult)}`);
      
      if (reviewsResult && typeof reviewsResult === 'object') {
        logger.info(`Rating için dönen veri yapısı: ${JSON.stringify(Object.keys(reviewsResult))}`);
      }
      
      // Veri yapısına göre işlem yap
      let allReviews = [];
      
      if (Array.isArray(reviewsResult)) {
        allReviews = reviewsResult;
      } else if (reviewsResult && reviewsResult.data && Array.isArray(reviewsResult.data)) {
        allReviews = reviewsResult.data;
      } else {
        logger.warn('Rating için beklenmeyen veri formatı, mock veri üzerinden filtreleniyor');
        allReviews = mockReviews;
      }
      
      // Derecelendirmeye göre filtrele
      const filteredReviews = allReviews.filter(review => Math.round(review.score) === rating);
      
      // Bilgi log'u
      logger.info(`Rating ${rating} için bulunan yorum sayısı: ${filteredReviews.length}`);
      
      // Eğer hiç yorum bulunamadıysa ve TEST_MODE açıksa, filtrelenmiş mock veriler döndür
      if (filteredReviews.length === 0 && TEST_MODE) {
        logger.info('Rating için yorum bulunamadı, mock veriler döndürülüyor');
        const filteredMockReviews = mockReviews.filter(review => Math.round(review.score) === rating);
        return res.json({
          success: true,
          data: filteredMockReviews
        });
      }
      
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
    logger.error(`Android uygulama ${req.params.rating} yıldızlı yorumları alınamadı`, { error: error.message });
    
    // Kritik hata durumunda hata mesajı döndür
    return res.status(500).json({
      success: false,
      error: `Android uygulama ${rating} yıldızlı yorumları alınamadı.`,
      details: error.message
    });
  }
});

module.exports = router;