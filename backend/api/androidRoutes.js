const express = require('express');
const router = express.Router();
const logger = require('../utils/logger');
const { cacheMiddleware } = require('../utils/cache/redisClient');

// Cache TTL değerleri (saniye cinsinden)
const CACHE_TTL = {
  APP_INFO: 60 * 60, // 1 saat
  REVIEWS: 30 * 60, // 30 dakika
  RATING_REVIEWS: 30 * 60 // 30 dakika
};

// Google Play Scraper kütüphanesini import et
const gplay = require('google-play-scraper');

/**
 * Yanıt formatını standardize eden yardımcı fonksiyon
 * @param {Object} data - API'den dönen veri
 * @returns {Object} Standardize edilmiş yanıt
 */
const formatResponse = (data) => ({
  success: true,
  data
});

/**
 * Hata yanıtını standardize eden yardımcı fonksiyon
 * @param {Error} error - Hata objesi
 * @param {number} statusCode - HTTP status kodu
 * @returns {Object} Standardize edilmiş hata yanıtı
 */
const formatError = (error, statusCode = 500) => ({
  success: false,
  error: error.message,
  statusCode
});

/**
 * Dizi formatındaki yorum verilerini standardize eder
 * @param {Array} reviews - Yorumlar dizisi
 * @param {string} sortType - Sıralama türü
 * @returns {Array} Standardize edilmiş yorumlar
 */
const standardizeReviews = (reviews, sortType) => {
  if (!Array.isArray(reviews)) {
    return [];
  }
  
  // Dönen veri formatını analiz et ve standardize et
  const standardizedReviews = reviews.map(review => ({
    id: review.id || '',
    userName: review.userName || review.user || '',
    userImage: review.userImage || '',
    date: review.date || review.at || null,
    score: review.score || 0,
    title: review.title || '',
    text: review.text || review.content || '',
    replyDate: review.replyDate || null,
    replyText: review.replyText || '',
    version: review.version || '',
    thumbsUp: review.thumbsUp || 0,
    url: review.url || ''
  }));
  
  // Sıralama türüne göre sırala
  if (sortType === 'newest') {
    standardizedReviews.sort((a, b) => {
      const dateA = new Date(a.date || 0);
      const dateB = new Date(b.date || 0);
      return dateB - dateA; // En yeni yorumlar önce (azalan)
    });
  }
  
  return standardizedReviews;
};

// Uygulama bilgilerini getir
router.get('/app-info', cacheMiddleware('android:app-info', CACHE_TTL.APP_INFO), async (req, res) => {
  try {
    // Frontend'den gelen ID veya varsayılan ID'yi kullan
    const appId = req.query.appId || process.env.APP_ANDROID_ID || 'com.garantibbvadigitalassets.crypto';
    
    logger.info(`Android uygulama bilgileri isteniyor: ${appId}`);
    
    // API çağrısı yap
    const appInfo = await gplay.app({ 
      appId,
      lang: 'tr',
      country: 'tr'
    });
    
    // Eğer veri yoksa 404 döndür
    if (!appInfo) {
      logger.warn('Android uygulama bilgileri bulunamadı');
      return res.status(404).json(formatError(new Error('Android uygulama bilgileri bulunamadı.'), 404));
    }
    
    // Başarılı yanıt döndür
    return res.json(formatResponse(appInfo));
    
  } catch (error) {
    // Hata mesajını logla
    logger.error('Android uygulama bilgileri alınamadı', { error: error.message });
    
    // Servis hatası olarak yanıt ver
    return res.status(503).json(formatError(
      new Error('Android uygulama bilgileri şu anda çekilemiyor. Servis geçici olarak kullanılamaz durumda.'), 
      503
    ));
  }
});

