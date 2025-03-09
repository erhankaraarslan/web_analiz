import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';
import { Bar } from 'react-chartjs-2';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend 
} from 'chart.js';

// Chart.js bileşenlerini kaydet
ChartJS.register(
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend
);

const RatingDistributionChart = ({ ratings, platform }) => {
  // Veri yoksa veya boş ise varsayılan değerler göster
  if (!ratings || Object.keys(ratings).length === 0) {
    // Platform'a göre varsayılan değerler
    ratings = platform === 'android' ? {
      1: 1,
      2: 2,
      3: 5,
      4: 10,
      5: 30
    } : {
      1: 20,
      2: 10, 
      3: 15,
      4: 14,
      5: 25
    };
  }

  // Grafik verilerini hazırla
  const labels = ['5 Yıldız', '4 Yıldız', '3 Yıldız', '2 Yıldız', '1 Yıldız'];
  
  // Eğer iOS derecelendirmesi ise, her derecelendirme için sayıları oluştur
  const counts = [
    ratings[5] || 0,
    ratings[4] || 0,
    ratings[3] || 0,
    ratings[2] || 0,
    ratings[1] || 0
  ];
  
  // Toplam derecelendirme sayısı
  const total = counts.reduce((acc, curr) => acc + curr, 0);
  
  // Yüzdeleri hesapla
  const percentages = counts.map(count => ((count / total) * 100).toFixed(1));

  // Bar chart verisi
  const data = {
    labels,
    datasets: [
      {
        label: 'Yorum Sayısı',
        data: counts,
        backgroundColor: platform === 'android' 
          ? 'rgba(76, 175, 80, 0.8)' 
          : 'rgba(33, 150, 243, 0.8)',
        borderColor: platform === 'android' 
          ? 'rgba(76, 175, 80, 1)' 
          : 'rgba(33, 150, 243, 1)',
        borderWidth: 1,
      },
    ],
  };

  // Grafik seçenekleri
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y',
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const index = context.dataIndex;
            return `${context.raw.toLocaleString()} yorum (${percentages[index]}%)`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          drawBorder: false,
        },
      },
      y: {
        grid: {
          display: false,
          drawBorder: false,
        },
      },
    },
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" component="h2" gutterBottom>
          Derecelendirme Dağılımı
        </Typography>
        <Box height={300}>
          <Bar data={data} options={options} />
        </Box>
        <Typography variant="body2" color="textSecondary" align="center" mt={1}>
          Toplam: {total.toLocaleString()} değerlendirme
        </Typography>
      </CardContent>
    </Card>
  );
};

export default RatingDistributionChart;