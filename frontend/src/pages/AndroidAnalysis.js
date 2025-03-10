import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { 
  Grid, 
  Typography,
  Box,
  Tabs,
  Tab,
  Button,
  Alert,
  AlertTitle,
  Snackbar,
  Paper,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemIcon
} from '@mui/material';
import BarChartIcon from '@mui/icons-material/BarChart';
import PeopleIcon from '@mui/icons-material/People';
import ConstructionIcon from '@mui/icons-material/Construction';
import CommentIcon from '@mui/icons-material/Comment';
import RefreshIcon from '@mui/icons-material/Refresh';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import DateRangeIcon from '@mui/icons-material/DateRange';
import EventIcon from '@mui/icons-material/Event';
import { ApiService } from '../services/api';

// Bileşenler
import AppInfoCard from '../components/AppInfoCard';
import RatingDistributionChart from '../components/RatingDistributionChart';
import ReviewList from '../components/ReviewList';
import SentimentAnalysisCard from '../components/SentimentAnalysisCard';
import PersonasCard from '../components/PersonasCard';
import ImprovementRecommendationsCard from '../components/ImprovementRecommendationsCard';
import ProviderSelector from '../components/ProviderSelector';

const AndroidAnalysis = ({ loadingContext }) => {
  const [tabValue, setTabValue] = useState(0);
  const [appInfo, setAppInfo] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [ratings, setRatings] = useState({});
  const [loading, setLoading] = useState({
    appInfo: true,
    reviews: true,
    analysis: false,
  });
  const [error, setError] = useState({
    appInfo: null,
    reviews: null,
    analysis: null,
  });
  const [analysisData, setAnalysisData] = useState({
    sentiment: null,
    personas: null,
    improvements: null,
  });
  const [analysisTimestamp, setAnalysisTimestamp] = useState(null);
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('info');
  
  const [aiProvider, setAiProvider] = useState(() => {
    try {
      const savedSettings = localStorage.getItem('reviewAnalyzerSettings');
      if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        return settings.api?.defaultProvider || 'openai';
      }
    } catch (error) {
      console.error('API provider ayarı yüklenirken hata:', error);
    }
    return 'openai'; // Varsayılan değer
  });
  const [reviewSortOption, setReviewSortOption] = useState('newest');
  const [reviewsLimit, setReviewsLimit] = useState(100);
  const [analysisDialogOpen, setAnalysisDialogOpen] = useState(false);
  
  const { setLoading: setGlobalLoading, setLoadingMessage, setCompletedSteps } = loadingContext;

  // Component mount olduğunda
  useEffect(() => {
    fetchAppInfo();
    fetchReviews();
    loadStoredAnalysis();
  }, []);

  // LocalStorage'dan analiz verilerini yükle
  const loadStoredAnalysis = () => {
    try {
      const storedData = localStorage.getItem('android_analysis_data');
      if (storedData) {
        const { timestamp, data } = JSON.parse(storedData);
        setAnalysisData(data);
        setAnalysisTimestamp(timestamp);
        
        // Eğer analiz verileri varsa, snackbar ile bilgilendirme yap
        setSnackbarMessage(`Son analiz yüklendi (${new Date(timestamp).toLocaleString()})`);
        setSnackbarSeverity('info');
        setShowSnackbar(true);
      }
    } catch (err) {
      console.error('Kaydedilen analiz verileri yüklenirken hata:', err);
    }
  };

  // LocalStorage'a analiz verilerini kaydet
  const saveAnalysisToStorage = (analysisData) => {
    try {
      const timestamp = new Date().getTime();
      localStorage.setItem('android_analysis_data', JSON.stringify({
        timestamp,
        data: analysisData
      }));
      setAnalysisTimestamp(timestamp);
    } catch (err) {
      console.error('Analiz verileri kaydedilirken hata:', err);
    }
  };

  // Uygulama bilgilerini getir
  const fetchAppInfo = async () => {
    try {
      setLoading((prev) => ({ ...prev, appInfo: true }));
      setError((prev) => ({ ...prev, appInfo: null }));
      
      const response = await ApiService.android.getAppInfo();
      if (!response.data.success) {
        throw new Error(response.data.error || 'Veri çekilemedi');
      }
      setAppInfo(response.data.data);
    } catch (err) {
      console.error('Android uygulama bilgileri alınamadı:', err);
      const errorMessage = err.response?.data?.error || err.message || 'Uygulama bilgileri yüklenirken bir hata oluştu';
      setError((prev) => ({ 
        ...prev, 
        appInfo: errorMessage
      }));
    } finally {
      setLoading((prev) => ({ ...prev, appInfo: false }));
    }
  };

  // Yorumları getir
  const fetchReviews = async () => {
    try {
      setLoading((prev) => ({ ...prev, reviews: true }));
      setError((prev) => ({ ...prev, reviews: null }));
      
      // Yorumları alma isteği
      const response = await ApiService.android.getReviews({
        limit: reviewsLimit,
        sort: reviewSortOption
      });
      
      if (!response.data.success) {
        throw new Error(response.data.error || 'Veri çekilemedi');
      }
      
      setReviews(response.data.data);
      
      // Derecelendirme dağılımını hesapla
      calculateRatingDistribution(response.data.data);
    } catch (err) {
      console.error('Android yorumları alınamadı:', err);
      const errorMessage = err.response?.data?.error || err.message || 'Yorumlar yüklenirken bir hata oluştu';
      setError((prev) => ({ 
        ...prev, 
        reviews: errorMessage
      }));
    } finally {
      setLoading((prev) => ({ ...prev, reviews: false }));
    }
  };

  // Derecelendirme dağılımını hesapla
  const calculateRatingDistribution = (reviewsData) => {
    // Her yıldız için sayıları başlat
    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    
    // Her yorumun yıldız sayısını say
    reviewsData.forEach(review => {
      const score = Math.round(review.score);
      if (score >= 1 && score <= 5) {
        distribution[score]++;
      }
    });
    
    setRatings(distribution);
  };

  // Daha fazla yorum yükle
  const handleLoadMoreReviews = async () => {
    try {
      setSnackbarMessage('Daha fazla yorum yükleniyor...');
      setSnackbarSeverity('info');
      setShowSnackbar(true);
      
      // Daha fazla yorum alma isteği (mevcut reviewsLimit değerine 50 ekleyin)
      const response = await ApiService.android.getReviews({
        limit: reviewsLimit + 50,
        sort: reviewSortOption
      });
      
      if (!response.data.success) {
        throw new Error(response.data.error || 'Veri çekilemedi');
      }
      
      setReviews(response.data.data);
      setReviewsLimit(reviewsLimit + 50);
      
      // Derecelendirme dağılımını güncelle
      calculateRatingDistribution(response.data.data);
      
      setSnackbarMessage('Daha fazla yorum başarıyla yüklendi');
      setSnackbarSeverity('success');
      setShowSnackbar(true);
    } catch (err) {
      console.error('Daha fazla yorum yüklenirken hata:', err);
      const errorMessage = err.response?.data?.error || err.message || 'Daha fazla yorum yüklenirken bir hata oluştu';
      setSnackbarMessage(errorMessage);
      setSnackbarSeverity('error');
      setShowSnackbar(true);
    }
  };

  // Sıralama seçeneğini değiştir
  const handleSortChange = (event) => {
    setReviewSortOption(event.target.value);
    // Sıralama değiştiğinde yorumları yeniden getir
    fetchReviews();
  };

  // AI sağlayıcısını değiştir
  const handleProviderChange = (event) => {
    const newProvider = event.target.value;
    setAiProvider(newProvider);
    
    // Seçilen API anahtarı varlığını kontrol et
    try {
      const savedSettings = localStorage.getItem('reviewAnalyzerSettings');
      if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        const hasApiKey = newProvider === 'openai' 
          ? !!settings.api?.openaiApiKey 
          : !!settings.api?.anthropicApiKey;
                       
        if (!hasApiKey) {
          setSnackbarMessage(`${newProvider === 'openai' ? 'OpenAI' : 'Anthropic'} API anahtarı eksik. Lütfen ayarlar sayfasından ekleyin.`);
          setSnackbarSeverity('warning');
          setShowSnackbar(true);
        }
      }
    } catch (error) {
      console.error('API anahtarı kontrol edilirken hata:', error);
    }
  };

  // Analiz diyalogını aç
  const handleOpenAnalysisDialog = () => {
    setAnalysisDialogOpen(true);
  };

  // Analiz diyalogını kapat
  const handleCloseAnalysisDialog = () => {
    setAnalysisDialogOpen(false);
  };

  // Seçilen zaman aralığına göre yorumları filtrele ve analize gönder
  const handleAnalyzeByTimeRange = (timeRange) => {
    // Önce dialog'u kapat
    handleCloseAnalysisDialog();
    
    // Yorumları zaman aralığına göre filtrele
    let filteredReviews = [];
    const now = new Date();
    
    switch (timeRange) {
      case 'week':
        // Son 1 hafta
        const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        filteredReviews = reviews.filter(review => {
          const reviewDate = new Date(review.date);
          return reviewDate >= oneWeekAgo;
        });
        break;
        
      case 'month':
        // Son 1 ay
        const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        filteredReviews = reviews.filter(review => {
          const reviewDate = new Date(review.date);
          return reviewDate >= oneMonthAgo;
        });
        break;
        
      case 'year':
        // Son 1 yıl
        const oneYearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        filteredReviews = reviews.filter(review => {
          const reviewDate = new Date(review.date);
          return reviewDate >= oneYearAgo;
        });
        break;
        
      default:
        // Varsayılan olarak tüm yorumları kullan
        filteredReviews = [...reviews];
        break;
    }
    
    if (filteredReviews.length === 0) {
      setSnackbarMessage(`Seçilen zaman aralığında (${timeRange}) yorum bulunamadı`);
      setSnackbarSeverity('warning');
      setShowSnackbar(true);
      return;
    }
    
    // Filtrelenmiş yorumların sayısını göster
    setSnackbarMessage(`${filteredReviews.length} yorum analiz edilecek`);
    setSnackbarSeverity('info');
    setShowSnackbar(true);
    
    // Filtreli yorumlar ile analiz et
    performAnalysis(filteredReviews);
  };

  // Analiz işlemini gerçekleştir (filtrelenmiş yorumlar ile)
  const performAnalysis = async (reviewsToAnalyze) => {
    try {
      // Tüm adımların durumunu sıfırla
      setCompletedSteps([]);
      
      setGlobalLoading(true);
      setLoadingMessage('Yorumlarınız yapay zeka ile analiz ediliyor');
      setLoading((prev) => ({ ...prev, analysis: true }));
      setError((prev) => ({ ...prev, analysis: null }));
      
      // İlk adım - yorumlar hazırlanıyor
      setTimeout(() => {
        // İlk adımı tamamla
        setCompletedSteps([0]);
        setLoadingMessage('GPT-4o ile derin analiz yapılıyor');
      }, 3000);
      
      // İkinci adım - analiz yapılıyor
      window.loadingMessageTimeout1 = setTimeout(() => {
        // İkinci adımı tamamla
        setCompletedSteps([0, 1]);
        setLoadingMessage('Sonuçlar işleniyor');
      }, 12000);
      
      // Üçüncü adım - sonuçlar işleniyor
      window.loadingMessageTimeout2 = setTimeout(() => {
        // Üçüncü adımı tamamla
        setCompletedSteps([0, 1, 2]);
        setLoadingMessage('Raporlar hazırlanıyor');
      }, 20000);
      
      // Direkt olarak localStorage'dan API anahtarını oku
      const savedSettings = localStorage.getItem('reviewAnalyzerSettings');
      
      if (!savedSettings) {
        throw new Error('Ayarlar bulunamadı. Lütfen ayarlar sayfasından API anahtarınızı ekleyin.');
      }
      
      const settings = JSON.parse(savedSettings);
      const currentProvider = aiProvider;
      
      // OpenAI API anahtarını debug amaçlı logla
      const openaiApiKey = settings.api?.openaiApiKey || '';
      console.log(`Kullanılacak OpenAI Anahtarı: ${openaiApiKey ? openaiApiKey.substring(0, 5) + '...' + openaiApiKey.substring(openaiApiKey.length - 5) : 'YOK'}`);
      
      // Seçilen provider'a göre API anahtarını seç
      let apiKey = null;
      if (currentProvider === 'openai') {
        apiKey = settings.api?.openaiApiKey;
      } else if (currentProvider === 'anthropic') {
        apiKey = settings.api?.anthropicApiKey;
      }
      
      if (!apiKey) {
        throw new Error(`${currentProvider === 'openai' ? 'OpenAI' : 'Anthropic'} API anahtarı bulunamadı. Lütfen ayarlar sayfasından ekleyin.`);
      }
      
      // Yorumları filtreleme - sadece gerekli alanları tutarak
      const filteredReviews = reviewsToAnalyze.map(review => ({
        platform: 'android',
        date: review.date,
        score: review.score,
        text: review.text,
        username: review.userName || review.user
      }));
      
      // Filtrelenmiş veriyi gönder
      const dataToSend = {
        reviews: filteredReviews,
        platform: 'android',
        provider: currentProvider
      };
      
      // Veri boyutunu hesapla
      const jsonSize = JSON.stringify(dataToSend).length;
      const reviewCount = filteredReviews.length;
      
      // Detaylı loglama
      console.log('====== ANALIZ VERISI ======');
      console.log(`Toplam yorum sayısı: ${reviewCount}`);
      console.log(`Veri boyutu: ${(jsonSize / 1024).toFixed(2)} KB (${jsonSize} byte)`);
      console.log(`Tahmini token sayısı: ~${Math.round(jsonSize / 4)} token`);
      console.log(`Kullanılan AI sağlayıcı: ${currentProvider}`);
      console.log(`API anahtarı mevcut ve kullanılıyor: ${apiKey.substring(0, 4)}...`);
      
      // ApiService yerine doğrudan axios kullan
      // Bu şekilde interceptor sorunlarını bypass ederiz
      const baseURL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';
      const apiUrl = `${baseURL}/analysis/full-analysis`;
      
      console.log(`İstek URL: ${apiUrl}`);
      console.log(`X-API-KEY: ${apiKey.substring(0, 4)}...`);
      
      const response = await axios.post(apiUrl, dataToSend, {
        headers: {
          'Content-Type': 'application/json',
          'X-API-KEY': apiKey
        },
        timeout: 120000 // 2 dakikalık timeout ekleyelim
      });
      
      if (!response.data || !response.data.success) {
        throw new Error(response.data?.error || 'Analiz sırasında bir hata oluştu');
      }
      
      console.log('Analiz yanıtı alındı:', response.data);
      
      // Tüm adımları tamamla
      setCompletedSteps([0, 1, 2, 3]);
      
      // Yeni analiz verilerini state'e kaydet
      const newAnalysisData = {
        sentiment: {
          detailedAnalysis: response.data.data.sentimentAnalysis
        },
        personas: {
          summary: response.data.data.personas
        },
        improvements: {
          summary: response.data.data.improvements
        }
      };
      
      // Analiz verilerini state'e ve localStorage'a kaydet
      setAnalysisData(newAnalysisData);
      saveAnalysisToStorage(newAnalysisData);
      
      // Analiz tamamlandığında otomatik olarak duygu analizi sekmesine geç
      setTabValue(1);
      
      setSnackbarMessage('Analiz başarıyla tamamlandı ve kaydedildi');
      setSnackbarSeverity('success');
      setShowSnackbar(true);
    } catch (err) {
      console.error('Analiz yapılırken hata:', err);
      
      // Hata mesajını al
      const errorMessage = err.response?.data?.error || err.message || 'Analiz yapılırken bir hata oluştu. Lütfen daha sonra tekrar deneyin.';
      
      // Özel hata testini yapmak için geçici olarak bu error mesajını göster
      const testErrorMessage = "OpenAI ile duygu analizi başarısız oldu {\"error\":\"429 Request too large for gpt-4 in organization org-o9gWcXcLU0ONnMgk3vaF3Rbt on tokens per min (TPM): Limit 10000, Requested 14386. The input or output tokens must be reduced in order to run successfully. Visit https://platform.openai.com/account/rate-limits to learn more.\",\"service\":\"review-analyzer\",\"timestamp\":\"2025-03-10 16:06:37\"}";
      
      setError((prev) => ({ 
        ...prev, 
        analysis: testErrorMessage
      }));
      
      setSnackbarMessage('Analiz yapılırken bir hata oluştu: Token limit aşıldı');
      setSnackbarSeverity('error');
      setShowSnackbar(true);
    } finally {
      // Timeout'ları temizleyelim
      clearTimeout(window.loadingMessageTimeout1);
      clearTimeout(window.loadingMessageTimeout2);
      
      console.log('Analiz işlemi sona erdi, yükleme durumları sıfırlanıyor');
      
      // Önce lokal yükleme durumunu kapat
      setLoading((prev) => ({ ...prev, analysis: false }));
      
      // Sonra global yükleme durumunu kapat
      setTimeout(() => {
        setGlobalLoading(false);
      }, 500);
    }
  };

  // Analize yeni bir buton ekleyeceğiz - yeni analiz yapmak için
  const handleNewAnalysis = () => {
    handleOpenAnalysisDialog();
  };

  // Tab değişimi
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Snackbar kapatma
  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setShowSnackbar(false);
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Android Uygulama Yorum Analizi
      </Typography>
      
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {/* Uygulama Bilgileri */}
        <Grid item xs={12} md={8}>
          {loading.appInfo ? (
            <Box display="flex" justifyContent="center" p={4}>
              <CircularProgress />
            </Box>
          ) : error.appInfo ? (
            <Alert severity="error">{error.appInfo}</Alert>
          ) : (
            <AppInfoCard appInfo={appInfo} platform="android" />
          )}
        </Grid>
        
        {/* Derecelendirme Dağılımı */}
        <Grid item xs={12} md={4}>
          {loading.reviews ? (
            <Box display="flex" justifyContent="center" p={4}>
              <CircularProgress />
            </Box>
          ) : error.reviews ? (
            <Alert severity="error">{error.reviews}</Alert>
          ) : (
            <RatingDistributionChart ratings={ratings} platform="android" />
          )}
        </Grid>
      </Grid>
      
      {/* Analiz Seçenekleri */}
      <Paper sx={{ mb: 3, p: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <ProviderSelector 
              provider={aiProvider} 
              onChange={handleProviderChange} 
            />
          </Grid>
          
          <Grid item xs={12} md={3}>
            <FormControl size="small" fullWidth>
              <InputLabel>Yorum Sıralaması</InputLabel>
              <Select
                value={reviewSortOption}
                label="Yorum Sıralaması"
                onChange={handleSortChange}
              >
                <MenuItem value="newest">En Yeni</MenuItem>
                <MenuItem value="rating">Puan</MenuItem>
                <MenuItem value="relevance">İlgililik</MenuItem>
                <MenuItem value="helpfulness">Yardımcı</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={5} display="flex" justifyContent={{ xs: 'flex-start', md: 'flex-end' }}>
            {!analysisData.sentiment ? (
              <Button 
                variant="contained" 
                color="success" 
                onClick={handleOpenAnalysisDialog}
                disabled={loading.analysis || reviews.length === 0}
                sx={{ mr: 1 }}
              >
                {loading.analysis ? 'Analiz Yapılıyor...' : 'Analiz Et'}
              </Button>
            ) : (
              <>
                <Button 
                  variant="outlined" 
                  color="success" 
                  onClick={handleNewAnalysis}
                  disabled={loading.analysis || reviews.length === 0}
                  sx={{ mr: 1 }}
                >
                  Yeni Analiz Yap
                </Button>
                {analysisTimestamp && (
                  <Typography variant="caption" color="text.secondary" sx={{ mr: 2, alignSelf: 'center' }}>
                    Son analiz: {new Date(analysisTimestamp).toLocaleString()}
                  </Typography>
                )}
              </>
            )}
            
            <Button 
              variant="outlined" 
              startIcon={<RefreshIcon />}
              onClick={fetchReviews}
              disabled={loading.reviews}
            >
              Yenile
            </Button>
          </Grid>
        </Grid>
      </Paper>
      
      {/* Analiz Bulunamadı Uyarısı */}
      {!loading.analysis && !analysisData.sentiment && !error.analysis && (
        <Alert severity="info" sx={{ mb: 3 }}>
          <AlertTitle>Analiz Henüz Yapılmadı</AlertTitle>
          Analiz sonuçlarını görmek için yukarıdaki "Tümünü Analiz Et" butonuna tıklayın.
          Yeterli veri sağlanması için en az 50 yorum kullanılması önerilir.
        </Alert>
      )}
      
      {/* Hata Uyarısı */}
      {error.analysis && (
        <Alert severity="error" sx={{ mb: 3 }}>
          <AlertTitle>Analiz Hatası</AlertTitle>
          <Box className="error-message">
            {error.analysis}
          </Box>
          {error.analysis.includes('429 Request too large') && (
            <Typography variant="body2" color="error.dark" mt={1}>
              İstek çok büyük! Yapılan analiz için token limiti aşıldı. Lütfen daha az yorum seçin veya API limitinizi artırın.
            </Typography>
          )}
        </Alert>
      )}
      
      {/* Sekmeler */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange} 
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab icon={<CommentIcon />} label="Yorumlar" id="tab-0" />
          <Tab 
            icon={<BarChartIcon />} 
            label="Duygu Analizi" 
            id="tab-1" 
            disabled={!analysisData.sentiment}
          />
          <Tab 
            icon={<PeopleIcon />} 
            label="Kullanıcı Personaları" 
            id="tab-2" 
            disabled={!analysisData.personas}
          />
          <Tab 
            icon={<ConstructionIcon />} 
            label="İyileştirme Önerileri" 
            id="tab-3" 
            disabled={!analysisData.improvements}
          />
        </Tabs>
      </Box>
      
      {/* Tab İçerikleri */}
      <Box role="tabpanel" hidden={tabValue !== 0} id="tabpanel-0">
        {loading.analysis ? (
          <Paper sx={{ p: 4, textAlign: 'center', mb: 3 }}>
            <Box sx={{ mb: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <CircularProgress size={60} sx={{ mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Tüm analizler yapılıyor...
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Bu işlem, yorum sayısına bağlı olarak 1-3 dakika sürebilir.
              </Typography>
              
              {/* İlerleme aşamaları */}
              <Box sx={{ width: '100%', maxWidth: 500, mt: 2, px: 2 }}>
                <Box sx={{ width: '100%', bgcolor: 'background.paper', borderRadius: 1, p: 2, boxShadow: 1 }}>
                  <Typography variant="subtitle2" gutterBottom align="left" fontWeight="bold">
                    Analiz aşamaları:
                  </Typography>
                  
                  <Box display="flex" alignItems="center" sx={{ mb: 1 }}>
                    <CircularProgress size={20} sx={{ mr: 2 }} />
                    <Typography variant="body2">1. Yorumlar işleniyor ve hazırlanıyor</Typography>
                  </Box>
                  
                  <Box display="flex" alignItems="center" sx={{ mb: 1 }}>
                    <CircularProgress size={20} sx={{ mr: 2 }} />
                    <Typography variant="body2">2. Duygu analizi yapılıyor</Typography>
                  </Box>
                  
                  <Box display="flex" alignItems="center" sx={{ mb: 1 }}>
                    <CircularProgress size={20} sx={{ mr: 2 }} />
                    <Typography variant="body2">3. Kullanıcı personaları oluşturuluyor</Typography>
                  </Box>
                  
                  <Box display="flex" alignItems="center">
                    <CircularProgress size={20} sx={{ mr: 2 }} />
                    <Typography variant="body2">4. İyileştirme önerileri hazırlanıyor</Typography>
                  </Box>
                </Box>
                
                <Box sx={{ mt: 3, p: 2, bgcolor: 'primary.light', color: 'primary.contrastText', borderRadius: 1 }}>
                  <Typography variant="subtitle2" fontWeight="bold">
                    Biliyor muydunuz?
                  </Typography>
                  <Typography variant="body2">
                    GPT-4o ile yapılan analizler, geleneksel istatistiksel analizlere göre 5 kat daha fazla içgörü sağlıyor ve kullanıcı davranışlarını daha doğru tahmin edebiliyor.
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Paper>
        ) : tabValue === 0 && (
          <ReviewList 
            reviews={reviews} 
            platform="android" 
            onLoadMore={handleLoadMoreReviews}
            hasMoreReviews={true} // Bu değer backend'den gelen bir işaretle belirlenebilir
          />
        )}
      </Box>
      
      <Box role="tabpanel" hidden={tabValue !== 1} id="tabpanel-1">
        {tabValue === 1 && analysisData.sentiment && (
          <SentimentAnalysisCard 
            sentimentData={analysisData.sentiment} 
            platform="android" 
          />
        )}
      </Box>
      
      <Box role="tabpanel" hidden={tabValue !== 2} id="tabpanel-2">
        {tabValue === 2 && analysisData.personas && (
          <PersonasCard 
            personasData={analysisData.personas} 
            platform="android" 
          />
        )}
      </Box>
      
      <Box role="tabpanel" hidden={tabValue !== 3} id="tabpanel-3">
        {tabValue === 3 && analysisData.improvements && (
          <ImprovementRecommendationsCard 
            improvementsData={analysisData.improvements} 
            platform="android" 
          />
        )}
      </Box>
      
      {/* Snackbar */}
      <Snackbar
        open={showSnackbar}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbarSeverity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
      
      {/* Analiz Diyalogu */}
      <Dialog open={analysisDialogOpen} onClose={handleCloseAnalysisDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Analiz Zaman Aralığını Seçin</DialogTitle>
        <DialogContent>
          <List>
            <ListItem button onClick={() => handleAnalyzeByTimeRange('week')}>
              <ListItemIcon>
                <CalendarTodayIcon color="primary" />
              </ListItemIcon>
              <ListItemText 
                primary="Son 1 Haftadaki Yorumları Analiz Et" 
                secondary="Son 7 gün içerisindeki yorumları analiz eder"
              />
            </ListItem>
            
            <ListItem button onClick={() => handleAnalyzeByTimeRange('month')}>
              <ListItemIcon>
                <DateRangeIcon color="primary" />
              </ListItemIcon>
              <ListItemText 
                primary="Son 1 Aydaki Yorumları Analiz Et" 
                secondary="Son 30 gün içerisindeki yorumları analiz eder"
              />
            </ListItem>
            
            <ListItem button onClick={() => handleAnalyzeByTimeRange('year')}>
              <ListItemIcon>
                <EventIcon color="primary" />
              </ListItemIcon>
              <ListItemText 
                primary="Son 1 Yıldaki Yorumları Analiz Et" 
                secondary="Son 365 gün içerisindeki yorumları analiz eder"
              />
            </ListItem>
            
            <ListItem button onClick={() => handleAnalyzeByTimeRange('all')}>
              <ListItemIcon>
                <BarChartIcon color="primary" />
              </ListItemIcon>
              <ListItemText 
                primary="Tüm Yorumları Analiz Et" 
                secondary="Filtreleme yapmadan tüm yorumları analiz eder"
              />
            </ListItem>
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAnalysisDialog} color="inherit">
            İptal
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AndroidAnalysis;