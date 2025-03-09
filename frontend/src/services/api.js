import axios from 'axios';

// API temel URL
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Axios örneği oluştur
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Her istekte API anahtarlarını ekleyen interceptor
api.interceptors.request.use((config) => {
  // LocalStorage'dan ayarları al
  const savedSettings = localStorage.getItem('reviewAnalyzerSettings');
  
  if (savedSettings) {
    try {
      const settings = JSON.parse(savedSettings);
      
      // Analiz isteklerinde API anahtarlarını ekle
      if (config.url.includes('/analysis/')) {
        // Varsayılan sağlayıcıyı kontrol et
        const provider = settings.api?.defaultProvider || 'openai';
        
        if (provider === 'openai' && settings.api?.openaiApiKey) {
          config.headers['X-API-KEY'] = settings.api.openaiApiKey;
        } else if (provider === 'anthropic' && settings.api?.anthropicApiKey) {
          config.headers['X-API-KEY'] = settings.api.anthropicApiKey;
        }
        
        // Providers parametresini de ekle
        if (config.method === 'post' && config.data) {
          const data = typeof config.data === 'string' ? JSON.parse(config.data) : config.data;
          data.provider = provider;
          config.data = JSON.stringify(data);
        }
      }
      
      // Uygulama ID'lerini URL parametrelerine ekle
      if (settings.apps) {
        // URL parametreleri ekle
        config.params = config.params || {};
        
        // Android rotaları için
        if (config.url.includes('/android/') && settings.apps.androidAppId) {
          config.params.appId = settings.apps.androidAppId;
        }
        
        // iOS rotaları için
        if (config.url.includes('/ios/') && settings.apps.iosAppId) {
          config.params.appId = settings.apps.iosAppId;
        }
        
        // Ülke parametresi ekleme
        if (settings.apps.defaultCountry) {
          config.params.country = settings.apps.defaultCountry;
        }
        
        // Yorum limiti ekleme
        if (settings.apps.reviewsLimit && 
            (config.url.includes('/reviews') || config.url.includes('/reviews/'))) {
          config.params.limit = settings.apps.reviewsLimit;
        }
      }
    } catch (error) {
      console.error('Ayarlar yüklenirken hata oluştu:', error);
    }
  }
  
  return config;
}, (error) => {
  return Promise.reject(error);
});

// API istekleri için hizmetler
export const ApiService = {
  // Android hizmetleri
  android: {
    getAppInfo: (params = {}) => api.get('/android/app-info', { params }),
    getReviews: (params = {}) => api.get('/android/reviews', { params }),
    getReviewsByRating: (rating, params = {}) => api.get(`/android/reviews/rating/${rating}`, { params }),
  },
  
  // iOS hizmetleri
  ios: {
    getAppInfo: (params = {}) => api.get('/ios/app-info', { params }),
    getReviews: (params = {}) => api.get('/ios/reviews', { params }),
    getAllReviews: (params = {}) => api.get('/ios/reviews/all', { params }),
    getReviewsByRating: (rating, params = {}) => api.get(`/ios/reviews/rating/${rating}`, { params }),
  },
  
  // Analiz hizmetleri
  analysis: {
    analyzeSentiment: (data) => api.post('/analysis/sentiment', data),
    createPersonas: (data) => api.post('/analysis/personas', data),
    getImprovements: (data) => api.post('/analysis/improvements', data),
    getFullAnalysis: (data) => api.post('/analysis/full-analysis', data),
  }
};

export default api;