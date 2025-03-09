const winston = require('winston');

// Log formatı
const logFormat = winston.format.printf(({ level, message, timestamp, ...meta }) => {
  return `${timestamp} ${level}: ${message} ${Object.keys(meta).length ? JSON.stringify(meta) : ''}`;
});

// Logger yapılandırması
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
  ),
  defaultMeta: { service: 'review-analyzer' },
  transports: [
    // Konsola log
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        logFormat
      )
    }),
    // Dosya logları - Hata seviyesi
    new winston.transports.File({ 
      filename: 'logs/error.log', 
      level: 'error' 
    }),
    // Tüm loglar
    new winston.transports.File({ 
      filename: 'logs/combined.log' 
    })
  ]
});

// Üretim ortamında değilsek, konsola da logla
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

module.exports = logger;