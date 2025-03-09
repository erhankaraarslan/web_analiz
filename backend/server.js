// Çevre değişkenlerini yükle
require('dotenv').config();

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
app.use(express.json()); // JSON parsing

// API rotaları
app.use('/api/android', androidRoutes);
app.use('/api/ios', iosRoutes);
app.use('/api/analysis', analysisRoutes);

// Basit sağlık kontrolü
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date() });
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