import React, { useState, useEffect } from 'react';
import { 
  Grid, 
  Typography,
  Box,
  Paper,
  TextField,
  Button,
  Alert,
  Snackbar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  Switch,
  FormControlLabel
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import SettingsIcon from '@mui/icons-material/Settings';
import SecurityIcon from '@mui/icons-material/Security';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import AndroidIcon from '@mui/icons-material/Android';
import AppleIcon from '@mui/icons-material/Apple';

const SettingsPage = () => {
  // LocalStorage'dan ayarları yükleme
  const [settings, setSettings] = useState(() => {
    const savedSettings = localStorage.getItem('reviewAnalyzerSettings');
    if (savedSettings) {
      try {
        return JSON.parse(savedSettings);
      } catch (error) {
        console.error('Ayarlar yüklenirken hata oluştu:', error);
      }
    }
    
    // Varsayılan ayarlar
    return {
      api: {
        openaiApiKey: '',
        anthropicApiKey: '',
        defaultProvider: 'openai'
      },
      apps: {
        androidAppId: 'com.garantibbvadigitalassets.crypto',
        iosAppId: '6470199333',
        reviewsLimit: 100,
        defaultCountry: 'tr'
      },
      ui: {
        darkMode: false,
        language: 'tr',
        autoRefresh: false,
        refreshInterval: 60
      }
    };
  });

  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  // useEffect ile ilk yüklemede ayarları kontrol et
  useEffect(() => {
    const savedSettings = localStorage.getItem('reviewAnalyzerSettings');
    if (savedSettings) {
      try {
        const parsedSettings = JSON.parse(savedSettings);
        setSettings(parsedSettings);
        console.log('Ayarlar başarıyla yüklendi:', parsedSettings);
      } catch (error) {
        console.error('Kayıtlı ayarları ayrıştırırken hata:', error);
      }
    }
  }, []);

  // Ayar değişikliği
  const handleSettingChange = (section, key, value) => {
    setSettings((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value
      }
    }));
  };

  // Ayarları kaydet
  const handleSaveSettings = () => {
    try {
      // LocalStorage'a kaydet
      localStorage.setItem('reviewAnalyzerSettings', JSON.stringify(settings));
      
      // Başarı mesajı göster
      setSnackbarMessage('Ayarlar başarıyla kaydedildi');
      setSnackbarSeverity('success');
      setShowSnackbar(true);
      
      // Sayfayı yenile (ayarların hemen uygulanması için)
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error) {
      console.error('Ayarlar kaydedilirken hata oluştu:', error);
      setSnackbarMessage('Ayarlar kaydedilirken bir hata oluştu');
      setSnackbarSeverity('error');
      setShowSnackbar(true);
    }
  };

  // Snackbar kapatma
  const handleCloseSnackbar = () => {
    setShowSnackbar(false);
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Uygulama Ayarları
      </Typography>
      
      <Typography variant="body1" paragraph>
        Uygulama davranışını ve bağlantı ayarlarını yapılandırın. Bu değişiklikler tüm analiz ve karşılaştırmalara uygulanacaktır.
      </Typography>
      
      <Grid container spacing={4}>
        {/* API Ayarları */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Box display="flex" alignItems="center" mb={2}>
              <SecurityIcon sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="h6">
                API Yapılandırması
              </Typography>
            </Box>
            
            <Divider sx={{ mb: 3 }} />
            
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  label="OpenAI API Anahtarı"
                  value={settings.api.openaiApiKey}
                  onChange={(e) => handleSettingChange('api', 'openaiApiKey', e.target.value)}
                  fullWidth
                  type="password"
                  placeholder="sk-..."
                  helperText="OpenAI GPT-4o modeli için API anahtarı"
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  label="Anthropic API Anahtarı"
                  value={settings.api.anthropicApiKey}
                  onChange={(e) => handleSettingChange('api', 'anthropicApiKey', e.target.value)}
                  fullWidth
                  type="password"
                  placeholder="sk-ant-..."
                  helperText="Anthropic Claude modelleri için API anahtarı"
                />
              </Grid>
              
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Varsayılan AI Sağlayıcı</InputLabel>
                  <Select
                    value={settings.api.defaultProvider}
                    label="Varsayılan AI Sağlayıcı"
                    onChange={(e) => handleSettingChange('api', 'defaultProvider', e.target.value)}
                  >
                    <MenuItem value="anthropic">Claude (Anthropic)</MenuItem>
                    <MenuItem value="openai">GPT-4o (OpenAI)</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
        
        {/* Uygulama Ayarları */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Box display="flex" alignItems="center" mb={2}>
              <SettingsIcon sx={{ mr: 1, color: 'secondary.main' }} />
              <Typography variant="h6">
                Uygulama Yapılandırması
              </Typography>
            </Box>
            
            <Divider sx={{ mb: 3 }} />
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Box display="flex" alignItems="center" mb={1}>
                  <AndroidIcon fontSize="small" sx={{ mr: 0.5, color: 'success.main' }} />
                  <Typography variant="subtitle2">
                    Android Uygulama ID
                  </Typography>
                </Box>
                <TextField
                  value={settings.apps.androidAppId}
                  onChange={(e) => handleSettingChange('apps', 'androidAppId', e.target.value)}
                  fullWidth
                  size="small"
                  placeholder="com.example.app"
                  helperText="Google Play Store uygulama ID"
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Box display="flex" alignItems="center" mb={1}>
                  <AppleIcon fontSize="small" sx={{ mr: 0.5, color: 'primary.main' }} />
                  <Typography variant="subtitle2">
                    iOS Uygulama ID
                  </Typography>
                </Box>
                <TextField
                  value={settings.apps.iosAppId}
                  onChange={(e) => handleSettingChange('apps', 'iosAppId', e.target.value)}
                  fullWidth
                  size="small"
                  placeholder="1234567890"
                  helperText="App Store uygulama ID"
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Yorum Limiti"
                  type="number"
                  value={settings.apps.reviewsLimit}
                  onChange={(e) => handleSettingChange('apps', 'reviewsLimit', parseInt(e.target.value))}
                  fullWidth
                  inputProps={{ min: 10, max: 500 }}
                  helperText="Her sorguda çekilecek maksimum yorum sayısı"
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Varsayılan Ülke</InputLabel>
                  <Select
                    value={settings.apps.defaultCountry}
                    label="Varsayılan Ülke"
                    onChange={(e) => handleSettingChange('apps', 'defaultCountry', e.target.value)}
                  >
                    <MenuItem value="tr">Türkiye</MenuItem>
                    <MenuItem value="us">ABD</MenuItem>
                    <MenuItem value="gb">Birleşik Krallık</MenuItem>
                    <MenuItem value="de">Almanya</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
        
        {/* Arayüz Ayarları */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Box display="flex" alignItems="center" mb={2}>
              <LightbulbIcon sx={{ mr: 1, color: 'warning.main' }} />
              <Typography variant="h6">
                Arayüz Ayarları
              </Typography>
            </Box>
            
            <Divider sx={{ mb: 3 }} />
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <FormControlLabel
                  control={
                    <Switch 
                      checked={settings.ui.darkMode}
                      onChange={(e) => handleSettingChange('ui', 'darkMode', e.target.checked)}
                      color="primary"
                    />
                  }
                  label="Koyu Mod"
                />
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Dil</InputLabel>
                  <Select
                    value={settings.ui.language}
                    label="Dil"
                    onChange={(e) => handleSettingChange('ui', 'language', e.target.value)}
                  >
                    <MenuItem value="tr">Türkçe</MenuItem>
                    <MenuItem value="en">İngilizce</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <FormControlLabel
                  control={
                    <Switch 
                      checked={settings.ui.autoRefresh}
                      onChange={(e) => handleSettingChange('ui', 'autoRefresh', e.target.checked)}
                      color="primary"
                    />
                  }
                  label="Otomatik Yenileme"
                />
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  label="Yenileme Aralığı (dk)"
                  type="number"
                  value={settings.ui.refreshInterval}
                  onChange={(e) => handleSettingChange('ui', 'refreshInterval', parseInt(e.target.value))}
                  fullWidth
                  size="small"
                  disabled={!settings.ui.autoRefresh}
                  inputProps={{ min: 5, max: 1440 }}
                />
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
      
      {/* Kaydet Butonu */}
      <Box display="flex" justifyContent="flex-end" mt={4}>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<SaveIcon />}
          onClick={handleSaveSettings}
          size="large"
        >
          Ayarları Kaydet
        </Button>
      </Box>
      
      {/* Bilgilendirme notu */}
      <Alert severity="info" sx={{ mt: 4 }}>
        <Typography variant="body2">
          <strong>Not:</strong> API anahtarları güvenli bir şekilde saklanır ve yalnızca analiz isteklerinde kullanılır.
          Uygulama ayarları değiştirildiğinde, yeni ayarlar gelecek analiz işlemleri için kullanılacaktır.
        </Typography>
      </Alert>
      
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

export default SettingsPage;