// Uygulama yorumlarını getir
router.get('/reviews', cacheMiddleware('android:reviews', CACHE_TTL.REVIEWS), async (req, res) => {
  try {
    const appId = req.query.appId || process.env.APP_ANDROID_ID || 'com.garantibbvadigitalassets.crypto';
    const { limit = 100, sort = 'newest' } = req.query;
    
    logger.info(`Android uygulama yorumları isteniyor: ${appId}`, { limit, sort });
    
    // Sıralama parametrelerini ayarla
    let sortValue;
    
    // String olarak girildiyse karşılık gelen sayısal değerleri kullan
    switch (sort) {
      case 'rating':
        sortValue = gplay.sort.RATING; // 3
        break;
      case 'helpfulness':
        sortValue = gplay.sort.HELPFULNESS; // 1
        break;
      case 'relevance':
        sortValue = gplay.sort.RELEVANCE; // 0
        break;
      case 'newest':
      default:
        sortValue = gplay.sort.NEWEST; // 2
        break;
    }
    
    // API çağrısı parametreleri
    const options = {
      appId,
      sort: sortValue,
      num: parseInt(limit),
      lang: 'tr',  // Türkçe yorumlar için
      country: 'tr'  // Türkiye bölgesi
    };
    
    // API çağrısını yap
    const reviewsResult = await gplay.reviews(options);
    
    // Veri formatına göre işlem yap
    let reviews = [];
    
    if (Array.isArray(reviewsResult)) {
      reviews = reviewsResult;
    } else if (reviewsResult && reviewsResult.data && Array.isArray(reviewsResult.data)) {
      reviews = reviewsResult.data;
    } else if (reviewsResult && reviewsResult.reviews && Array.isArray(reviewsResult.reviews)) {
      reviews = reviewsResult.reviews;
    } else if (reviewsResult && reviewsResult.results && Array.isArray(reviewsResult.results)) {
      reviews = reviewsResult.results;
    } else {
      logger.warn('Beklenmeyen yorum veri formatı');
      reviews = [];
    }
    
    // Verileri standardize et
    const standardizedReviews = standardizeReviews(reviews, sort);
    logger.info(`${standardizedReviews.length} adet yorum alındı ve işlendi`);
    
    // Başarılı yanıt döndür
    return res.json(formatResponse(standardizedReviews));
    
  } catch (error) {
    // Hata mesajını logla
    logger.error('Android uygulama yorumları alınamadı', { error: error.message });
    
    // Servis hatası olarak yanıt ver
    return res.status(503).json(formatError(
      new Error('Android uygulama yorumları şu anda çekilemiyor. Servis geçici olarak kullanılamaz durumda.'), 
      503
    ));
  }
});

// Belirli bir derecelendirmedeki yorumları getir
router.get('/reviews/rating/:rating', cacheMiddleware('android:reviews:rating', CACHE_TTL.RATING_REVIEWS), async (req, res) => {
  try {
    const appId = req.query.appId || process.env.APP_ANDROID_ID || 'com.garantibbvadigitalassets.crypto';
    const rating = parseInt(req.params.rating);
    const { limit = 100, sort = 'newest' } = req.query;
    
    // Rating değerini doğrula
    if (rating < 1 || rating > 5) {
      return res.status(400).json(formatError(new Error('Rating 1-5 arasında olmalıdır'), 400));
    }

    logger.info(`Android uygulama ${rating} yıldızlı yorumları isteniyor: ${appId}`, { limit, sort });
    
    // Sıralama parametrelerini ayarla
    let sortValue;
    
    // String olarak girildiyse karşılık gelen sayısal değerleri kullan
    switch (sort) {
      case 'rating':
        sortValue = gplay.sort.RATING; // 3
        break;
      case 'helpfulness':
        sortValue = gplay.sort.HELPFULNESS; // 1
        break;
      case 'relevance':
        sortValue = gplay.sort.RELEVANCE; // 0
        break;
      case 'newest':
      default:
        sortValue = gplay.sort.NEWEST; // 2
        break;
    }
    
    // API çağrısı parametreleri - daha fazla yorum alıp filtreleyeceğiz
    const options = {
      appId,
      sort: sortValue,
      num: parseInt(limit) * 3,  // Filtreleme için fazladan yorum al
      lang: 'tr',  // Türkçe yorumlar için
      country: 'tr'  // Türkiye bölgesi
    };
    
    // API çağrısını yap
    const reviewsResult = await gplay.reviews(options);
    
    // Veri formatına göre işlem yap
    let allReviews = [];
    
    if (Array.isArray(reviewsResult)) {
      allReviews = reviewsResult;
    } else if (reviewsResult && reviewsResult.data && Array.isArray(reviewsResult.data)) {
      allReviews = reviewsResult.data;
    } else if (reviewsResult && reviewsResult.reviews && Array.isArray(reviewsResult.reviews)) {
      allReviews = reviewsResult.reviews;
    } else if (reviewsResult && reviewsResult.results && Array.isArray(reviewsResult.results)) {
      allReviews = reviewsResult.results;
    } else {
      logger.warn('Beklenmeyen yorum veri formatı');
      allReviews = [];
    }
    
    // Verileri standardize et
    const standardizedReviews = standardizeReviews(allReviews, sort);
    
    // Derecelendirmeye göre filtrele
    const filteredReviews = standardizedReviews.filter(review => Math.round(review.score) === rating);
    logger.info(`${rating} yıldız için filtrelenen yorum sayısı: ${filteredReviews.length}`);
    
    // Limit kadar veri döndür
    const limitedReviews = filteredReviews.slice(0, parseInt(limit));
    
    // Başarılı yanıt döndür
    return res.json(formatResponse(limitedReviews));
    
  } catch (error) {
    // Hata mesajını logla
    logger.error(`Android uygulama ${req.params.rating} yıldızlı yorumları alınamadı`, { error: error.message });
    
    // Servis hatası olarak yanıt ver
    return res.status(503).json(formatError(
      new Error(`Android uygulama ${req.params.rating} yıldızlı yorumları şu anda çekilemiyor. Servis geçici olarak kullanılamaz durumda.`), 
      503
    ));
  }
});

module.exports = router;