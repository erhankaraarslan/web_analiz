import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Box, CircularProgress, Typography } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

// Layout
import Layout from './components/Layout';

// Pages
import Dashboard from './pages/Dashboard';
import AndroidAnalysis from './pages/AndroidAnalysis';
import IosAnalysis from './pages/IosAnalysis';
import ComparisonPage from './pages/ComparisonPage';
import SettingsPage from './pages/SettingsPage';
import NotFound from './pages/NotFound';

function App() {
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [completedSteps, setCompletedSteps] = useState([]);

  // Global yükleme durumu için context
  const loadingContext = {
    setLoading,
    setLoadingMessage,
    setCompletedSteps
  };

  // Analiz adımları
  const steps = [
    'Yorumlar hazırlanıyor',
    'Analiz yapılıyor',
    'Sonuçlar işleniyor',
    'Raporlar oluşturuluyor'
  ];

  return (
    <>
      {loading && (
        <Box className="loading-overlay">
          <Box sx={{ bgcolor: 'white', borderRadius: 2, p: 4, maxWidth: 500, boxShadow: 3, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <CircularProgress size={60} sx={{ mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              {loadingMessage || 'Yükleniyor...'}
            </Typography>
            
            <Box sx={{ width: '100%', mt: 2 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom textAlign="center">
                Analiz işlemi devam ediyor. Bu işlem, incelenen yorum sayısına bağlı olarak 1-3 dakika sürebilir.
              </Typography>
              
              <Box sx={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 1, mt: 2 }}>
                {steps.map((step, index) => (
                  <Box key={index} sx={{ 
                    bgcolor: completedSteps.includes(index) ? 'success.main' : 'primary.main', 
                    color: 'white', 
                    borderRadius: 5, 
                    px: 2, 
                    py: 0.5,
                    fontSize: '0.75rem',
                    display: 'flex',
                    alignItems: 'center',
                    transition: 'background-color 0.3s'
                  }}>
                    {completedSteps.includes(index) ? (
                      <CheckCircleIcon sx={{ mr: 1, fontSize: 16 }} />
                    ) : (
                      <CircularProgress size={12} sx={{ mr: 1, color: 'white' }} />
                    )}
                    {step}
                  </Box>
                ))}
              </Box>
            </Box>
          </Box>
        </Box>
      )}
      
      <Routes>
        <Route 
          path="/" 
          element={<Layout loadingContext={loadingContext} />}
        >
          <Route index element={<Dashboard loadingContext={loadingContext} />} />
          <Route path="android" element={<AndroidAnalysis loadingContext={loadingContext} />} />
          <Route path="ios" element={<IosAnalysis loadingContext={loadingContext} />} />
          <Route path="comparison" element={<ComparisonPage loadingContext={loadingContext} />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;