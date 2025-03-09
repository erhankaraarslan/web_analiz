import React from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  Box 
} from '@mui/material';
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

const ComparisonChart = ({ androidData, iosData, title, description }) => {
  // Veri yoksa boş göster
  if (!androidData || !iosData) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" component="h2" gutterBottom>
            {title || 'Platform Karşılaştırması'}
          </Typography>
          <Typography variant="body1" align="center" py={4}>
            Karşılaştırma için veri yok
          </Typography>
        </CardContent>
      </Card>
    );
  }

  // Grafik verilerini hazırla
  const data = {
    labels: ['5 Yıldız', '4 Yıldız', '3 Yıldız', '2 Yıldız', '1 Yıldız', 'Ortalama Puan'],
    datasets: [
      {
        label: 'Android',
        data: [
          androidData.fiveStarPercentage || 45,
          androidData.fourStarPercentage || 30,
          androidData.threeStarPercentage || 15,
          androidData.twoStarPercentage || 5,
          androidData.oneStarPercentage || 5,
          androidData.averageRating || 4.1
        ],
        backgroundColor: 'rgba(76, 175, 80, 0.7)',
        borderColor: 'rgba(76, 175, 80, 1)',
        borderWidth: 1,
      },
      {
        label: 'iOS',
        data: [
          iosData.fiveStarPercentage || 40,
          iosData.fourStarPercentage || 35,
          iosData.threeStarPercentage || 10,
          iosData.twoStarPercentage || 8,
          iosData.oneStarPercentage || 7,
          iosData.averageRating || 3.9
        ],
        backgroundColor: 'rgba(33, 150, 243, 0.7)',
        borderColor: 'rgba(33, 150, 243, 1)',
        borderWidth: 1,
      },
    ],
  };

  // Grafik seçenekleri
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const label = context.dataset.label || '';
            const value = context.raw;
            
            if (context.dataIndex === 5) { // Ortalama puan için
              return `${label}: ${value.toFixed(1)}`;
            } else {
              return `${label}: ${value}%`;
            }
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return value + '%';
          }
        }
      },
    },
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" component="h2" gutterBottom>
          {title || 'Android ve iOS Karşılaştırması'}
        </Typography>
        
        {description && (
          <Typography variant="body2" color="textSecondary" paragraph>
            {description}
          </Typography>
        )}
        
        <Box height={350}>
          <Bar data={data} options={options} />
        </Box>
      </CardContent>
    </Card>
  );
};

export default ComparisonChart;