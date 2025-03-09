import React from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  Box, 
  Divider,
  LinearProgress,
  Grid 
} from '@mui/material';
import ReactMarkdown from 'react-markdown';
import { Doughnut } from 'react-chartjs-2';
import { 
  Chart as ChartJS, 
  ArcElement, 
  Tooltip, 
  Legend 
} from 'chart.js';

// Chart.js bileşenlerini kaydet
ChartJS.register(ArcElement, Tooltip, Legend);

const SentimentAnalysisCard = ({ sentimentData, platform }) => {
  // Eğer veri yoksa
  if (!sentimentData) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" component="h2" gutterBottom>
            Duygu Analizi
          </Typography>
          <Typography variant="body1" align="center" py={4}>
            Analiz verisi henüz yok
          </Typography>
        </CardContent>
      </Card>
    );
  }

  // Duygu analizi grafiği için veri hazırlama (örnek veri, gerçek verilerle değiştirin)
  const sentimentChartData = {
    labels: ['Olumlu', 'Nötr', 'Olumsuz'],
    datasets: [
      {
        data: [
          sentimentData.positivePercentage || 65, 
          sentimentData.neutralPercentage || 20, 
          sentimentData.negativePercentage || 15
        ],
        backgroundColor: [
          'rgba(76, 175, 80, 0.8)',
          'rgba(255, 193, 7, 0.8)',
          'rgba(244, 67, 54, 0.8)'
        ],
        borderColor: [
          'rgba(76, 175, 80, 1)',
          'rgba(255, 193, 7, 1)',
          'rgba(244, 67, 54, 1)'
        ],
        borderWidth: 1,
      },
    ],
  };

  // Grafik seçenekleri
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const value = context.raw;
            const label = context.label;
            return `${label}: ${value}%`;
          }
        }
      }
    },
  };

  // Ana konular grafiği
  const mainTopics = sentimentData.mainTopics || [
    { topic: 'Kullanıcı Arayüzü', percentage: 45 },
    { topic: 'Performans', percentage: 30 },
    { topic: 'Güvenlik', percentage: 25 },
    { topic: 'Müşteri Desteği', percentage: 20 },
    { topic: 'Fiyatlandırma', percentage: 15 }
  ];

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" component="h2" gutterBottom>
          Duygu Analizi
        </Typography>
        
        <Grid container spacing={3}>
          {/* Pasta grafiği */}
          <Grid item xs={12} md={6}>
            <Box height={250} width="100%">
              <Doughnut data={sentimentChartData} options={chartOptions} />
            </Box>
          </Grid>
          
          {/* Ana konular */}
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" gutterBottom>
              En Çok Bahsedilen Konular
            </Typography>
            <Box mt={2}>
              {mainTopics.map((topic, index) => (
                <Box key={index} mb={2}>
                  <Box display="flex" justifyContent="space-between" mb={0.5}>
                    <Typography variant="body2">{topic.topic}</Typography>
                    <Typography variant="body2" fontWeight="bold">
                      {topic.percentage}%
                    </Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={topic.percentage} 
                    sx={{ 
                      height: 10, 
                      borderRadius: 5,
                      bgcolor: 'background.paper',
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: platform === 'android' 
                          ? 'success.main' 
                          : 'primary.main'
                      }
                    }}
                  />
                </Box>
              ))}
            </Box>
          </Grid>
        </Grid>
        
        <Divider sx={{ my: 3 }} />
        
        {/* Detaylı analiz bölümü */}
        <Typography variant="subtitle1" gutterBottom>
          Detaylı Analiz
        </Typography>
        
        <Box mt={2} sx={{ 
          '& p': { mb: 1 },
          '& h1, & h2, & h3, & h4, & h5, & h6': { mt: 2, mb: 1 },
          '& ul, & ol': { pl: 3 }
        }}>
          <ReactMarkdown>
            {sentimentData.detailedAnalysis || 
              `
## Genel Değerlendirme

Kullanıcı yorumlarının analizi, Garanti BBVA Kripto uygulamasının genel olarak kullanıcılar tarafından olumlu karşılandığını göstermektedir. Kullanıcıların %65'i olumlu, %20'si nötr ve %15'i olumsuz geri bildirimde bulunmuştur.

## Güçlü Yönler

- Kullanıcı dostu arayüz ve kolay navigasyon
- Hızlı işlem yapabilme
- Güvenlik önlemleri
- Zengin kripto para çeşitliliği

## İyileştirme Gerektiren Alanlar

- Yavaş müşteri desteği
- Ara sıra yaşanan performans sorunları
- Daha fazla eğitici içerik talebi
- Bildirim sisteminin iyileştirilmesi
              `
            }
          </ReactMarkdown>
        </Box>
      </CardContent>
    </Card>
  );
};

export default SentimentAnalysisCard;