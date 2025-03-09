# Web Analiz - Mobil Uygulama Yorum Analizi

Bu proje, Garanti BBVA Kripto mobil uygulamasının Google Play Store ve App Store'daki kullanıcı yorumlarını analiz etmek için geliştirilmiş bir araçtır. Platform, kullanıcı yorumlarını çekmekte, duygu analizi yapmakta ve kullanıcı deneyimini iyileştirmek için önerilerde bulunmaktadır.

![Uygulama Görseli](./screenshot.png)

## Özellikler

- **Çift Platform Desteği**: Android ve iOS uygulama yorumlarını analiz eder
- **Duygu Analizi**: Kullanıcı yorumlarının duygu analizi
- **Kullanıcı Personaları**: Yorumlardan kullanıcı personaları oluşturur
- **İyileştirme Önerileri**: Kullanıcı deneyimini geliştirmek için somut öneriler sunar
- **Karşılaştırmalı Analiz**: Android ve iOS platformlarını karşılaştırır
- **Filtreleme ve Arama**: Yorumlar içinde filtreleme ve arama yapabilme

## Teknolojiler

### Backend
- Node.js
- Express.js
- Google Play Scraper
- App Store Scraper
- OpenAI API (Duygu analizi ve öneri oluşturma için)

### Frontend
- React.js
- Material UI
- Chart.js
- React Router
- Axios

## Kurulum

### Ön Gereksinimler
- Node.js (v14 veya üzeri)
- npm veya yarn
- OpenAI API anahtarı

### Backend Kurulumu

```bash
# Repo'yu klonla
git clone https://github.com/kullaniciadi/web_analiz.git
cd web_analiz

# Backend klasörüne git
cd backend

# Bağımlılıkları kur
npm install

# .env dosyasını oluştur
cp .env.example .env

# .env dosyasını düzenle ve gerekli API anahtarlarını ekle
# OPENAI_API_KEY=your-api-key-here

# Backend'i başlat
npm start
```

### Frontend Kurulumu

```bash
# Projenin ana dizininde iken frontend klasörüne git
cd frontend

# Bağımlılıkları kur
npm install

# .env dosyasını oluştur
cp .env.example .env

# .env dosyasını düzenle
# REACT_APP_API_URL=http://localhost:8080/api

# Frontend'i başlat
npm start
```

## Kullanım

1. Backend'i başlat: `cd backend && npm start`
2. Frontend'i başlat: `cd frontend && npm start`
3. Tarayıcınızdan `http://localhost:3000` adresine gidin
4. Ayarlar kısmından API anahtarlarınızı ve uygulama ID'lerini ayarlayın
5. Dashboard üzerinden analizleri görüntüleyin

## Katkı Sağlama

1. Bu repository'yi fork edin
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Değişikliklerinizi commit edin (`git commit -m 'feat: Add some amazing feature'`)
4. Branch'inizi push edin (`git push origin feature/amazing-feature`)
5. Pull Request açın

## Lisans

Bu proje MIT lisansı altında lisanslanmıştır. Detaylar için [LICENSE](LICENSE) dosyasına bakınız.

## İletişim

Proje sorumlusu: [İsim Soyisim](mailto:email@example.com)

Proje linki: [https://github.com/kullaniciadi/web_analiz](https://github.com/kullaniciadi/web_analiz)
