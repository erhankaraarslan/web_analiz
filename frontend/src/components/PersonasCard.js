import React from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  Box, 
  Avatar, 
  Divider, 
  Paper,
  Grid,
  Chip 
} from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import SentimentSatisfiedAltIcon from '@mui/icons-material/SentimentSatisfiedAlt';
import SentimentNeutralIcon from '@mui/icons-material/SentimentNeutral';
import SentimentVeryDissatisfiedIcon from '@mui/icons-material/SentimentVeryDissatisfied';
import ReactMarkdown from 'react-markdown';

const PersonasCard = ({ personasData, platform }) => {
  // Eğer veri yoksa
  if (!personasData || !personasData.personas || personasData.personas.length === 0) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" component="h2" gutterBottom>
            Kullanıcı Personaları
          </Typography>
          <Typography variant="body1" align="center" py={4}>
            Persona analizi verisi henüz yok
          </Typography>
        </CardContent>
      </Card>
    );
  }

  // Örnek persona verileri (gerçek verilerle değiştirilecek)
  const personas = personasData.personas || [
    {
      name: "Kripto Tutkunu Kerim",
      age: "25-34",
      experience: "İleri Seviye",
      sentiment: "positive",
      needs: [
        "Hızlı ve güvenilir kripto işlemleri",
        "Detaylı analiz araçları",
        "Profesyonel arayüz"
      ],
      frustrations: [
        "İşlem limitlerinin düşük olması",
        "Bazı gelişmiş özelliklerin eksikliği"
      ],
      behaviors: "Günlük olarak kripto piyasalarını takip eder, aktif trader",
      quote: "Kripto yatırımlarımı profesyonel şekilde yönetmek istiyorum."
    },
    {
      name: "Yeni Başlayan Nalan",
      age: "35-44",
      experience: "Başlangıç Seviyesi",
      sentiment: "neutral",
      needs: [
        "Kolay kullanılabilir arayüz",
        "Eğitici içerikler",
        "Basit işlem akışı"
      ],
      frustrations: [
        "Karmaşık terminoloji",
        "Yetersiz yönlendirme"
      ],
      behaviors: "Düzenli olarak küçük miktarlarda yatırım yapar, riskten kaçınır",
      quote: "Kripto dünyasına güvenli bir şekilde adım atmak istiyorum."
    },
    {
      name: "İhtiyatlı İbrahim",
      age: "45-54",
      experience: "Orta Seviye",
      sentiment: "negative",
      needs: [
        "Üst düzey güvenlik",
        "Basit ve anlaşılır arayüz",
        "Hızlı müşteri desteği"
      ],
      frustrations: [
        "Güvenlik endişeleri",
        "Yavaş müşteri desteği yanıtları"
      ],
      behaviors: "Nadiren işlem yapar, uzun vadeli yatırım odaklı",
      quote: "Paramın güvende olduğundan emin olmak istiyorum."
    }
  ];

  // Duygu durumuna göre ikon seçimi
  const getSentimentIcon = (sentiment) => {
    switch(sentiment) {
      case 'positive':
        return <SentimentSatisfiedAltIcon sx={{ color: 'success.main' }} />;
      case 'neutral':
        return <SentimentNeutralIcon sx={{ color: 'warning.main' }} />;
      case 'negative':
        return <SentimentVeryDissatisfiedIcon sx={{ color: 'error.main' }} />;
      default:
        return <SentimentNeutralIcon />;
    }
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" component="h2" gutterBottom>
          Kullanıcı Personaları
        </Typography>
        
        <Typography variant="body2" color="textSecondary" paragraph>
          Uygulama kullanıcıları, yorumlara dayalı olarak aşağıdaki kullanıcı personalarına ayrılmıştır.
          Bu personalar, kullanıcı deneyimini iyileştirmek için hedef kitlenin daha iyi anlaşılmasını sağlar.
        </Typography>
        
        <Grid container spacing={3} mt={1}>
          {personas.map((persona, index) => (
            <Grid item xs={12} md={6} lg={4} key={index}>
              <Paper 
                elevation={2} 
                sx={{ 
                  p: 2, 
                  height: '100%',
                  borderTop: '4px solid', 
                  borderColor: persona.sentiment === 'positive' 
                    ? 'success.main' 
                    : persona.sentiment === 'neutral' 
                      ? 'warning.main' 
                      : 'error.main'
                }}
              >
                <Box display="flex" alignItems="center" mb={2}>
                  <Avatar 
                    sx={{ 
                      bgcolor: persona.sentiment === 'positive' 
                        ? 'success.light' 
                        : persona.sentiment === 'neutral' 
                          ? 'warning.light' 
                          : 'error.light',
                      width: 56,
                      height: 56,
                      mr: 2
                    }}
                  >
                    <AccountCircleIcon fontSize="large" />
                  </Avatar>
                  <Box>
                    <Typography variant="h6" gutterBottom sx={{ mb: 0 }}>
                      {persona.name}
                    </Typography>
                    <Box display="flex" alignItems="center">
                      <Chip 
                        label={persona.age} 
                        size="small" 
                        sx={{ mr: 1 }} 
                      />
                      <Chip 
                        label={persona.experience} 
                        size="small"
                        color={
                          persona.experience === 'İleri Seviye' 
                            ? 'primary' 
                            : persona.experience === 'Orta Seviye' 
                              ? 'secondary' 
                              : 'default'
                        }
                      />
                      {getSentimentIcon(persona.sentiment)}
                    </Box>
                  </Box>
                </Box>
                
                <Box sx={{ fontStyle: 'italic', mb: 2, color: 'text.secondary' }}>
                  "{persona.quote}"
                </Box>
                
                <Typography variant="subtitle2" gutterBottom>
                  İhtiyaçlar:
                </Typography>
                <Box component="ul" sx={{ pl: 2, mt: 0 }}>
                  {persona.needs.map((need, i) => (
                    <Typography component="li" variant="body2" key={i} paragraph sx={{ mb: 0.5 }}>
                      {need}
                    </Typography>
                  ))}
                </Box>
                
                <Typography variant="subtitle2" gutterBottom sx={{ mt: 1 }}>
                  Zorluklar:
                </Typography>
                <Box component="ul" sx={{ pl: 2, mt: 0 }}>
                  {persona.frustrations.map((frustration, i) => (
                    <Typography component="li" variant="body2" key={i} paragraph sx={{ mb: 0.5 }}>
                      {frustration}
                    </Typography>
                  ))}
                </Box>
                
                <Typography variant="subtitle2" gutterBottom sx={{ mt: 1 }}>
                  Davranış:
                </Typography>
                <Typography variant="body2">
                  {persona.behaviors}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
        
        {personasData.summary && (
          <>
            <Divider sx={{ my: 3 }} />
            
            <Typography variant="subtitle1" gutterBottom>
              Persona Özeti ve Öneriler
            </Typography>
            
            <Box mt={2} sx={{ 
              '& p': { mb: 1 },
              '& h1, & h2, & h3, & h4, & h5, & h6': { mt: 2, mb: 1 },
              '& ul, & ol': { pl: 3 }
            }}>
              <ReactMarkdown>
                {personasData.summary}
              </ReactMarkdown>
            </Box>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default PersonasCard;