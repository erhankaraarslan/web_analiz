// Çevre değişkenlerini yükle
require('dotenv').config();

// Globals ve imports
const isProduction = process.env.NODE_ENV === 'production';

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const logger = require('./utils/logger');

// API rotalarını içe aktar
// const androidRoutes = require('./api/androidRoutes');
// const androidRoutes = require('./api/androidRoutesNew'); // Eski düzenlenmiş router
// const androidRoutes = require('./api/androidRoutesFixed'); // Mock veri kullanan router
const androidRoutes = require('./api/androidRoutesNoMock'); // Mock veri kullanmayan router
const iosRoutes = require('./api/iosRoutes');
const analysisRoutes = require('./api/analysisRoutes');
const cacheRoutes = require('./api/cacheRoutes');

// Google Play Scraper kütüphanesinin durumunu logla
const gplayLib = require('google-play-scraper');
logger.info(`Server başlatma sırasında Google Play Scraper kütüphanesinin anahtarları: ${Object.keys(gplayLib).join(', ')}`);
if (gplayLib.default) {
  logger.info(`Default anahtarları: ${Object.keys(gplayLib.default).join(', ')}`);
}

// Express uygulaması oluştur
const app = express();

// Middleware'ler
app.use(helmet()); // Güvenlik için HTTP başlıklarını ayarlar
app.use(cors()); // Cross-Origin isteklerine izin ver
app.use(express.json({ limit: '10mb' })); // JSON parsing with larger limit for analysis
app.use(express.urlencoded({ extended: true, limit: '10mb' })); // Form data parsing

// API rotaları
app.use('/api/android', androidRoutes);
app.use('/api/ios', iosRoutes);
app.use('/api/analysis', analysisRoutes);
app.use('/api/cache', cacheRoutes);

// Sağlık kontrolü ve sistem durumu
app.get('/health', (req, res) => {
  // Redis bağlantısını kontrol et
  const redisClient = require('./utils/cache/redisClient').client;
  const isRedisConnected = redisClient ? redisClient.connected : false;

  res.status(200).json({
    status: 'ok',
    timestamp: new Date(),
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    services: {
      redis: {
        status: isRedisConnected ? 'connected' : 'disconnected',
        enabled: process.env.REDIS_ENABLED === 'true'
      }
    }
  });
});

// Varsayılan port veya 8080
const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
  console.log(`Server running on port ${PORT}`);
});

// Hatayı yakala ve logla
process.on('unhandledRejection', (err) => {
  logger.error(`Unhandled Rejection: ${err.message}`, { stack: err.stack });
  console.error('Unhandled Rejection:', err);
});

module.exports = app; // Test için export