import React, { useState, useEffect } from 'react';
import { 
  Grid, 
  Typography,
  Box,
  Paper,
  Button,
  Alert,
  CircularProgress,
  Divider,
  Snackbar
} from '@mui/material';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import RefreshIcon from '@mui/icons-material/Refresh';
import { ApiService } from '../services/api';

// Bileşenler
import ComparisonChart from '../components/ComparisonChart';
import SentimentAnalysisCard from '../components/SentimentAnalysisCard';
import ImprovementRecommendationsCard from '../components/ImprovementRecommendationsCard';

const ComparisonPage = ({ loadingContext }) => {
  const [androidData, setAndroidData] = useState(null);
  const [iosData, setIosData] = useState(null);
  const [comparisonData, setComparisonData] = useState(null);
  const [loading, setLoading] = useState({
    androidData: true,
    iosData: true,
    comparison: false
  });
  const [error, setError] = useState({
    androidData: null,
    iosData: null,
    comparison: null
  });
  
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  
  const { setLoading: setGlobalLoading, setLoadingMessage } = loadingContext;

  useEffect(() => {
    fetchAndroidData();
    fetchIosData();
  }, []);

  // Android verilerini getir
  const fetchAndroidData = async () => {
    try {
      setLoading((prev) => ({ ...prev, androidData: true }));
      setError((prev) => ({ ...prev, androidData: null }));
      
      // Uygulama bilgileri ve yorumları getir
      const [appInfoResponse, reviewsResponse] = await Promise.all([
        ApiService.android.getAppInfo(),
        ApiService.android.getReviews({ limit: 200 })
      ]);
      
      setAndroidData({
        appInfo: appInfoResponse.data.data,
        reviews: reviewsResponse.data.data,
        // Derecelendirme dağılımı hesapla (örnek veri)
        ratings: {
          averageRating: appInfoResponse.data.data.score || 4.2,
          fiveStarPercentage: 45,
          fourStarPercentage: 30,
          threeStarPercentage: 15,
          twoStarPercentage: 5,
          oneStarPercentage: 5
        }
      });
    } catch (err) {
      console.error('Android verileri alınamadı:', err);
      setError((prev) => ({ 
        ...prev, 
        androidData: 'Android verileri yüklenirken bir hata oluştu.' 
      }));
    } finally {
      setLoading((prev) => ({ ...prev, androidData: false }));
    }
  };

  // iOS verilerini getir
  const fetchIosData = async () => {
    try {
      setLoading((prev) => ({ ...prev, iosData: true }));
      setError((prev) => ({ ...prev, iosData: null }));
      
      // Uygulama bilgileri ve yorumları getir
      const [appInfoResponse, reviewsResponse] = await Promise.all([
        ApiService.ios.getAppInfo(),
        ApiService.ios.getAllReviews({ maxPages: 10 })
      ]);
      
      setIosData({
        appInfo: appInfoResponse.data.data,
        reviews: reviewsResponse.data.data,
        // Derecelendirme dağılımı hesapla (örnek veri)
        ratings: {
          averageRating: appInfoResponse.data.data.score || 4.0,
          fiveStarPercentage: 40,
          fourStarPercentage: 35,
          threeStarPercentage: 10,
          twoStarPercentage: 8,
          oneStarPercentage: 7
        }
      });
    } catch (err) {
      console.error('iOS verileri alınamadı:', err);
      setError((prev) => ({ 
        ...prev, 
        iosData: 'iOS verileri yüklenirken bir hata oluştu.' 
      }));
    } finally {
      setLoading((prev) => ({ ...prev, iosData: false }));
    }
  };

  // Karşılaştırma analizi yap
  const handleCompareData = async () => {
    try {
      // Veri yoksa işlem yapma
      if (!androidData || !iosData) {
        setError((prev) => ({ 
          ...prev, 
          comparison: 'Karşılaştırma için veriler eksik. Lütfen önce verileri yükleyin.' 
        }));
        return;
      }
      
      setGlobalLoading(true);
      setLoadingMessage('Platformlar karşılaştırılıyor... Bu işlem birkaç dakika sürebilir.');
      setLoading((prev) => ({ ...prev, comparison: true }));
      setError((prev) => ({ ...prev, comparison: null }));
      
      // Gerçek karşılaştırma için yapay zekaya istek yapılabilir
      // Burada örnek veri kullanıyoruz
      setComparisonData({
        ratings: {
          androidAverage: androidData.ratings.averageRating,
          iosAverage: iosData.ratings.averageRating,
          androidTotal: androidData.appInfo.ratings || 1000,
          iosTotal: iosData.appInfo.ratings || 800
        },
        sentimentComparison: {
          android: {
            positivePercentage: 65,
            neutralPercentage: 20,
            negativePercentage: 15,
            mainTopics: [
              { topic: 'Kullanıcı Arayüzü', percentage: 45 },
              { topic: 'Performans', percentage: 30 },
              { topic: 'Güvenlik', percentage: 25 },
              { topic: 'Müşteri Desteği', percentage: 20 },
              { topic: 'Fiyatlandırma', percentage: 15 }
            ],
            detailedAnalysis: `
## Android Platformu Duygu Analizi

Android kullanıcıları genel olarak uygulamadan **%65 oranında memnun** görünüyor. Özellikle uygulama performansı ve kullanım kolaylığı konularında olumlu yorumlar var.

### Öne Çıkan Konular
- Kullanıcı arayüzü sadeliği ve gezinme kolaylığı
- İşlem hızı ve güvenilirliği
- Fiyat bildirimlerinin zamanında gelmesi

### Sorun Alanları
- Bazı cihazlarda yaşanan donma sorunları
- Bildirim sistemi gecikmesi
- Küçük ekranlarda görüntüleme sorunları
            `
          },
          ios: {
            positivePercentage: 70,
            neutralPercentage: 15,
            negativePercentage: 15,
            mainTopics: [
              { topic: 'Kullanıcı Arayüzü', percentage: 48 },
              { topic: 'Performans', percentage: 35 },
              { topic: 'Güvenlik', percentage: 28 },
              { topic: 'Müşteri Desteği', percentage: 22 },
              { topic: 'Fiyatlandırma', percentage: 18 }
            ],
            detailedAnalysis: `
## iOS Platformu Duygu Analizi

iOS kullanıcıları genel olarak uygulamadan **%70 oranında memnun** görünüyor. Özellikle tasarım ve stabil çalışma konularında olumlu yorumlar var.

### Öne Çıkan Konular
- Modern ve estetik arayüz
- Face ID ile hızlı giriş
- Grafik araçlarının kalitesi

### Sorun Alanları
- Bazı kullanıcılar için yüksek batarya tüketimi
- İşlem limitleri konusunda şikayetler
- Daha fazla kripto para birimi desteği talebi
            `
          }
        },
        improvements: {
          platformComparison: `
## Platform Karşılaştırması ve Öneriler

Her iki platform için de kullanıcı geri bildirimleri genel olarak olumlu olmakla birlikte, platform özelinde 
bazı farklılıklar gözlemlenmektedir.

### Android Avantajları
- Daha geniş cihaz yelpazesine erişim
- Kullanıcılar fiyat/performans odaklı
- Daha sık güncellemeler

### iOS Avantajları
- Daha yüksek kullanıcı memnuniyeti oranı
- Daha az cihaz çeşitliliği sayesinde optimizasyon kolaylığı
- Kullanıcılar tasarım odaklı

### Ortak İyileştirme Önerileri
1. Her iki platformda da bildirim sisteminin iyileştirilmesi
2. Eğitici içeriklerin arttırılması
3. Grafik araçlarının özelleştirilebilir hale getirilmesi
4. Müşteri destek sisteminin hızlandırılması
          `,
          recommendations: [
            {
              category: "Ortak Uygulanabilir",
              priority: "Yüksek",
              score: 5,
              description: "Otomatik piyasa analizi özelliği ekleyin",
              impact: "Her iki platformda da kullanıcıların daha bilinçli yatırım kararları almasını sağlayacak",
              userComments: [
                "Piyasa analizleri için başka uygulama kullanmak zorunda kalıyorum",
                "Temel göstergelere uygulama içinde erişebilmeyi isterdim"
              ]
            },
            {
              category: "Android Özel",
              priority: "Orta",
              score: 4,
              description: "Widget desteği ekleyin",
              impact: "Kullanıcıların ana ekrandan hızlıca bilgilere erişimini sağlayacak",
              userComments: [
                "Ana ekrandan fiyat takibi yapabilmek istiyorum",
                "Widget desteği olsa çok daha kullanışlı olurdu"
              ]
            },
            {
              category: "iOS Özel",
              priority: "Yüksek",
              score: 5,
              description: "Apple Watch desteği geliştirin",
              impact: "Mobil deneyimi genişleterek kullanıcı bağlılığını artıracak",
              userComments: [
                "Apple Watch üzerinden fiyat alarmları almak istiyorum",
                "Diğer finansal uygulamalar bunu sağlıyor"
              ]
            }
          ]
        }
      });
      
      setSnackbarMessage('Karşılaştırma başarıyla tamamlandı');
      setSnackbarSeverity('success');
      setShowSnackbar(true);
    } catch (err) {
      console.error('Karşılaştırma yapılırken hata:', err);
      setError((prev) => ({ 
        ...prev, 
        comparison: 'Karşılaştırma yapılırken bir hata oluştu. Lütfen daha sonra tekrar deneyin.' 
      }));
    } finally {
      setLoading((prev) => ({ ...prev, comparison: false }));
      setGlobalLoading(false);
    }
  };

  // Verileri yenile
  const handleRefreshData = () => {
    fetchAndroidData();
    fetchIosData();
    setComparisonData(null);
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Platform Karşılaştırması
      </Typography>
      
      <Typography variant="body1" paragraph>
        Android ve iOS platformlarındaki kullanıcı yorumlarını karşılaştırarak platformlar arasındaki farklılıkları 
        ve benzerlikleri analiz edin. Her platform için özelleştirilmiş iyileştirme stratejileri oluşturun.
      </Typography>
      
      {/* Kontrol Paneli */}
      <Paper sx={{ mb: 4, p: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <Box display="flex" alignItems="center">
              <Typography variant="subtitle1" fontWeight="bold" sx={{ mr: 2 }}>
                Veri Durumu:
              </Typography>
              
              <Box display="flex" alignItems="center" mr={3}>
                <Typography variant="body2" sx={{ mr: 1 }}>
                  Android:
                </Typography>
                {loading.androidData ? (
                  <CircularProgress size={20} />
                ) : androidData ? (
                  <Typography variant="body2" color="success.main">
                    Hazır
                  </Typography>
                ) : (
                  <Typography variant="body2" color="error.main">
                    Yok
                  </Typography>
                )}
              </Box>
              
              <Box display="flex" alignItems="center">
                <Typography variant="body2" sx={{ mr: 1 }}>
                  iOS:
                </Typography>
                {loading.iosData ? (
                  <CircularProgress size={20} />
                ) : iosData ? (
                  <Typography variant="body2" color="success.main">
                    Hazır
                  </Typography>
                ) : (
                  <Typography variant="body2" color="error.main">
                    Yok
                  </Typography>
                )}
              </Box>
            </Box>
          </Grid>
          
          <Grid item xs={12} md={6} display="flex" justifyContent={{ xs: 'flex-start', md: 'flex-end' }}>
            <Button 
              variant="contained" 
              color="secondary" 
              startIcon={<CompareArrowsIcon />} 
              onClick={handleCompareData}
              disabled={loading.comparison || !androidData || !iosData}
              sx={{ mr: 1 }}
            >
              {loading.comparison ? 'Karşılaştırılıyor...' : 'Karşılaştır'}
            </Button>
            
            <Button 
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={handleRefreshData}
              disabled={loading.androidData || loading.iosData}
            >
              Verileri Yenile
            </Button>
          </Grid>
        </Grid>
      </Paper>
      
      {/* Hata Mesajları */}
      {(error.androidData || error.iosData || error.comparison) && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error.androidData || error.iosData || error.comparison}
        </Alert>
      )}
      
      {/* Karşılaştırma Sonucu Yok Uyarısı */}
      {!loading.comparison && !comparisonData && !error.comparison && (
        <Alert severity="info" sx={{ mb: 3 }}>
          Karşılaştırma sonuçlarını görmek için yukarıdaki "Karşılaştır" butonuna tıklayın.
        </Alert>
      )}
      
      {/* Derecelendirme Karşılaştırması */}
      {comparisonData && (
        <>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <ComparisonChart 
                androidData={androidData?.ratings}
                iosData={iosData?.ratings}
                title="Derecelendirme Dağılımı Karşılaştırması"
                description="Android ve iOS kullanıcılarının verdikleri yıldız derecelendirmelerinin karşılaştırması"
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                Android Duygu Analizi
              </Typography>
              <SentimentAnalysisCard 
                sentimentData={comparisonData.sentimentComparison.android}
                platform="android"
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                iOS Duygu Analizi
              </Typography>
              <SentimentAnalysisCard 
                sentimentData={comparisonData.sentimentComparison.ios}
                platform="ios"
              />
            </Grid>
          </Grid>
          
          <Box mt={4}>
            <Typography variant="h5" gutterBottom>
              Platform Karşılaştırması ve Öneriler
            </Typography>
            
            <Paper sx={{ p: 3, mb: 3 }}>
              <Box sx={{ 
                '& p': { mb: 1 },
                '& h2, & h3': { mt: 2, mb: 1 },
                '& ul, & ol': { pl: 3, mb: 2 }
              }}>
                <div dangerouslySetInnerHTML={{ __html: comparisonData.improvements.platformComparison }} />
              </Box>
            </Paper>
            
            <Typography variant="h6" gutterBottom>
              Platforma Özel İyileştirme Önerileri
            </Typography>
            
            <ImprovementRecommendationsCard 
              improvementsData={{
                recommendations: comparisonData.improvements.recommendations
              }}
              platform="comparison"
            />
          </Box>
        </>
      )}
      
      {/* Snackbar */}
      <Snackbar
        open={showSnackbar}
        autoHideDuration={6000}
        onClose={() => setShowSnackbar(false)}
      >
        <Alert 
          onClose={() => setShowSnackbar(false)} 
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

export default ComparisonPage;