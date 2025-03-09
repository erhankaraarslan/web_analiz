const express = require('express');
const router = express.Router();
const logger = require('../utils/logger');

// App Store Scraper'ı import et
const appstore = require('app-store-scraper');

// Uygulama bilgilerini getir
router.get('/app-info', async (req, res) => {
  try {
    // Frontend'den gelen appId parametresini kontrol et
    const appId = req.query.appId || process.env.APP_IOS_ID || '6470199333';
    const country = req.query.country || 'tr';

    logger.info(`iOS uygulama bilgileri isteniyor: ${appId}`, { country });
    
    try {
      // Gerçek API çağrısı
      const appInfo = await appstore.app({
        id: appId, // Frontend'den gelen appId parametresi burada 'id' olarak kullanılıyor
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

// Uygulama yorumlarını getir
router.get('/reviews', async (req, res) => {
  try {
    // Frontend'den gelen appId parametresini kontrol et
    const appId = req.query.appId || process.env.APP_IOS_ID || '6470199333';
    const { page = 1, sort = 'recent', country = 'tr' } = req.query;

    logger.info(`iOS uygulama yorumları isteniyor: ${appId}`, { page, sort, country });
    
    try {
      // Sort değerleri manuel olarak
      const sortValue = sort.toLowerCase() === 'recent' ? 0 : 
                        sort.toLowerCase() === 'helpful' ? 1 :
                        sort.toLowerCase() === 'rating' ? 2 : 0; // Varsayılan recent
      
      // API çağrısı
      const reviews = await appstore.reviews({
        id: appId, // Frontend'den gelen appId parametresi burada 'id' olarak kullanılıyor
        page: parseInt(page),
        sort: sortValue,
        country: country
      });
      
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
router.get('/reviews/all', async (req, res) => {
  try {
    // Frontend'den gelen appId parametresini kontrol et
    const appId = req.query.appId || process.env.APP_IOS_ID || '6470199333';
    const { maxPages = 10, sort = 'recent', country = 'tr' } = req.query;

    logger.info(`iOS tüm uygulama yorumları isteniyor: ${appId}`, { maxPages, sort, country });
    
    try {
      // Sort değerleri manuel olarak
      const sortValue = sort.toLowerCase() === 'recent' ? 0 : 
                        sort.toLowerCase() === 'helpful' ? 1 :
                        sort.toLowerCase() === 'rating' ? 2 : 0; // Varsayılan recent
      
      // Gerçek API çağrısı
      let allReviews = [];
      let page = 1;
      let hasMoreReviews = true;

      // Belirlenen maksimum sayfa sayısına ulaşana veya yorumlar bitene kadar topla
      while (hasMoreReviews && page <= parseInt(maxPages)) {
        const reviews = await appstore.reviews({
          id: appId, // Frontend'den gelen appId parametresi burada 'id' olarak kullanılıyor
          page: page,
          sort: sortValue,
          country
        });
        
        if (reviews.length === 0) {
          hasMoreReviews = false;
        } else {
          allReviews = [...allReviews, ...reviews];
          page++;
        }
      }

      res.json({
        success: true,
        data: allReviews,
        totalPages: page - 1
      });
    } catch (apiError) {
      logger.error(`App Store All Reviews API hatası: ${apiError.message}`);
      
      // API hatası durumunda 503 hata kodu döndür
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
router.get('/reviews/rating/:rating', async (req, res) => {
  try {
    // Frontend'den gelen appId parametresini kontrol et
    const appId = req.query.appId || process.env.APP_IOS_ID || '6470199333';
    const { maxPages = 5, sort = 'recent', country = 'tr' } = req.query;
    const rating = parseInt(req.params.rating);
    
    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        error: 'Rating 1-5 arasında olmalıdır'
      });
    }

    logger.info(`iOS uygulama ${rating} yıldızlı yorumları isteniyor: ${appId}`, { maxPages, sort, country, rating });
    
    try {
      // Sort değerleri manuel olarak
      const sortValue = sort.toLowerCase() === 'recent' ? 0 : 
                        sort.toLowerCase() === 'helpful' ? 1 :
                        sort.toLowerCase() === 'rating' ? 2 : 0; // Varsayılan recent
      
      // Gerçek API çağrısı
      let allReviews = [];
      let page = 1;
      let hasMoreReviews = true;

      // Belirlenen maksimum sayfa sayısına ulaşana veya yorumlar bitene kadar topla
      while (hasMoreReviews && page <= parseInt(maxPages)) {
        const reviews = await appstore.reviews({
          id: appId, // Frontend'den gelen appId parametresi burada 'id' olarak kullanılıyor
          page: page,
          sort: sortValue,
          country
        });
        
        if (reviews.length === 0) {
          hasMoreReviews = false;
        } else {
          // Derecelendirmeye göre filtrele
          const filteredReviews = reviews.filter(review => Math.round(review.score) === rating);
          allReviews = [...allReviews, ...filteredReviews];
          page++;
        }
      }

      res.json({
        success: true,
        data: allReviews,
        totalPages: page - 1
      });
    } catch (apiError) {
      logger.error(`App Store Rating Reviews API hatası: ${apiError.message}`);
      
      // API hatası durumunda 503 hata kodu döndür
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