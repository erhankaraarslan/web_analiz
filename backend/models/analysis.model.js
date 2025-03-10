/**
 * Analiz sonuçları için veritabanı modeli
 */
const mongoose = require('mongoose');

const analysisSchema = new mongoose.Schema({
  // Analiz tipi
  type: {
    type: String,
    enum: ['sentiment', 'personas', 'improvements', 'full'],
    required: true,
    index: true
  },
  
  // Uygulama ID'si
  appId: {
    type: String,
    required: true,
    index: true
  },
  
  // Platform (android veya ios veya both)
  platform: {
    type: String,
    enum: ['android', 'ios', 'both'],
    required: true,
    index: true
  },
  
  // Kullanılan AI sağlayıcısı
  provider: {
    type: String,
    enum: ['openai', 'anthropic'],
    default: 'openai'
  },
  
  // Analiz tarihi
  date: {
    type: Date,
    default: Date.now,
    index: true
  },
  
  // Analiz edilen yorumların zamansal aralığı
  timeRange: {
    startDate: {
      type: Date,
      default: null
    },
    endDate: {
      type: Date,
      default: null
    }
  },
  
  // Analiz edilen yorum sayısı
  reviewCount: {
    type: Number,
    required: true
  },
  
  // Derecelendirme dağılımı (1-5 yıldız)
  ratingDistribution: {
    1: { type: Number, default: 0 },
    2: { type: Number, default: 0 },
    3: { type: Number, default: 0 },
    4: { type: Number, default: 0 },
    5: { type: Number, default: 0 }
  },
  
  // Analiz sonuçları (JSON formatında)
  results: {
    // Duygu analizi sonuçları
    sentiment: {
      type: mongoose.Schema.Types.Mixed,
      default: null
    },
    
    // Kullanıcı personaları
    personas: {
      type: mongoose.Schema.Types.Mixed,
      default: null
    },
    
    // İyileştirme önerileri
    improvements: {
      type: mongoose.Schema.Types.Mixed,
      default: null
    }
  },
  
  // Etiketler ve anahtar kelimeler
  keywords: [{
    type: String
  }],
  
  // Anahtar özellikler
  features: [{
    name: String,
    sentiment: {
      type: String,
      enum: ['positive', 'negative', 'neutral', 'mixed'],
      default: 'neutral'
    },
    score: {
      type: Number,
      min: -1,
      max: 1,
      default: 0
    },
    mentionCount: {
      type: Number,
      default: 0
    }
  }],
  
  // Karşılaştırmalı analiz için kullanılan diğer uygulama ID'leri
  comparedApps: [{
    appId: String,
    platform: {
      type: String,
      enum: ['android', 'ios']
    }
  }],
  
  // Analiz meta verileri
  metadata: {
    queryParams: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    processingTime: {
      type: Number,
      default: 0
    },
    apiVersion: {
      type: String,
      default: '1.0'
    }
  }
}, {
  timestamps: true, // createdAt ve updatedAt otomatik oluşturulsun
  collection: 'analyses',
  versionKey: false // __v alanını oluşturma
});

// İndeksler
analysisSchema.index({ type: 1, appId: 1, platform: 1, date: -1 }); // Benzersiz analiz sonuçları için
analysisSchema.index({ 'keywords': 1 }); // Kelime araması için
analysisSchema.index({ 'features.name': 1 }); // Özellik araması için

const Analysis = mongoose.model('Analysis', analysisSchema);

module.exports = Analysis;
