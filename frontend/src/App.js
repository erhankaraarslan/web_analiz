import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Box, CircularProgress, Typography } from '@mui/material';

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

  // Global yükleme durumu için context
  const loadingContext = {
    setLoading,
    setLoadingMessage
  };

  return (
    <>
      {loading && (
        <Box className="loading-overlay">
          <CircularProgress size={60} />
          <Typography className="loading-text">
            {loadingMessage || 'Yükleniyor...'}
          </Typography>
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