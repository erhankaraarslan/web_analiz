import React, { useState, useEffect } from 'react';
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
  MenuItem
} from '@mui/material';
import BarChartIcon from '@mui/icons-material/BarChart';
import PeopleIcon from '@mui/icons-material/People';
import ConstructionIcon from '@mui/icons-material/Construction';
import CommentIcon from '@mui/icons-material/Comment';
import RefreshIcon from '@mui/icons-material/Refresh';
import { ApiService } from '../services/api';

// Bileşenler
import AppInfoCard from '../components/AppInfoCard';
import RatingDistributionChart from '../components/RatingDistributionChart';
import ReviewList from '../components/ReviewList';
import SentimentAnalysisCard from '../components/SentimentAnalysisCard';
import PersonasCard from '../components/PersonasCard';
import ImprovementRecommendationsCard from '../components/ImprovementRecommendationsCard';
import ProviderSelector from '../components/ProviderSelector';

const IosAnalysis = ({ loadingContext }) => {
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
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('info');
  const [aiProvider, setAiProvider] = useState('anthropic');
  const [reviewSortOption, setReviewSortOption] = useState('RECENT');
  const [reviewCountry, setReviewCountry] = useState('tr');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  const { setLoading: setGlobalLoading, setLoadingMessage } = loadingContext;

  useEffect(() => {
    fetchAppInfo();
    fetchReviews();
  }, []);

  // Uygulama bilgilerini getir
  const fetchAppInfo = async () => {
    try {
      setLoading((prev) => ({ ...prev, appInfo: true }));
      setError((prev) => ({ ...prev, appInfo: null }));
      
      const response = await ApiService.ios.getAppInfo({ country: reviewCountry });
      if (!response.data.success) {
        throw new Error(response.data.error || 'Veri çekilemedi');
      }
      setAppInfo(response.data.data);
    } catch (err) {
      console.error('iOS uygulama bilgileri alınamadı:', err);
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
      const response = await ApiService.ios.getAllReviews({
        maxPages: 10,
        sort: reviewSortOption,
        country: reviewCountry
      });
      
      if (!response.data.success) {
        throw new Error(response.data.error || 'Veri çekilemedi');
      }
      
      setReviews(response.data.data);
      setTotalPages(response.data.totalPages || 1);
      
      // Derecelendirme dağılımını hesapla
      calculateRatingDistribution(response.data.data);
    } catch (err) {
      console.error('iOS yorumları alınamadı:', err);
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
      
      // Daha fazla sayfa yorumu getir
      const newPage = currentPage + 1;
      
      // İstek için maksimum sayfa sayısını artır
      const response = await ApiService.ios.getAllReviews({
        maxPages: newPage * 2, // Daha fazla sayfa isteyelim
        sort: reviewSortOption,
        country: reviewCountry
      });
      
      if (!response.data.success) {
        throw new Error(response.data.error || 'Veri çekilemedi');
      }
      
      setReviews(response.data.data);
      setCurrentPage(newPage);
      setTotalPages(response.data.totalPages || 1);
      
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

  // Ülke değiştir
  const handleCountryChange = (event) => {
    setReviewCountry(event.target.value);
    // Ülke değiştiğinde yorumları yeniden getir
    fetchReviews();
  };

  // AI sağlayıcısını değiştir
  const handleProviderChange = (event) => {
    setAiProvider(event.target.value);
  };

  // Tam analiz yap (duygu analizi, personalar ve iyileştirmeler)
  const handleAnalyzeEverything = async () => {
    try {
      setGlobalLoading(true);
      setLoadingMessage('Tüm analizler yapılıyor... (Bu işlem birkaç dakika sürebilir)');
      setLoading((prev) => ({ ...prev, analysis: true }));
      setError((prev) => ({ ...prev, analysis: null }));
      
      // Tüm analizleri paralel olarak yap
      const response = await ApiService.analysis.getFullAnalysis({
        reviews: reviews,
        platform: 'ios',
        provider: aiProvider
      });
      
      setAnalysisData({
        sentiment: {
          detailedAnalysis: response.data.data.sentimentAnalysis
        },
        personas: {
          summary: response.data.data.personas
        },
        improvements: {
          summary: response.data.data.improvements
        }
      });
      
      // Analiz tamamlandığında otomatik olarak duygu analizi sekmesine geç
      setTabValue(1);
      
      setSnackbarMessage('Analiz başarıyla tamamlandı');
      setSnackbarSeverity('success');
      setShowSnackbar(true);
    } catch (err) {
      console.error('Analiz yapılırken hata:', err);
      setError((prev) => ({ 
        ...prev, 
        analysis: 'Analiz yapılırken bir hata oluştu. Lütfen daha sonra tekrar deneyin.' 
      }));
      setSnackbarMessage('Analiz yapılırken bir hata oluştu');
      setSnackbarSeverity('error');
      setShowSnackbar(true);
    } finally {
      setLoading((prev) => ({ ...prev, analysis: false }));
      setGlobalLoading(false);
    }
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
        iOS Uygulama Yorum Analizi
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
            <AppInfoCard appInfo={appInfo} platform="ios" />
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
            <RatingDistributionChart ratings={ratings} platform="ios" />
          )}
        </Grid>
      </Grid>
      
      {/* Analiz Seçenekleri */}
      <Paper sx={{ mb: 3, p: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={3}>
            <ProviderSelector 
              provider={aiProvider} 
              onChange={handleProviderChange} 
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={2}>
            <FormControl size="small" fullWidth>
              <InputLabel>Yorum Sıralaması</InputLabel>
              <Select
                value={reviewSortOption}
                label="Yorum Sıralaması"
                onChange={handleSortChange}
              >
                <MenuItem value="RECENT">En Yeni</MenuItem>
                <MenuItem value="HELPFUL">En Yardımcı</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6} md={2}>
            <FormControl size="small" fullWidth>
              <InputLabel>Ülke</InputLabel>
              <Select
                value={reviewCountry}
                label="Ülke"
                onChange={handleCountryChange}
              >
                <MenuItem value="tr">Türkiye</MenuItem>
                <MenuItem value="us">ABD</MenuItem>
                <MenuItem value="gb">Birleşik Krallık</MenuItem>
                <MenuItem value="de">Almanya</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6} md={5} display="flex" justifyContent={{ xs: 'flex-start', md: 'flex-end' }}>
            <Button 
              variant="contained" 
              color="primary" 
              onClick={handleAnalyzeEverything}
              disabled={loading.analysis || reviews.length === 0}
              sx={{ mr: 1 }}
            >
              {loading.analysis ? 'Analiz Yapılıyor...' : 'Tümünü Analiz Et'}
            </Button>
            
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
          {error.analysis}
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
        {tabValue === 0 && (
          <ReviewList 
            reviews={reviews} 
            platform="ios" 
            onLoadMore={handleLoadMoreReviews}
            hasMoreReviews={currentPage < totalPages}
          />
        )}
      </Box>
      
      <Box role="tabpanel" hidden={tabValue !== 1} id="tabpanel-1">
        {tabValue === 1 && analysisData.sentiment && (
          <SentimentAnalysisCard 
            sentimentData={analysisData.sentiment} 
            platform="ios" 
          />
        )}
      </Box>
      
      <Box role="tabpanel" hidden={tabValue !== 2} id="tabpanel-2">
        {tabValue === 2 && analysisData.personas && (
          <PersonasCard 
            personasData={analysisData.personas} 
            platform="ios" 
          />
        )}
      </Box>
      
      <Box role="tabpanel" hidden={tabValue !== 3} id="tabpanel-3">
        {tabValue === 3 && analysisData.improvements && (
          <ImprovementRecommendationsCard 
            improvementsData={analysisData.improvements} 
            platform="ios" 
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
    </Box>
  );
};

export default IosAnalysis;