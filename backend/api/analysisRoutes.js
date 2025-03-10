const express = require('express');
const router = express.Router();
const { AIProviderFactory } = require('../utils/aiProviders');
const logger = require('../utils/logger');
const { getCache, setCache, createCacheKey } = require('../utils/cache/redisClient');

// Cache TTL değerleri (saniye cinsinden)
const CACHE_TTL = {
  SENTIMENT: 24 * 60 * 60, // 24 saat
  PERSONAS: 24 * 60 * 60, // 24 saat
  IMPROVEMENTS: 24 * 60 * 60, // 24 saat
  FULL_ANALYSIS: 24 * 60 * 60 // 24 saat
};

// Manual cache kontrolü yapan yardımcı fonksiyon
const withCache = async (req, res, cachePrefix, ttl, asyncOperation) => {
  try {
    const { platform, provider = 'openai' } = req.body;
    
    // Eğer Redis kapalıysa işlemi direkt yap
    if (process.env.REDIS_ENABLED !== 'true') {
      logger.info(`Cache kapalı, analiz doğrudan yapılıyor: ${cachePrefix}`);
      return await asyncOperation();
    }
    
    // Yorumların bir hash'ini oluştur
    const reviewsHash = req.body.reviews
      ? createReviewsHash(req.body.reviews)
      : 'no-reviews';
    
    // Cache key oluştur
    const cacheKey = createCacheKey(cachePrefix, { 
      platform,
      provider,
      hash: reviewsHash
    });
    
    // Cache kontrol et
    const cachedData = await getCache(cacheKey);
    
    if (cachedData) {
      logger.info(`Cache hit: ${cachePrefix} for ${platform} using ${provider}`);
      return res.status(200).json(cachedData);
    }
    
    // Cache miss - işlemi yap
    logger.info(`Cache miss: ${cachePrefix} for ${platform} using ${provider}`);
    
    // Uzun analiz işlemleri için timeout'u artıralım
    res.setTimeout(300000, () => {
      logger.warn(`Analiz işlemi timeout süresi aşıldı: ${cachePrefix}`);
    });
    
    // İşlemi gerçekleştir
    const result = await asyncOperation();
    
    // asyncOperation içinde doğrudan yanıt döndürürülmesi durumunda, fonksiyonu sonlandır
    if (!result) return;
    
    // Sonuçları cache'e kaydet
    await setCache(cacheKey, result, ttl);
    
    if (typeof result === 'object' && !res.headersSent) {
      return res.json(result);
    }
    
    return result;
  } catch (error) {
    // Hata durumunu işle
    logger.error(`Cache operation error: ${error.message}`, { stack: error.stack });
    throw error;
  }
};

// Yorumların hash'ini oluşturan yardımcı fonksiyon
const createReviewsHash = (reviews) => {
  if (!reviews || !Array.isArray(reviews)) {
    return 'invalid';
  }
  
  // Tüm yorum ID'lerini ve tarihlerini birleştirip hash oluştur
  const reviewIdentifiers = reviews.map(review => {
    const id = review.id || review.reviewId || '';
    const date = review.date || review.at || '';
    const score = review.score || review.rating || 0;
    return `${id}-${date}-${score}`;
  }).sort().join('|');
  
  // Basit bir hash fonksiyonu
  let hash = 0;
  for (let i = 0; i < reviewIdentifiers.length; i++) {
    const char = reviewIdentifiers.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // 32bit integer'a çevir
  }
  
  return hash.toString(16);
};

// Duygu analizi yap
router.post('/sentiment', async (req, res) => {
  try {
    const { reviews, platform, provider = 'openai' } = req.body;
    
    if (!reviews || !Array.isArray(reviews) || reviews.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Geçerli bir reviews dizisi sağlanmalıdır'
      });
    }

    // API anahtarını al
    const apiKey = req.headers['x-api-key'];
    if (!apiKey) {
      return res.status(401).json({
        success: false,
        error: 'API anahtarı eksik'
      });
    }

    logger.info(`Duygu analizi isteniyor`, { platform, provider, reviewCount: reviews.length });
    
    // AI sağlayıcıyı oluştur
    const aiProvider = AIProviderFactory.getProvider(provider);
    
    // API anahtarını ayarla
    process.env.OPENAI_API_KEY = apiKey;
    
    return await withCache(req, res, 'analysis:sentiment', CACHE_TTL.SENTIMENT, async () => {
      // Duygu analizi yap
      const result = await aiProvider.analyzeSentiment(reviews);
      
      return {
        success: true,
        data: { result }
      };
    });
  } catch (error) {
    logger.error('Duygu analizi başarısız oldu', { error: error.message });
    // Hata detaylarını JSON formatında gönder
    const errorDetail = {
      error: error.message,
      service: "review-analyzer",
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19)
    };
    
    // Özel hata mesajı formatı oluştur
    const errorMessage = `OpenAI ile duygu analizi başarısız oldu ${JSON.stringify(errorDetail)}`;
    
    res.status(500).json({
      success: false,
      error: errorMessage
    });
  }
});

