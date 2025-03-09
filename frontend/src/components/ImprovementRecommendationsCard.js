import React from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  Box, 
  Divider,
  Paper,
  Chip,
  Grid,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Rating
} from '@mui/material';
import PriorityHighIcon from '@mui/icons-material/PriorityHigh';
import BuildIcon from '@mui/icons-material/Build';
import VerifiedIcon from '@mui/icons-material/Verified';
import ReactMarkdown from 'react-markdown';

const ImprovementRecommendationsCard = ({ improvementsData, platform }) => {
  // Eğer veri yoksa
  if (!improvementsData) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" component="h2" gutterBottom>
            İyileştirme Önerileri
          </Typography>
          <Typography variant="body1" align="center" py={4}>
            İyileştirme önerileri verisi henüz yok
          </Typography>
        </CardContent>
      </Card>
    );
  }

  // Örnek iyileştirme önerileri (gerçek verilerle değiştirilecek)
  const improvements = improvementsData.recommendations || [
    {
      category: "Kullanıcı Arayüzü",
      priority: "Yüksek",
      score: 5,
      description: "Ana ekrandaki grafik görünümünü yeniden tasarlayın",
      impact: "Kullanıcı deneyimini iyileştirecek ve uygulamada daha fazla zaman geçirilmesini sağlayacak",
      userComments: [
        "Grafikler bazen karmaşık görünüyor",
        "Ekranda çok fazla bilgi var, daha sade olabilir"
      ]
    },
    {
      category: "Performans",
      priority: "Orta",
      score: 4,
      description: "Uygulama açılış süresini optimize edin",
      impact: "Kullanıcı memnuniyetini artıracak ve daha az terkedilme oranı sağlayacak",
      userComments: [
        "Uygulama bazen geç açılıyor",
        "Açılış sırasında takılmalar yaşıyorum"
      ]
    },
    {
      category: "Müşteri Desteği",
      priority: "Yüksek",
      score: 5,
      description: "Canlı destek özelliği ekleyin",
      impact: "Kullanıcıların sorunları daha hızlı çözülecek ve memnuniyet artacak",
      userComments: [
        "Bir sorun yaşadığımda hemen birine ulaşamıyorum",
        "E-posta desteği yavaş kalıyor"
      ]
    },
    {
      category: "Güvenlik",
      priority: "Düşük",
      score: 3,
      description: "İki faktörlü kimlik doğrulama seçeneklerini artırın",
      impact: "Kullanıcıların güvenlik algısını güçlendirecek",
      userComments: [
        "Daha fazla güvenlik seçeneği olabilir",
        "Güvenlik ayarları biraz daha gelişebilir"
      ]
    }
  ];

  // Önceliğe göre ikon ve renk
  const getPriorityIcon = (priority) => {
    switch(priority.toLowerCase()) {
      case 'yüksek':
        return <PriorityHighIcon color="error" />;
      case 'orta':
        return <BuildIcon color="warning" />;
      case 'düşük':
        return <VerifiedIcon color="success" />;
      default:
        return <BuildIcon />;
    }
  };

  // Önceliğe göre renk
  const getPriorityColor = (priority) => {
    switch(priority.toLowerCase()) {
      case 'yüksek':
        return 'error';
      case 'orta':
        return 'warning';
      case 'düşük':
        return 'success';
      default:
        return 'default';
    }
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" component="h2" gutterBottom>
          İyileştirme Önerileri
        </Typography>
        
        <Typography variant="body2" color="textSecondary" paragraph>
          Kullanıcı yorumlarına dayalı olarak oluşturulan iyileştirme önerileri aşağıda öncelik sırasına göre listelenmiştir.
        </Typography>
        
        <Grid container spacing={3} mt={1}>
          {improvements.map((improvement, index) => (
            <Grid item xs={12} md={6} key={index}>
              <Paper 
                elevation={2} 
                sx={{ 
                  p: 2,
                  borderLeft: '4px solid', 
                  borderColor: 
                    improvement.priority.toLowerCase() === 'yüksek' 
                      ? 'error.main' 
                      : improvement.priority.toLowerCase() === 'orta' 
                        ? 'warning.main' 
                        : 'success.main'
                }}
              >
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                  <Typography variant="subtitle1" fontWeight="bold">
                    {improvement.description}
                  </Typography>
                  <Chip 
                    label={improvement.priority} 
                    color={getPriorityColor(improvement.priority)}
                    icon={getPriorityIcon(improvement.priority)}
                    size="small"
                  />
                </Box>
                
                <Box display="flex" alignItems="center" mb={1}>
                  <Chip 
                    label={improvement.category} 
                    size="small" 
                    sx={{ mr: 1 }} 
                    variant="outlined"
                  />
                  
                  <Rating 
                    value={improvement.score} 
                    readOnly 
                    size="small"
                    sx={{ ml: 'auto' }}
                  />
                </Box>
                
                <Typography variant="body2" paragraph>
                  <strong>Etki:</strong> {improvement.impact}
                </Typography>
                
                <Typography variant="subtitle2" gutterBottom>
                  Kullanıcı Yorumları:
                </Typography>
                <List dense disablePadding sx={{ bgcolor: 'background.default', borderRadius: 1, p: 1 }}>
                  {improvement.userComments.map((comment, i) => (
                    <ListItem key={i} dense sx={{ py: 0.5 }}>
                      <ListItemIcon sx={{ minWidth: 30 }}>
                        <Typography variant="body2" color="primary">•</Typography>
                      </ListItemIcon>
                      <ListItemText
                        primary={<Typography variant="body2">{comment}</Typography>}
                      />
                    </ListItem>
                  ))}
                </List>
              </Paper>
            </Grid>
          ))}
        </Grid>
        
        {improvementsData.summary && (
          <>
            <Divider sx={{ my: 3 }} />
            
            <Typography variant="subtitle1" gutterBottom>
              İyileştirme Özeti ve Stratejik Öneriler
            </Typography>
            
            <Box mt={2} sx={{ 
              '& p': { mb: 1 },
              '& h1, & h2, & h3, & h4, & h5, & h6': { mt: 2, mb: 1 },
              '& ul, & ol': { pl: 3 }
            }}>
              <ReactMarkdown>
                {improvementsData.summary}
              </ReactMarkdown>
            </Box>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default ImprovementRecommendationsCard;