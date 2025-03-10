const express = require('express');
const router = express.Router();
const logger = require('../utils/logger');
const { clearCacheByPrefix, clearAllCache } = require('../utils/cache/redisClient');

// Güvenlik kontrolü middleware
const authMiddleware = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  
  // API anahtarı yoksa veya .env'deki anahtar ile eşleşmiyorsa
  if (!apiKey || apiKey !== process.env.ADMIN_API_KEY) {
    logger.warn('Yetkisiz cache işlem girişimi', {
      ip: req.ip,
      path: req.path
    });
    
    return res.status(401).json({
      success: false,
      error: 'Bu işlem için yetkiniz bulunmamaktadır'
    });
  }
  
  next();
};

// Belirli bir önekle önbelleği temizle
router.delete('/clear/:prefix', authMiddleware, async (req, res) => {
  try {
    const { prefix } = req.params;
    
    if (!prefix) {
      return res.status(400).json({
        success: false,
        error: 'Cache öneki belirtilmelidir'
      });
    }
    
    logger.info(`${prefix} önekiyle cache temizleme isteği alındı`);
    
    // Cache'i temizle
    const clearedCount = await clearCacheByPrefix(prefix);
    
    return res.json({
      success: true,
      message: `${clearedCount} adet cache öğesi başarıyla temizlendi`,
      clearedCount,
      prefix
    });
  } catch (error) {
    logger.error('Cache temizleme hatası', { error: error.message });
    
    return res.status(500).json({
      success: false,
      error: 'Cache temizlenirken bir hata oluştu',
      details: error.message
    });
  }
});

// Tüm önbelleği temizle
router.delete('/clear-all', authMiddleware, async (req, res) => {
  try {
    // Sadece geliştirme ortamında çalışsın
    if (process.env.NODE_ENV !== 'development') {
      return res.status(403).json({
        success: false,
        error: 'Bu işlem sadece geliştirme ortamında kullanılabilir'
      });
    }
    
    logger.warn('Tüm cache temizleme isteği alındı', {
      ip: req.ip,
      user: req.user
    });
    
    // Tüm cache'i temizle
    const result = await clearAllCache();
    
    if (result) {
      return res.json({
        success: true,
        message: 'Tüm cache başarıyla temizlendi'
      });
    } else {
      return res.status(500).json({
        success: false,
        error: 'Cache temizlenirken bir hata oluştu'
      });
    }
  } catch (error) {
    logger.error('Tüm cache temizleme hatası', { error: error.message });
    
    return res.status(500).json({
      success: false,
      error: 'Cache temizlenirken bir hata oluştu',
      details: error.message
    });
  }
});

// Cache durumunu kontrol et
router.get('/status', async (req, res) => {
  try {
    // Cache durumunu kontrol et
    const isRedisConnected = require('../utils/cache/redisClient').client.connected;
    
    return res.json({
      success: true,
      status: {
        connected: isRedisConnected,
        enabled: isRedisConnected
      }
    });
  } catch (error) {
    logger.error('Cache durumu kontrolü hatası', { error: error.message });
    
    return res.status(500).json({
      success: false,
      error: 'Cache durumu kontrol edilirken bir hata oluştu',
      details: error.message
    });
  }
});

module.exports = router;
