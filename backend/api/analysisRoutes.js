const express = require('express');
const router = express.Router();
const { AIProviderFactory } = require('../utils/aiProviders');
const logger = require('../utils/logger');

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
    
    // Duygu analizi yap
    const result = await aiProvider.analyzeSentiment(reviews);
    
    res.json({
      success: true,
      data: { result }
    });
  } catch (error) {
    logger.error('Duygu analizi başarısız oldu', { error: error.message });
    res.status(500).json({
      success: false,
      error: error.message
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
    
    // Persona analizi yap
    const result = await aiProvider.createPersonas(reviews);
    
    res.json({
      success: true,
      data: { result }
    });
  } catch (error) {
    logger.error('Kullanıcı persona analizi başarısız oldu', { error: error.message });
    res.status(500).json({
      success: false,
      error: error.message
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
    
    // İyileştirme önerileri oluştur
    const result = await aiProvider.generateImprovementRecommendations(reviews);
    
    res.json({
      success: true,
      data: { result }
    });
  } catch (error) {
    logger.error('İyileştirme önerileri analizi başarısız oldu', { error: error.message });
    res.status(500).json({
      success: false,
      error: error.message
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
    
    // Tüm analizleri paralel olarak yap
    const [sentimentAnalysis, personas, improvements] = await Promise.all([
      aiProvider.analyzeSentiment(reviews),
      aiProvider.createPersonas(reviews),
      aiProvider.generateImprovementRecommendations(reviews)
    ]);
    
    res.json({
      success: true,
      data: {
        sentimentAnalysis,
        personas,
        improvements
      }
    });
  } catch (error) {
    logger.error('Tam analiz başarısız oldu', { error: error.message });
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;