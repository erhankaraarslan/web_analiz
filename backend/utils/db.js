/**
 * MongoDB bağlantısı ve veritabanı işlemleri
 */
const mongoose = require('mongoose');
const logger = require('./logger');

/**
 * Veritabanına bağlan
 * @returns {Promise} Bağlantı durumunu döndürür
 */
const connectDB = async () => {
  try {
    // MongoDB bağlantı URL'i
    const connectionString = process.env.MONGODB_URI;
    
    // URL yoksa bağlantı yapma
    if (!connectionString) {
      logger.warn('MongoDB bağlantı URL\'i tanımlanmamış. Veritabanı devre dışı.');
      return false;
    }
    
    // Bağlantı seçenekleri
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true
    };
    
    // Bağlantıyı yap
    await mongoose.connect(connectionString, options);
    
    logger.info('MongoDB bağlantısı başarılı');
    return true;
  } catch (error) {
    logger.error(`MongoDB bağlantı hatası: ${error.message}`);
    return false;
  }
};

/**
 * Veritabanı bağlantısını kapat
 * @returns {Promise} Bağlantı kapatma durumunu döndürür
 */
const closeDB = async () => {
  try {
    await mongoose.connection.close();
    logger.info('MongoDB bağlantısı kapatıldı');
    return true;
  } catch (error) {
    logger.error(`MongoDB bağlantısı kapatılırken hata: ${error.message}`);
    return false;
  }
};

/**
 * Mongo bağlantı durumunu kontrol et
 * @returns {Boolean} Bağlantı durumunu döndürür
 */
const isConnected = () => {
  return mongoose.connection.readyState === 1;
};

// MongoDB bağlantı olaylarını dinle
mongoose.connection.on('connected', () => {
  logger.info('MongoDB bağlantısı kuruldu');
});

mongoose.connection.on('error', (err) => {
  logger.error(`MongoDB bağlantı hatası: ${err.message}`);
});

mongoose.connection.on('disconnected', () => {
  logger.info('MongoDB bağlantısı kesildi');
});

// Uygulama kapanırken bağlantıyı kapat
process.on('SIGINT', async () => {
  await closeDB();
  process.exit(0);
});

module.exports = {
  connectDB,
  closeDB,
  isConnected
};
