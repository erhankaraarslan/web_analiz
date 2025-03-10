/**
 * Redis client yapılandırması
 * Tüm cache işlemleri için gerekli yardımcı fonksiyonlar
 */
const redis = require('redis');
const { promisify } = require('util');
const logger = require('../logger');

// Redis'in etkin olup olmadığını kontrol et
const REDIS_ENABLED = process.env.REDIS_ENABLED === 'true';

// Redis client oluşturma
let client = null;
let getAsync = null;
let setAsync = null;
let expireAsync = null;
let delAsync = null;
let flushAsync = null;
let keysAsync = null;

// Redis etkinse client oluştur
if (REDIS_ENABLED) {
  try {
    // Redis client yapılandırması
    client = redis.createClient({
      host: process.env.REDIS_HOST || 'localhost',
      port: process.env.REDIS_PORT || 6379,
      password: process.env.REDIS_PASSWORD || '',
      retry_strategy: function(options) {
        if (options.error && options.error.code === 'ECONNREFUSED') {
          logger.error('Redis sunucusuna bağlanılamıyor, Redis önbelleği devre dışı bırakılacak');
          return false; // Redis devre dışı bırakılacak
        }
        if (options.total_retry_time > 1000 * 60 * 60) {
          // 1 saat içinde bağlantı kurulamadıysa
          return new Error('Redis bağlantı zaman aşımı');
        }
        if (options.attempt > 10) {
          // 10 denemeden sonra başarısız olursa
          return undefined;
        }
        // 200ms, 400ms, 800ms, ... sonra yeniden dene
        return Math.min(options.attempt * 100, 3000);
      }
    });

    // Redis bağlantı olayları
    client.on('connect', () => {
      logger.info('Redis server\'a bağlandı');
    });

    client.on('error', (err) => {
      logger.error(`Redis hata: ${err.message}`);
    });

    client.on('ready', () => {
      logger.info('Redis server kullanıma hazır');
    });

    client.on('end', () => {
      logger.info('Redis server bağlantısı kapandı');
    });

    // Redis komutlarını promisify et
    getAsync = promisify(client.get).bind(client);
    setAsync = promisify(client.set).bind(client);
    expireAsync = promisify(client.expire).bind(client);
    delAsync = promisify(client.del).bind(client);
    flushAsync = promisify(client.flushall).bind(client);
    keysAsync = promisify(client.keys).bind(client);
  } catch (err) {
    logger.error(`Redis client oluşturulurken hata: ${err.message}`);
    // Redis kullanılamıyorsa devre dışı bırak
    client = null;
  }
}

// Key öneki oluşturma
const createCacheKey = (prefix, params) => {
  if (typeof params === 'string') {
    return `${prefix}:${params}`;
  }
  
  // Parametreleri sıralayıp key oluştur
  const paramString = Object.entries(params)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([key, value]) => `${key}=${value}`)
    .join(':');
  
  return `${prefix}:${paramString}`;
};

// Cache'e veri kaydetme
const setCache = async (key, data, ttl = 3600) => {
  // Redis etkin değilse bir şey yapmadan dön
  if (!REDIS_ENABLED || !client || !setAsync) {
    return false;
  }
  
  try {
    // Veriyi JSON olarak kaydet
    await setAsync(key, JSON.stringify(data));
    
    // TTL ayarla (saniye cinsinden)
    await expireAsync(key, ttl);
    
    logger.info(`Cache set: ${key} (TTL: ${ttl}s)`);
    return true;
  } catch (error) {
    logger.error(`Cache set error: ${error.message}`, { key });
    return false;
  }
};

// Cache'den veri okuma
const getCache = async (key) => {
  // Redis etkin değilse null dön
  if (!REDIS_ENABLED || !client || !getAsync) {
    return null;
  }
  
  try {
    const data = await getAsync(key);
    
    if (!data) {
      return null;
    }
    
    // JSON veriyi parse et
    const parsedData = JSON.parse(data);
    logger.info(`Cache hit: ${key}`);
    return parsedData;
  } catch (error) {
    logger.error(`Cache get error: ${error.message}`, { key });
    return null;
  }
};

// Cache'den veri silme
const invalidateCache = async (key) => {
  // Redis etkin değilse başarılı dön
  if (!REDIS_ENABLED || !client || !delAsync) {
    return true;
  }
  
  try {
    await delAsync(key);
    logger.info(`Cache invalidated: ${key}`);
    return true;
  } catch (error) {
    logger.error(`Cache invalidation error: ${error.message}`, { key });
    return false;
  }
};

// Prefix ile başlayan tüm cache değerlerini temizle
const clearCacheByPrefix = async (prefix) => {
  // Redis etkin değilse 0 dön
  if (!REDIS_ENABLED || !client || !keysAsync || !delAsync) {
    return 0;
  }
  
  try {
    const keys = await keysAsync(`${prefix}*`);
    
    if (keys.length === 0) {
      logger.info(`No cache keys found with prefix: ${prefix}`);
      return 0;
    }
    
    // Her bir key'i temizle
    const promises = keys.map(key => delAsync(key));
    await Promise.all(promises);
    
    logger.info(`Cleared ${keys.length} cache keys with prefix: ${prefix}`);
    return keys.length;
  } catch (error) {
    logger.error(`Cache clear by prefix error: ${error.message}`, { prefix });
    return 0;
  }
};

// Tüm cache'i temizle (DİKKAT: Sadece geliştirme ortamında kullanın!)
const clearAllCache = async () => {
  // Redis etkin değilse başarılı dön
  if (!REDIS_ENABLED || !client || !flushAsync) {
    return true;
  }
  
  try {
    await flushAsync();
    logger.info('Cache completely cleared');
    return true;
  } catch (error) {
    logger.error(`Clear all cache error: ${error.message}`);
    return false;
  }
};

// Cache middleware
const cacheMiddleware = (prefix, ttl = 3600) => {
  return async (req, res, next) => {
    // Redis etkin değilse middleware'i atla
    if (!REDIS_ENABLED || !client) {
      return next();
    }
    
    try {
      // İstek metodu GET değilse cache'leme
      if (req.method !== 'GET') {
        return next();
      }
      
      // Cache key oluştur (URL + query params)
      const cacheKey = createCacheKey(prefix, {
        ...req.params,
        ...req.query
      });
      
      // Cache'ten veriyi kontrol et
      const cachedData = await getCache(cacheKey);
      
      if (cachedData) {
        // Cache hit - veriyi döndür
        return res.json(cachedData);
      }
      
      // Cache miss - orijinal res.json metodunu sakla
      const originalJson = res.json;
      
      // res.json metodunu override et
      res.json = function(data) {
        // Veriyi cache'e kaydet
        setCache(cacheKey, data, ttl).catch(err => {
          logger.error(`Cache middleware error: ${err.message}`);
        });
        
        // Orijinal metodu çağır
        return originalJson.call(this, data);
      };
      
      // Bir sonraki middleware'e geç
      next();
    } catch (error) {
      logger.error(`Cache middleware error: ${error.message}`);
      next();
    }
  };
};

module.exports = {
  client,
  createCacheKey,
  setCache,
  getCache,
  invalidateCache,
  clearCacheByPrefix,
  clearAllCache,
  cacheMiddleware
};