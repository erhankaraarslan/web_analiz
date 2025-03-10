/**
 * Uygulama yorumları için veritabanı modeli
 */
const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  // Uygulama ID'si (Google Play veya App Store uygulama ID'si)
  appId: {
    type: String,
    required: true,
    index: true
  },
  
  // Platform (android veya ios)
  platform: {
    type: String,
    enum: ['android', 'ios'],
    required: true,
    index: true
  },
  
  // Yorum ID'si (platform tarafından verilen benzersiz ID)
  reviewId: {
    type: String,
    required: true,
    unique: true
  },
  
  // Yazar/kullanıcı adı veya ID'si
  author: {
    type: String,
    default: 'Anonim'
  },
  
  // Yorum metni
  text: {
    type: String,
    default: ''
  },
  
  // Derecelendirme (1-5 arası)
  score: {
    type: Number,
    min: 1,
    max: 5,
    required: true,
    index: true
  },
  
  // Yorum tarihi
  date: {
    type: Date,
    required: true,
    index: true
  },
  
  // Uygulama versiyonu
  version: {
    type: String,
    default: 'unknown'
  },
  
  // Yorum başlığı (iOS için)
  title: {
    type: String,
    default: ''
  },
  
  // Kullanışlı bulunan sayısı
  thumbsUp: {
    type: Number,
    default: 0
  },
  
  // Uygulama cevabı
  replyText: {
    type: String,
    default: null
  },
  
  // Uygulama cevap tarihi
  replyDate: {
    type: Date,
    default: null
  },
  
  // Ham yorum verisi (API'den gelen tüm veriyi saklamak için)
  rawData: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },
  
  // Sistem tarafından oluşturulan alanlar
  metadata: {
    fetchedAt: {
      type: Date,
      default: Date.now
    },
    updatedAt: {
      type: Date,
      default: null
    }
  }
}, {
  timestamps: true, // createdAt ve updatedAt otomatik oluşturulsun
  collection: 'reviews',
  versionKey: false // __v alanını oluşturma
});

// İndeksler
reviewSchema.index({ appId: 1, platform: 1, date: -1 }); // Uygulama ve platforma göre, tarihe göre azalan sıralama
reviewSchema.index({ score: 1 }); // Puana göre sıralama için
reviewSchema.index({ 'metadata.fetchedAt': -1 }); // Çekilme tarihine göre sıralama

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
