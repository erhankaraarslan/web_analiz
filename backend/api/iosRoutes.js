const express = require('express');
const router = express.Router();
const logger = require('../utils/logger');
const { cacheMiddleware, getCache, setCache, createCacheKey } = require('../utils/cache/redisClient');

// Cache TTL değerleri (saniye cinsinden)
const CACHE_TTL = {
  APP_INFO: 60 * 60, // 1 saat
  REVIEWS: 30 * 60, // 30 dakika
  ALL_REVIEWS: 60 * 60, // 1 saat
  RATING_REVIEWS: 30 * 60 // 30 dakika
};

// App Store Scraper'ı import et
const store = require('app-store-scraper');

// Uygulama bilgilerini getir
router.get('/app-info', cacheMiddleware('ios:app-info', CACHE_TTL.APP_INFO), async (req, res) => {
  try {
    // Frontend'den gelen appId parametresini kontrol et
    const appId = req.query.appId || process.env.APP_IOS_ID || '6470199333';
    const country = req.query.country || 'tr';

    logger.info(`iOS uygulama bilgileri isteniyor: ${appId}`, { country });
    
    try {
      // Gerçek API çağrısı
      const appInfo = await store.app({
        id: appId,
        country: country
      });
      
      res.json({
        success: true,
        data: appInfo
      });
    } catch (apiError) {
      logger.error(`App Store API hatası: ${apiError.message}`);
      
      // API hatası durumunda 503 hata kodu döndür
      res.status(503).json({
        success: false,
        error: 'iOS uygulama bilgileri şu anda çekilemiyor. Servis geçici olarak kullanılamaz durumda.',
        details: apiError.message
      });
    }
  } catch (error) {
    logger.error('iOS uygulama bilgileri alınamadı', { error: error.message });
    
    res.status(500).json({
      success: false,
      error: 'iOS uygulama bilgileri çekilemedi. Lütfen daha sonra tekrar deneyin.',
      details: error.message
    });
  }
});

// Uygulama yorumlarını getir - Doğrudan çalışan örnek kodu kullan
router.get('/reviews', cacheMiddleware('ios:reviews', CACHE_TTL.REVIEWS), async (req, res) => {
  try {
    // Frontend'den gelen parametrelerini kontrol et
    const appId = req.query.appId || process.env.APP_IOS_ID || '6470199333';
    const { sort = 'recent', country = 'tr' } = req.query;
    const limit = parseInt(req.query.limit || '100');

    logger.info(`iOS uygulama yorumları isteniyor: ${appId}`, { sort, country, limit });
    
    try {
      // Birebir test kodundaki gibi kullan
      const reviewOptions = {
        id: appId,
        country: country,
        sort: store.sort.RECENT, // Default en yeni
        num: limit
      };
      
      // Sort değerini belirle
      if (sort.toLowerCase() === 'helpful') {
        reviewOptions.sort = store.sort.HELPFUL;
      } else if (sort.toLowerCase() === 'rating') {
        reviewOptions.sort = store.sort.RATING;
      }
      
      logger.info(`API çağrısı yapılıyor. Parametreler: ${JSON.stringify(reviewOptions)}`);
      
      // API çağrısını yap
      const reviews = await store.reviews(reviewOptions);
      
      // Örnek bir yorumu logla
      if (reviews && reviews.length > 0) {
        logger.info(`iOS reviews örnek veri yapısı: ${JSON.stringify(reviews[0])}`);
        logger.info(`reviews[0].updated alanı: ${reviews[0].updated || 'YOK'}`);
        logger.info(`Tüm örnek alanlar: ${Object.keys(reviews[0]).join(', ')}`);
      }
      
      // Yorumları doğrudan döndür - hiçbir işlem yapmadan!
      res.json({
        success: true,
        data: reviews
      });
    } catch (apiError) {
      logger.error(`App Store Reviews API hatası: ${apiError.message}`);
      
      // API hatası durumunda 503 hata kodu döndür
      res.status(503).json({
        success: false,
        error: 'iOS uygulama yorumları şu anda çekilemiyor. Servis geçici olarak kullanılamaz durumda.',
        details: apiError.message
      });
    }
  } catch (error) {
    logger.error('iOS uygulama yorumları alınamadı', { error: error.message });
    
    res.status(500).json({
      success: false,
      error: 'iOS uygulama yorumları çekilemedi. Lütfen daha sonra tekrar deneyin.',
      details: error.message
    });
  }
});