// Kullanıcı personası oluştur
router.post('/personas', async (req, res) => {
  try {
    const { reviews, platform, provider = 'openai' } = req.body;
    
    if (!reviews || !Array.isArray(reviews) || reviews.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Geçerli bir reviews dizisi sağlanmalıdır'
      });
    }

    // API anahtarını al
    const apiKey = req.headers['x-api-key'];
    if (!apiKey) {
      return res.status(401).json({
        success: false,
        error: 'API anahtarı eksik'
      });
    }

    logger.info(`Kullanıcı persona analizi isteniyor`, { platform, provider, reviewCount: reviews.length });
    
    // AI sağlayıcıyı oluştur
    const aiProvider = AIProviderFactory.getProvider(provider);
    
    // API anahtarını ayarla
    process.env.OPENAI_API_KEY = apiKey;
    
    return await withCache(req, res, 'analysis:personas', CACHE_TTL.PERSONAS, async () => {
      // Persona analizi yap
      const result = await aiProvider.createPersonas(reviews);
      
      return {
        success: true,
        data: { result }
      };
    });
  } catch (error) {
    logger.error('Kullanıcı persona analizi başarısız oldu', { error: error.message });
    // Hata detaylarını JSON formatında gönder
    const errorDetail = {
      error: error.message,
      service: "review-analyzer",
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19)
    };
    
    // Özel hata mesajı formatı oluştur
    const errorMessage = `OpenAI ile persona analizi başarısız oldu ${JSON.stringify(errorDetail)}`;
    
    res.status(500).json({
      success: false,
      error: errorMessage
    });
  }
});

// İyileştirme önerileri oluştur
router.post('/improvements', async (req, res) => {
  try {
    const { reviews, platform, provider = 'openai' } = req.body;
    
    if (!reviews || !Array.isArray(reviews) || reviews.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Geçerli bir reviews dizisi sağlanmalıdır'
      });
    }

    // API anahtarını al
    const apiKey = req.headers['x-api-key'];
    if (!apiKey) {
      return res.status(401).json({
        success: false,
        error: 'API anahtarı eksik'
      });
    }

    logger.info(`İyileştirme önerileri analizi isteniyor`, { platform, provider, reviewCount: reviews.length });
    
    // AI sağlayıcıyı oluştur
    const aiProvider = AIProviderFactory.getProvider(provider);
    
    // API anahtarını ayarla
    process.env.OPENAI_API_KEY = apiKey;
    
    return await withCache(req, res, 'analysis:improvements', CACHE_TTL.IMPROVEMENTS, async () => {
      // İyileştirme önerileri oluştur
      const result = await aiProvider.generateImprovementRecommendations(reviews);
      
      return {
        success: true,
        data: { result }
      };
    });
  } catch (error) {
    logger.error('İyileştirme önerileri analizi başarısız oldu', { error: error.message });
    // Hata detaylarını JSON formatında gönder
    const errorDetail = {
      error: error.message,
      service: "review-analyzer",
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19)
    };
    
    // Özel hata mesajı formatı oluştur
    const errorMessage = `OpenAI ile öneri analizi başarısız oldu ${JSON.stringify(errorDetail)}`;
    
    res.status(500).json({
      success: false,
      error: errorMessage
    });
  }
});

// Tüm analizleri bir arada yap
router.post('/full-analysis', async (req, res) => {
  try {
    const { reviews, platform, provider = 'openai' } = req.body;
    
    if (!reviews || !Array.isArray(reviews) || reviews.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Geçerli bir reviews dizisi sağlanmalıdır'
      });
    }

    // API anahtarını al
    const apiKey = req.headers['x-api-key'];
    if (!apiKey) {
      return res.status(401).json({
        success: false,
        error: 'API anahtarı eksik'
      });
    }

    logger.info(`Tam analiz isteniyor`, { platform, provider, reviewCount: reviews.length });
    
    // AI sağlayıcıyı oluştur
    const aiProvider = AIProviderFactory.getProvider(provider);
    
    // API anahtarını ayarla
    process.env.OPENAI_API_KEY = apiKey;
    
    return await withCache(req, res, 'analysis:full', CACHE_TTL.FULL_ANALYSIS, async () => {
      // Tüm analizleri paralel olarak yap
      logger.info('Paralel olarak tüm analizler yapılıyor', { platform, provider, reviewCount: reviews.length });
      
      try {
        const [sentimentAnalysis, personas, improvements] = await Promise.all([
          aiProvider.analyzeSentiment(reviews),
          aiProvider.createPersonas(reviews),
          aiProvider.generateImprovementRecommendations(reviews)
        ]);
        
        logger.info('Tüm analizler başarıyla tamamlandı', { platform, provider });
        
        return res.status(200).json({
          success: true,
          data: {
            sentimentAnalysis,
            personas,
            improvements
          }
        });
      } catch (error) {
        logger.error('Analizlerden biri başarısız oldu', { error: error.message });
        throw error;
      }
    });
  } catch (error) {
    logger.error('Tam analiz başarısız oldu', { error: error.message });
    // Hata detaylarını JSON formatında gönder
    const errorDetail = {
      error: error.message,
      service: "review-analyzer",
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19)
    };
    
    // Özel hata mesajı formatı oluştur
    const errorMessage = `OpenAI ile tam analiz başarısız oldu ${JSON.stringify(errorDetail)}`;
    
    res.status(500).json({
      success: false,
      error: errorMessage
    });
  }
});

module.exports = router;