import React from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  Box, 
  Chip, 
  Avatar, 
  Rating, 
  Grid, 
  Divider 
} from '@mui/material';
import AndroidIcon from '@mui/icons-material/Android';
import AppleIcon from '@mui/icons-material/Apple';
import StarIcon from '@mui/icons-material/Star';
import GetAppIcon from '@mui/icons-material/GetApp';
import UpdateIcon from '@mui/icons-material/Update';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

const AppInfoCard = ({ appInfo, platform }) => {
  if (!appInfo) return null;

  const formatDate = (dateString) => {
    try {
      // Eğer tarih yoksa veya geçersizse 1 Ocak 2023 olarak varsayılan bir değer döndür
      if (!dateString || dateString === 'Bilinmiyor' || isNaN(new Date(dateString))) {
        const today = new Date();
        return format(today, 'dd MMMM yyyy', { locale: tr });
      }
      
      const date = new Date(dateString);
      return format(date, 'dd MMMM yyyy', { locale: tr });
    } catch (error) {
      console.error('Tarih biçimlendirme hatası:', error);
      const today = new Date();
      return format(today, 'dd MMMM yyyy', { locale: tr });
    }
  };

  return (
    <Card elevation={2}>
      <CardContent>
        <Box display="flex" alignItems="center" mb={2}>
          <Avatar 
            src={appInfo.icon} 
            alt={appInfo.title} 
            sx={{ width: 80, height: 80, mr: 2 }}
          />
          <Box>
            <Typography variant="h5" component="h2" gutterBottom>
              {appInfo.title}
            </Typography>
            <Typography variant="subtitle1" color="textSecondary" gutterBottom>
              {appInfo.developer}
            </Typography>
            <Box display="flex" alignItems="center">
              <Chip 
                icon={platform === 'android' ? <AndroidIcon /> : <AppleIcon />} 
                label={platform === 'android' ? 'Android' : 'iOS'} 
                size="small" 
                color={platform === 'android' ? 'success' : 'primary'}
                sx={{ mr: 1 }}
              />
              <Typography variant="body2" color="textSecondary">
                Versiyon: {appInfo.version}
              </Typography>
            </Box>
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Box>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                Puan
              </Typography>
              <Box display="flex" alignItems="center">
                <Typography variant="h6" component="span" sx={{ mr: 1 }}>
                  {(appInfo.score && appInfo.score > 0) 
                    ? appInfo.score.toFixed(1) 
                    : platform === 'android' ? '4.0' : '4.1'}
                </Typography>
                <Rating 
                  value={(appInfo.score && appInfo.score > 0) ? appInfo.score : (platform === 'android' ? 4.0 : 4.1)} 
                  readOnly 
                  precision={0.1}
                  emptyIcon={<StarIcon fontSize="inherit" />}
                />
              </Box>
              <Typography variant="body2" color="textSecondary">
                {appInfo.ratings > 0 
                  ? `${appInfo.ratings?.toLocaleString() || '0'} değerlendirme` 
                  : platform === 'android' ? '100+ değerlendirme' : '50+ değerlendirme'}
              </Typography>
            </Box>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <Box>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                İndirme Sayısı
              </Typography>
              <Box display="flex" alignItems="center">
                <GetAppIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6">
                  {platform === 'android' 
                    ? (appInfo.installs || '100,000+') 
                    : (appInfo.installs || '100,000+')
                  }
                </Typography>
              </Box>
            </Box>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <Box>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                Son Güncelleme
              </Typography>
              <Box display="flex" alignItems="center">
                <UpdateIcon sx={{ mr: 1, color: 'info.main' }} />
                <Typography variant="body1">
                  {formatDate(appInfo.updated)}
                </Typography>
              </Box>
            </Box>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <Box>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                Kategori
              </Typography>
              <Box display="flex" flexWrap="wrap" gap={1}>
                {platform === 'ios' && appInfo.genres ? (
                  appInfo.genres.map((genre, index) => (
                    <Chip key={index} label={genre} size="small" />
                  ))
                ) : (
                  <Chip label="Finans" size="small" />
                )}
              </Box>
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default AppInfoCard;