// Tüm yorumları getir (birden fazla sayfayı birleştirerek)
router.get('/reviews/all', cacheMiddleware('ios:reviews:all', CACHE_TTL.ALL_REVIEWS), async (req, res) => {
  try {
    // Frontend'den gelen parametreleri kontrol et
    const appId = req.query.appId || process.env.APP_IOS_ID || '6470199333';
    const { sort = 'recent', country = 'tr' } = req.query;
    const maxPages = parseInt(req.query.maxPages || '10');
    const perPage = 100; // Her sayfada kaç yorum alınacak

    logger.info(`iOS tüm uygulama yorumları isteniyor: ${appId}`, { maxPages, sort, country });
    
    try {
      // Tüm yorumları toplamak için dizi
      let allReviews = [];
      
      // Birebir test kodundaki gibi kullan
      const reviewOptions = {
        id: appId,
        country: country,
        sort: store.sort.RECENT, // Default en yeni
        num: perPage
      };
      
      // Sort değerini belirle
      if (sort.toLowerCase() === 'helpful') {
        reviewOptions.sort = store.sort.HELPFUL;
      } else if (sort.toLowerCase() === 'rating') {
        reviewOptions.sort = store.sort.RATING;
      }
      
      logger.info(`API çağrısı yapılıyor. Parametreler: ${JSON.stringify(reviewOptions)}`);
      
      // API çağrısını yap
      const reviews = await store.reviews(reviewOptions);
      
      // Örnek bir yorumu logla
      if (reviews && reviews.length > 0) {
        logger.info(`iOS all reviews örnek veri yapısı: ${JSON.stringify(reviews[0])}`);
        logger.info(`all reviews[0].updated alanı: ${reviews[0].updated || 'YOK'}`);
        logger.info(`Tüm örnek alanlar: ${Object.keys(reviews[0]).join(', ')}`);
        
        // Tarih alanı varlığını ve formatını kontrol et ve logla
        const sampleReview = reviews[0];
        if (sampleReview.updated) {
          logger.info(`Örnek updated değeri: ${sampleReview.updated} (${typeof sampleReview.updated})`);
        }
        if (sampleReview.date) {
          logger.info(`Örnek date değeri: ${sampleReview.date} (${typeof sampleReview.date})`);
        }
      }
      
      // Yorumları ekle
      allReviews = [...reviews];
      
      // Tarihleri düzgün formatta olduğundan emin ol
      allReviews = allReviews.map(review => {
        // Tarih bilgisi yoksa, oluşturulma zamanını ekle
        if (!review.updated && !review.date) {
          review.updated = new Date().toISOString();
        }
        return review;
      });
      
      res.json({
        success: true,
        data: allReviews,
        totalPages: 1 // Tek sayfa döndürüldüğü için
      });
    } catch (apiError) {
      logger.error(`App Store All Reviews API hatası: ${apiError.message}`);
      
      res.status(503).json({
        success: false,
        error: 'iOS tüm uygulama yorumları şu anda çekilemiyor. Servis geçici olarak kullanılamaz durumda.',
        details: apiError.message
      });
    }
  } catch (error) {
    logger.error('iOS tüm uygulama yorumları alınamadı', { error: error.message });
    
    res.status(500).json({
      success: false,
      error: 'iOS tüm uygulama yorumları çekilemedi. Lütfen daha sonra tekrar deneyin.',
      details: error.message
    });
  }
});

// Belirli bir derecelendirmedeki yorumları getir
router.get('/reviews/rating/:rating', cacheMiddleware('ios:reviews:rating', CACHE_TTL.RATING_REVIEWS), async (req, res) => {
  try {
    // Frontend'den gelen parametreleri kontrol et
    const appId = req.query.appId || process.env.APP_IOS_ID || '6470199333';
    const { sort = 'recent', country = 'tr' } = req.query;
    const perPage = 100; // Her sayfada kaç yorum alınacak
    const rating = parseInt(req.params.rating);
    
    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        error: 'Rating 1-5 arasında olmalıdır'
      });
    }

    logger.info(`iOS uygulama ${rating} yıldızlı yorumları isteniyor: ${appId}`, { sort, country, rating });
    
    try {
      // Birebir test kodundaki gibi kullan
      const reviewOptions = {
        id: appId,
        country: country,
        sort: store.sort.RECENT, // Default en yeni
        num: perPage * 2 // Filtreleme için daha fazla yorum al
      };
      
      // Sort değerini belirle
      if (sort.toLowerCase() === 'helpful') {
        reviewOptions.sort = store.sort.HELPFUL;
      } else if (sort.toLowerCase() === 'rating') {
        reviewOptions.sort = store.sort.RATING;
      }
      
      logger.info(`Rating API çağrısı yapılıyor. Parametreler: ${JSON.stringify(reviewOptions)}`);
      
      // API çağrısını yap
      const reviews = await store.reviews(reviewOptions);
      
      // Derecelendirmeye göre filtrele
      const filteredReviews = reviews.filter(review => Math.round(review.score) === rating);
      
      // Örnek bir yorumu logla (eğer varsa)
      if (filteredReviews && filteredReviews.length > 0) {
        logger.info(`iOS rating reviews örnek veri yapısı: ${JSON.stringify(filteredReviews[0])}`);
        logger.info(`rating reviews[0].updated alanı: ${filteredReviews[0].updated || 'YOK'}`);
        logger.info(`Tüm örnek alanlar: ${Object.keys(filteredReviews[0]).join(', ')}`);
      }
      
      res.json({
        success: true,
        data: filteredReviews,
        totalPages: 1 // Tek sayfa döndürüldüğü için
      });
    } catch (apiError) {
      logger.error(`App Store Rating Reviews API hatası: ${apiError.message}`);
      
      res.status(503).json({
        success: false,
        error: `iOS uygulama ${rating} yıldızlı yorumları şu anda çekilemiyor. Servis geçici olarak kullanılamaz durumda.`,
        details: apiError.message
      });
    }
  } catch (error) {
    logger.error(`iOS uygulama ${req.params.rating} yıldızlı yorumları alınamadı`, { error: error.message });
    
    res.status(500).json({
      success: false,
      error: `iOS uygulama ${req.params.rating} yıldızlı yorumları çekilemedi. Lütfen daha sonra tekrar deneyin.`,
      details: error.message
    });
  }
});

module.exports = router;