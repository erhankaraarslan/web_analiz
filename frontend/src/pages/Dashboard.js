import React, { useState, useEffect } from 'react';
import { 
  Grid, 
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  Divider,
  Skeleton,
  Alert,
  AlertTitle,
  Rating
} from '@mui/material';
import AndroidIcon from '@mui/icons-material/Android';
import AppleIcon from '@mui/icons-material/Apple';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import StarIcon from '@mui/icons-material/Star';
import { useNavigate } from 'react-router-dom';
import { ApiService } from '../services/api';

const Dashboard = ({ loadingContext }) => {
  const [androidInfo, setAndroidInfo] = useState(null);
  const [iosInfo, setIosInfo] = useState(null);
  const [error, setError] = useState({ android: null, ios: null, general: null });
  const [isLoading, setIsLoading] = useState({ android: true, ios: true });
  
  const navigate = useNavigate();
  const { setLoading, setLoadingMessage } = loadingContext;

  useEffect(() => {
    const fetchAppInfo = async () => {
    // Android ve iOS için ayrı ayrı veri çekme işlemleri
    // Android bilgilerini getir
    const fetchAndroidInfo = async () => {
    try {
    setIsLoading(prev => ({ ...prev, android: true }));
    setError(prev => ({ ...prev, android: null }));
    
    const androidResponse = await ApiService.android.getAppInfo();
    if (!androidResponse.data.success) {
        throw new Error(androidResponse.data.error || 'Veri çekilemedi');
    }
    setAndroidInfo(androidResponse.data.data);
    } catch (err) {
    console.error('Android uygulama bilgileri alınamadı:', err);
    const errorMessage = err.response?.data?.error || err.message || 'Android uygulama bilgilerine şu anda erişilemiyor';
      setError(prev => ({ 
      ...prev, 
        android: errorMessage
        }));
      } finally {
        setIsLoading(prev => ({ ...prev, android: false }));
      }
    };
    
    // iOS bilgilerini getir
    const fetchIosInfo = async () => {
    try {
    setIsLoading(prev => ({ ...prev, ios: true }));
      setError(prev => ({ ...prev, ios: null }));
    
    const iosResponse = await ApiService.ios.getAppInfo();
    if (!iosResponse.data.success) {
    throw new Error(iosResponse.data.error || 'Veri çekilemedi');
    }
      setIosInfo(iosResponse.data.data);
    } catch (err) {
      console.error('iOS uygulama bilgileri alınamadı:', err);
        const errorMessage = err.response?.data?.error || err.message || 'iOS uygulama bilgilerine şu anda erişilemiyor';
        setError(prev => ({ 
          ...prev, 
          ios: errorMessage
        }));
        } finally {
        setIsLoading(prev => ({ ...prev, ios: false }));
      }
    };
    
    // Her iki fonksiyonu da çağır ama ayrı ayrı yönet
    fetchAndroidInfo();
    fetchIosInfo();
  };

    fetchAppInfo();
  }, []);

  const navigateToAndroidAnalysis = () => {
    navigate('/android');
  };

  const navigateToIosAnalysis = () => {
    navigate('/ios');
  };

  const navigateToComparison = () => {
    navigate('/comparison');
  };

  return (
    <div>
      <Typography variant="h4" component="h1" gutterBottom>
        Garanti BBVA Kripto Uygulama Yorum Analizi
      </Typography>
      
      <Typography variant="body1" paragraph>
        Bu dashboard, Garanti BBVA Kripto mobil uygulamasının Google Play ve App Store'daki kullanıcı yorumlarının 
        detaylı analizini sağlar. Yorumların duygu analizi, kullanıcı personaları ve iyileştirme önerileri gibi 
        önemli içgörüler elde edebilirsiniz.
      </Typography>
      
      {error.general && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error.general}
        </Alert>
      )}
      
      <Grid container spacing={4} sx={{ my: 2 }}>
        {/* Android Kart */}
        <Grid item xs={12} md={6}>
          <Card 
            sx={{ 
              height: '100%', 
              display: 'flex', 
              flexDirection: 'column',
              ':hover': {
                boxShadow: 6
              }
            }}
          >
            <CardContent sx={{ flex: 1 }}>
              <Box display="flex" alignItems="center" mb={2}>
                <AndroidIcon sx={{ fontSize: 40, color: error.android ? 'error.main' : 'success.main', mr: 2 }} />
                <Typography variant="h5" component="h2">
                  Android Analizi
                </Typography>
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              {isLoading.android ? (
                <Box>
                  <Skeleton variant="rectangular" height={60} sx={{ mb: 2 }} />
                  <Skeleton variant="text" height={30} />
                  <Skeleton variant="text" height={30} />
                  <Skeleton variant="text" height={30} />
                </Box>
              ) : error.android ? (
                <Box>
                  <Alert severity="error" sx={{ mb: 2 }}>
                    <AlertTitle>Veri Çekilemedi</AlertTitle>
                    Uygulama bilgilerine şu anda erişilemiyor. Servis geçici olarak kullanılamaz durumda.
                  </Alert>
                  <Box display="flex" justifyContent="center" mt={2}>
                    <img 
                      src="/warning-icon.svg" 
                      alt="Servis Kullanılamaz" 
                      style={{ width: 80, height: 80, opacity: 0.7 }}
                    />
                  </Box>
                </Box>
              ) : androidInfo ? (
                <Box>
                  <Box display="flex" alignItems="center" mb={2}>
                    <Box
                      component="img"
                      src={androidInfo.icon}
                      alt="Android app icon"
                      sx={{ width: 60, height: 60, mr: 2, borderRadius: 1 }}
                    />
                    <Box>
                      <Typography variant="subtitle1" fontWeight="bold">
                        {androidInfo.title}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {androidInfo.developer}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Versiyon: {androidInfo.version}
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Box display="flex" justifyContent="space-between" mb={2}>
                    <Box display="flex" alignItems="center">
                      <Rating 
                        value={androidInfo.score && androidInfo.score > 0 ? androidInfo.score : 4.0} 
                        readOnly 
                        precision={0.1}
                        size="small"
                        emptyIcon={<StarIcon fontSize="inherit" />}
                        sx={{ color: 'success.main' }}
                      />
                      <Typography variant="body1" sx={{ ml: 1 }}>
                        <strong>{androidInfo.score && androidInfo.score > 0 ? androidInfo.score.toFixed(1) : '4.0'}</strong>
                      </Typography>
                    </Box>
                    <Typography variant="body1">
                      İndirilme: <strong>{androidInfo.installs || '100,000+'}</strong>
                    </Typography>
                  </Box>
                  
                  <Typography variant="body2" sx={{ mb: 2 }}>
                    {androidInfo.reviews && androidInfo.reviews > 0 
                      ? `${androidInfo.reviews.toLocaleString()} yorum ile` 
                      : '100+ yorum ile'} kullanıcıların görüşlerini analiz edin ve uygulamanızı iyileştirin.
                  </Typography>
                </Box>
              ) : (
                <Typography variant="body1">
                  Android uygulama verisi bulunamadı.
                </Typography>
              )}
            </CardContent>
            
            <Box p={2} pt={0}>
              <Button 
                variant="contained" 
                color="success" 
                fullWidth
                startIcon={<AndroidIcon />}
                onClick={navigateToAndroidAnalysis}
                disabled={isLoading.android}
              >
                Android Yorum Analizine Git
              </Button>
            </Box>
          </Card>
        </Grid>
        
        {/* iOS Kart */}
        <Grid item xs={12} md={6}>
          <Card 
            sx={{ 
              height: '100%', 
              display: 'flex', 
              flexDirection: 'column',
              ':hover': {
                boxShadow: 6
              }
            }}
          >
            <CardContent sx={{ flex: 1 }}>
              <Box display="flex" alignItems="center" mb={2}>
                <AppleIcon sx={{ fontSize: 40, color: error.ios ? 'error.main' : 'primary.main', mr: 2 }} />
                <Typography variant="h5" component="h2">
                  iOS Analizi
                </Typography>
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              {isLoading.ios ? (
                <Box>
                  <Skeleton variant="rectangular" height={60} sx={{ mb: 2 }} />
                  <Skeleton variant="text" height={30} />
                  <Skeleton variant="text" height={30} />
                  <Skeleton variant="text" height={30} />
                </Box>
              ) : error.ios ? (
                <Box>
                  <Alert severity="error" sx={{ mb: 2 }}>
                    <AlertTitle>Veri Çekilemedi</AlertTitle>
                    Uygulama bilgilerine şu anda erişilemiyor. Servis geçici olarak kullanılamaz durumda.
                  </Alert>
                  <Box display="flex" justifyContent="center" mt={2}>
                    <img 
                      src="/warning-icon.svg" 
                      alt="Servis Kullanılamaz" 
                      style={{ width: 80, height: 80, opacity: 0.7 }}
                    />
                  </Box>
                </Box>
              ) : iosInfo ? (
                <Box>
                  <Box display="flex" alignItems="center" mb={2}>
                    <Box
                      component="img"
                      src={iosInfo.icon}
                      alt="iOS app icon"
                      sx={{ width: 60, height: 60, mr: 2, borderRadius: 1 }}
                    />
                    <Box>
                      <Typography variant="subtitle1" fontWeight="bold">
                        {iosInfo.title}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {iosInfo.developer}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Versiyon: {iosInfo.version}
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Box display="flex" justifyContent="space-between" mb={2}>
                    <Box display="flex" alignItems="center">
                      <Rating 
                        value={iosInfo.score && iosInfo.score > 0 ? iosInfo.score : 4.1} 
                        readOnly 
                        precision={0.1}
                        size="small"
                        emptyIcon={<StarIcon fontSize="inherit" />}
                        sx={{ color: 'primary.main' }}
                      />
                      <Typography variant="body1" sx={{ ml: 1 }}>
                        <strong>{iosInfo.score && iosInfo.score > 0 ? iosInfo.score.toFixed(1) : '4.1'}</strong>
                      </Typography>
                    </Box>
                    <Typography variant="body1">
                      {iosInfo.price === 0 ? 'Ücretsiz' : `${iosInfo.price} ${iosInfo.currency || 'TL'}`}
                    </Typography>
                  </Box>
                  
                  <Typography variant="body2" sx={{ mb: 2 }}>
                    {iosInfo.reviews && iosInfo.reviews > 0 
                      ? `${iosInfo.reviews.toLocaleString()} yorum ile` 
                      : '200+ yorum ile'} iOS kullanıcılarının görüşlerini analiz edin ve uygulamanızı iyileştirin.
                  </Typography>
                </Box>
              ) : (
                <Typography variant="body1">
                  iOS uygulama verisi bulunamadı.
                </Typography>
              )}
            </CardContent>
            
            <Box p={2} pt={0}>
              <Button 
                variant="contained" 
                color="primary" 
                fullWidth
                startIcon={<AppleIcon />}
                onClick={navigateToIosAnalysis}
                disabled={isLoading.ios}
              >
                iOS Yorum Analizine Git
              </Button>
            </Box>
          </Card>
        </Grid>
      </Grid>
      
      {/* Karşılaştırma Kartı */}
      <Card sx={{ mt: 4 }}>
        <CardContent>
          <Box display="flex" alignItems="center" mb={3}>
            <CompareArrowsIcon sx={{ fontSize: 40, color: 'secondary.main', mr: 2 }} />
            <Typography variant="h5" component="h2">
              Platform Karşılaştırması
            </Typography>
          </Box>
          
          <Typography variant="body1" paragraph>
            Android ve iOS platformlarındaki kullanıcı yorumlarını yan yana karşılaştırarak, platformlar arasındaki 
            farklılıkları ve benzerlikleri belirleyin. Bu analiz, her platform için özelleştirilmiş stratejiler 
            geliştirmenize yardımcı olacaktır.
          </Typography>
          
          <Button 
            variant="contained" 
            color="secondary" 
            startIcon={<CompareArrowsIcon />}
            onClick={navigateToComparison}
            disabled={isLoading.android && isLoading.ios}
          >
            Karşılaştırmaya Git
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;