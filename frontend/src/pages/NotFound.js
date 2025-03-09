import React from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Paper 
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import HomeIcon from '@mui/icons-material/Home';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <Box 
      display="flex" 
      flexDirection="column" 
      alignItems="center" 
      justifyContent="center" 
      minHeight="70vh"
    >
      <Paper 
        sx={{ 
          p: 5, 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center',
          maxWidth: 500
        }}
      >
        <ErrorOutlineIcon color="error" sx={{ fontSize: 80, mb: 2 }} />
        
        <Typography variant="h4" component="h1" gutterBottom textAlign="center">
          Sayfa Bulunamadı
        </Typography>
        
        <Typography variant="body1" paragraph textAlign="center">
          Aradığınız sayfa bulunamadı veya taşınmış olabilir.
        </Typography>
        
        <Button 
          variant="contained" 
          startIcon={<HomeIcon />}
          onClick={() => navigate('/')}
          sx={{ mt: 2 }}
        >
          Ana Sayfaya Dön
        </Button>
      </Paper>
    </Box>
  );
};

export default NotFound;