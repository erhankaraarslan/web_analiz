import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  Box, 
  Chip, 
  Rating, 
  Avatar, 
  List, 
  ListItem, 
  Divider,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  InputAdornment,
  IconButton,
  Pagination
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import StarIcon from '@mui/icons-material/Star';
import AndroidIcon from '@mui/icons-material/Android';
import AppleIcon from '@mui/icons-material/Apple';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

// Tarih formatlamayı sağlayan yardımcı fonksiyon
const formatDate = (review) => {
  try {
    // Önce date, sonra updated alanını kontrol et
    let dateStr = null;
    
    if (review.date) {
      dateStr = review.date;
    } else if (review.updated) {
      dateStr = review.updated;
    }
    
    // Tarih yoksa bilgi mesajı döndür
    if (!dateStr) return 'Tarih bilgisi yok';
    
    // Tarih formatını "DD MMMM YYYY" olarak ayarlayalım
    return format(new Date(dateStr), 'dd MMMM yyyy', { locale: tr });
  } catch (err) {
    console.error('Tarih formatlanırken hata:', err);
    return 'Geçersiz tarih';
  }
};

const ReviewList = ({ reviews = [], platform, onLoadMore, hasMoreReviews }) => {
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const reviewsPerPage = 10;
  
  // Yorumları filtrele - reviews dizisinin var olduğundan emin ol
  const filteredReviews = Array.isArray(reviews) ? reviews.filter(review => {
    // Derecelendirme filtresi
    const passesRatingFilter = 
      filter === 'all' || 
      (filter === 'positive' && review.score >= 4) ||
      (filter === 'neutral' && review.score === 3) ||
      (filter === 'negative' && review.score <= 2);
    
    // Arama filtresi - metin araması
    const passesSearchFilter = 
      !search || 
      (review.text && review.text.toLowerCase().includes(search.toLowerCase())) || 
      (review.title && review.title.toLowerCase().includes(search.toLowerCase()));
    
    return passesRatingFilter && passesSearchFilter;
  }) : [];
  
  // Sayfalandırma
  const totalPages = Math.ceil(filteredReviews.length / reviewsPerPage);
  const paginatedReviews = filteredReviews.slice(
    (page - 1) * reviewsPerPage, 
    page * reviewsPerPage
  );

  // Platform ikonu
  const PlatformIcon = platform === 'android' ? AndroidIcon : AppleIcon;
  
  // Filtre değiştiğinde sayfa 1'e dön
  const handleFilterChange = (event) => {
    setFilter(event.target.value);
    setPage(1);
  };
  
  // Arama değiştiğinde sayfa 1'e dön
  const handleSearchChange = (event) => {
    setSearch(event.target.value);
    setPage(1);
  };
  
  // Aramayı temizle
  const handleClearSearch = () => {
    setSearch('');
    setPage(1);
  };
  
  // Sayfa değişimi
  const handlePageChange = (event, value) => {
    setPage(value);
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" component="h2" gutterBottom>
          Kullanıcı Yorumları
        </Typography>
        
        {/* Filtreler */}
        <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} gap={2} mb={3}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Derecelendirme</InputLabel>
            <Select
              value={filter}
              label="Derecelendirme"
              onChange={handleFilterChange}
            >
              <MenuItem value="all">Tümü</MenuItem>
              <MenuItem value="positive">Olumlu (4-5)</MenuItem>
              <MenuItem value="neutral">Nötr (3)</MenuItem>
              <MenuItem value="negative">Olumsuz (1-2)</MenuItem>
            </Select>
          </FormControl>
          
          <TextField
            size="small"
            label="Yorumlarda ara"
            value={search}
            onChange={handleSearchChange}
            fullWidth
            sx={{ flexGrow: 1 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
              endAdornment: search && (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="temizle"
                    onClick={handleClearSearch}
                    edge="end"
                    size="small"
                  >
                    <ClearIcon />
                  </IconButton>
                </InputAdornment>
              )
            }}
          />
        </Box>
        
        {/* Yorumlar listesi */}
        {paginatedReviews.length > 0 ? (
          <>
            <List sx={{ bgcolor: 'background.paper' }}>
              {paginatedReviews.map((review, index) => (
                <React.Fragment key={review.id || index}>
                  <ListItem alignItems="flex-start" sx={{ px: 1 }}>
                    <Box sx={{ width: '100%' }}>
                      <Box display="flex" alignItems="center" mb={1}>
                        <Avatar 
                          sx={{ 
                            bgcolor: review.score >= 4 
                              ? 'success.light' 
                              : review.score === 3 
                                ? 'warning.light' 
                                : 'error.light',
                            width: 36,
                            height: 36,
                            mr: 1
                          }}
                        >
                          {review.userName?.charAt(0) || review.userImage?.charAt(0) || 'U'}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2">
                            {review.userName || review.userImage || 'Anonim Kullanıcı'}
                          </Typography>
                          <Box display="flex" alignItems="center">
                            <Rating 
                              value={review.score} 
                              readOnly 
                              size="small"
                              emptyIcon={<StarIcon fontSize="inherit" />}
                            />
                            <Typography variant="caption" sx={{ ml: 1 }}>
                              {formatDate(review)}
                              {/* Hem iOS hem Android için versiyon bilgisini göster */}
                              {review.version && <span> • v{review.version}</span>}
                            </Typography>
                            <Chip 
                              icon={<PlatformIcon fontSize="small" />}
                              label={platform === 'android' ? 'Android' : 'iOS'}
                              size="small"
                              sx={{ ml: 1 }}
                              color={platform === 'android' ? 'success' : 'primary'}
                            />
                          </Box>
                        </Box>
                      </Box>
                      {review.title && (
                        <Typography variant="subtitle2" gutterBottom>
                          {review.title}
                        </Typography>
                      )}
                      <Typography variant="body2" paragraph>
                        {review.text || 'Bu yorum için içerik bulunmuyor.'}
                      </Typography>
                      
                      {review.replyDate && (
                        <Box 
                          sx={{ 
                            pl: 2, 
                            borderLeft: '2px solid', 
                            borderColor: 'secondary.main',
                            mb: 1
                          }}
                        >
                          <Typography variant="caption" color="textSecondary">
                            Geliştirici yanıtı - {format(new Date(review.replyDate), 'dd MMMM yyyy', { locale: tr })}
                          </Typography>
                          <Typography variant="body2">
                            {review.replyText}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </ListItem>
                  {index < paginatedReviews.length - 1 && <Divider component="li" />}
                </React.Fragment>
              ))}
            </List>

            {/* Sayfalandırma */}
            <Box display="flex" justifyContent="center" mt={2}>
              <Pagination 
                count={totalPages} 
                page={page} 
                onChange={handlePageChange}
                color="primary"
              />
            </Box>
          </>
        ) : (
          <Typography variant="body1" align="center" py={4}>
            {search 
              ? `"${search}" için sonuç bulunamadı.` 
              : 'Seçtiğiniz kriterlere uygun yorum bulunamadı.'}
          </Typography>
        )}
        
        {/* Daha Fazla Yükle butonu */}
        {hasMoreReviews && (
          <Box display="flex" justifyContent="center" mt={2}>
            <Button 
              variant="outlined" 
              onClick={onLoadMore}
              endIcon={<PlatformIcon />}
            >
              Daha Fazla Yorum Yükle
            </Button>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default ReviewList;