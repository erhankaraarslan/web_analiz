// Mock veriler - API'ler çalışmadığında kullanılacak

const mockAndroidAppInfo = {
  title: 'Garanti BBVA Kripto',
  description: 'Garanti BBVA Kripto uygulaması ile kripto para işlemlerinizi hızlı ve güvenli bir şekilde gerçekleştirebilirsiniz.',
  developer: 'Garanti BBVA Digital Assets',
  developerId: 'Garanti BBVA',
  version: '1.3.2',
  score: 4.2,
  ratings: 7890,
  reviews: 342,
  updated: new Date('2023-12-15'),
  installs: '500.000+',
  icon: 'https://play-lh.googleusercontent.com/A_SK7paz1j_W8xmZQ-i7ujZ6fxKSLr2fCZAGQwWXBZbGNZQIq5UZZgdvt1Fb7NRHvQ=s180-rw'
};

const mockIosAppInfo = {
  title: 'Garanti BBVA Kripto',
  description: 'Garanti BBVA Kripto uygulaması ile kripto para işlemlerinizi hızlı ve güvenli bir şekilde gerçekleştirebilirsiniz.',
  developer: 'Garanti BBVA Digital Assets',
  developerId: 'Garanti BBVA',
  version: '1.3.5',
  score: 4.1,
  ratings: 5432,
  reviews: 280,
  updated: new Date('2023-12-20'),
  price: 0,
  free: true,
  currency: 'TRY',
  genres: ['Finans', 'Kripto'],
  icon: 'https://is5-ssl.mzstatic.com/image/thumb/Purple116/v4/e0/c5/7b/e0c57b3f-3a8e-8c00-113c-8d7ae1d8dd01/AppIcon-0-0-1x_U007emarketing-0-0-0-7-0-0-sRGB-0-0-0-GLES2_U002c0-512MB-85-220-0-0.png/230x0w.webp'
};

const mockAndroidReviews = [
  {
    id: 'gp-1',
    userName: 'Ahmet Y.',
    userImage: 'https://example.com/user1.jpg',
    date: new Date('2023-12-15'),
    score: 5,
    text: 'Çok güzel ve kullanışlı bir uygulama. Kripto işlemlerimi hızlı ve güvenli şekilde yapabiliyorum. Arayüz çok kullanıcı dostu.',
    replyDate: new Date('2023-12-16'),
    replyText: 'Olumlu geri bildiriminiz için teşekkür ederiz! Garanti BBVA olarak hizmet kalitemizi daha da artırmak için çalışıyoruz.'
  },
  {
    id: 'gp-2',
    userName: 'Mehmet K.',
    userImage: 'https://example.com/user2.jpg',
    date: new Date('2023-12-10'),
    score: 4,
    text: 'Genel olarak memnunum fakat bazen bağlantı sorunları yaşıyorum. Kripto fiyatları güncel ama grafik geçişleri bazen yavaş. Daha fazla kripto çeşidi eklenebilir.',
    replyDate: null,
    replyText: null
  },
  {
    id: 'gp-3',
    userName: 'Ayşe T.',
    userImage: 'https://example.com/user3.jpg',
    date: new Date('2023-12-05'),
    score: 3,
    text: 'Son güncellemeden sonra kripto alım-satım işlemleri yavaşladı. Ayrıca bazı coin’lerin grafikleri doğru görüntülenmiyor. Daha önce daha hızlıydı.',
    replyDate: new Date('2023-12-07'),
    replyText: 'Geri bildiriminiz için teşekkür ederiz. Teknik ekibimiz performans iyileştirmeleri üzerinde çalışıyor.'
  },
  {
    id: 'gp-4',
    userName: 'Zeynep D.',
    userImage: 'https://example.com/user4.jpg',
    date: new Date('2023-12-01'),
    score: 2,
    text: 'Kripto işlemlerinde sürekli hata veriyor ve bazen işlem yarıda kesiliyor. Para transferi yaparken uygulama kapandı, paranın akibetini öğrenmek için müşteri hizmetlerini aramak zorunda kaldım.',
    replyDate: new Date('2023-12-02'),
    replyText: 'Yaşadığınız sorun için özür dileriz. Sorununuzun çözümü için lütfen müşteri hizmetlerimizle iletişime geçin.'
  },
  {
    id: 'gp-5',
    userName: 'Ali R.',
    userImage: 'https://example.com/user5.jpg',
    date: new Date('2023-11-25'),
    score: 1,
    text: 'Kripto uygulamaya giriş yapamıyorum. Şifre doğru olduğu halde hatalı diyor. Ayrıca iki aydır limit yükseltme talebime cevap gelmedi. Başka platformlara geçmek zorunda kalacağım.',
    replyDate: new Date('2023-11-26'),
    replyText: 'Yaşadığınız sorun için özür dileriz. Şifre işlemleri için 444 0 333 numaralı çağrı merkezimizi arayabilirsiniz.'
  },
  {
    id: 'gp-6',
    userName: 'Emre B.',
    userImage: 'https://example.com/user6.jpg',
    date: new Date('2023-12-05'),
    score: 5,
    text: 'Mükemmel bir kripto uygulaması. Garanti BBVA güvencesiyle kripto alım satım yapabiliyorum. Diğer bütün kripto borsalarından daha güvenli.',
    replyDate: new Date('2023-12-06'),
    replyText: 'Olumlu geri bildiriminiz için teşekkür ederiz! Güven ve kullanıcı memnuniyeti bizim için çok önemli.'
  },
  {
    id: 'gp-7',
    userName: 'Sevgi K.',
    userImage: 'https://example.com/user7.jpg',
    date: new Date('2023-11-20'),
    score: 4,
    text: 'Kripto para yatırımına yeni başladım. Uygulama başlangıç seviyesi için ideal. Ancak daha fazla eğitim içeriği olsa daha iyi olurdu.',
    replyDate: new Date('2023-11-22'),
    replyText: 'Değerli önerileriniz için teşekkür ederiz. Eğitim içeriklerimizi geliştirmek için çalışıyoruz.'
  },
  {
    id: 'gp-8',
    userName: 'Kemal T.',
    userImage: 'https://example.com/user8.jpg',
    date: new Date('2023-11-15'),
    score: 3,
    text: 'Komisyon oranları biraz yüksek. Diğer platformlara göre dezavantajlı kalıyor bu konuda. Güvenlik yönünden ise tatminkâr.',
    replyDate: null,
    replyText: null
  },
  {
    id: 'gp-9',
    userName: 'Nur H.',
    userImage: 'https://example.com/user9.jpg',
    date: new Date('2023-11-10'),
    score: 5,
    text: 'Kripto portföy takibi çok kolay. Mobil bankacılık ile entegrasyon mükemmel. Anında para transferi yapabiliyorum.',
    replyDate: null,
    replyText: null
  },
  {
    id: 'gp-10',
    userName: 'Okan M.',
    userImage: 'https://example.com/user10.jpg',
    date: new Date('2023-11-05'),
    score: 2,
    text: 'Bazı kripto paralar listelenmemiş. Talepte bulundum ama hala eklenmedi. Arayüz güzel ama çeşitlilik artmalı.',
    replyDate: new Date('2023-11-07'),
    replyText: 'Görüşünüz için teşekkür ederiz. Kripto para listemizi genişletmek için çalışmalarımız devam ediyor.'
  }
];

const mockIosReviews = [
  {
    id: 'ios-1',
    userName: 'KriptoVadisi',
    userImage: null,
    date: new Date('2023-12-18'),
    score: 5,
    title: 'Mükemmel Uygulama',
    text: 'Tüm kripto işlemlerimi kolayca yapabiliyorum. Arayüzü çok kullanıcı dostu ve güvenlik önlemleri üst düzeyde. Banka ile entegrasyonu süper.',
    replyDate: null,
    replyText: null
  },
  {
    id: 'ios-2',
    userName: 'CoinTrader2023',
    userImage: null,
    date: new Date('2023-12-14'),
    score: 4,
    title: 'Güzel ama geliştirilebilir',
    text: 'Kripto paranın banka güvencesinde olması harika. Genel olarak memnunum ama canlı grafiklerin güncellenmesi biraz yavaş ve kripto çeşitliliği artırılabilir.',
    replyDate: new Date('2023-12-15'),
    replyText: 'Değerli görüşleriniz için teşekkür ederiz. Arayüzümüzü ve kripto çeşitliliğimizi sürekli olarak geliştiriyoruz.'
  },
  {
    id: 'ios-3',
    userName: 'BitcoinHunter',
    userImage: null,
    date: new Date('2023-12-08'),
    score: 3,
    title: 'Ortalama',
    text: 'Uygulama ortalama performans sunuyor. Face ID ile giriş bazen çalışmıyor, Touch ID eklenmeli. Kripto alım satım işlemleri sırasında zaman zaman donmalar oluyor.',
    replyDate: null,
    replyText: null
  },
  {
    id: 'ios-4',
    userName: 'CryptoExpert',
    userImage: null,
    date: new Date('2023-12-03'),
    score: 2,
    title: 'Son Güncelleme Sorunlu',
    text: 'Son güncellemeden sonra kripto portföyümü göremiyorum ve uygulama sürekli çöküyor. iPhone 15 Pro kullanıyorum. Çok kritik bir zamanda bu sorun yaşadığım için işlem yapamadım.',
    replyDate: new Date('2023-12-04'),
    replyText: 'Yaşadığınız sorunu teknik ekibimize ilettik. En kısa sürede düzeltilecektir.'
  },
  {
    id: 'ios-5',
    userName: 'KriptoKral',
    userImage: null,
    date: new Date('2023-11-28'),
    score: 1,
    title: 'Berbat Performans',
    text: 'Kripto uygulamaya giriş yapmak imkansız. Defalarca denedim fakat başarısız. Ayrıca komisyonlar çok yüksek ve işlem onay süresi çok uzun. Para kaybettiren bir uygulama oldu benim için.',
    replyDate: new Date('2023-11-29'),
    replyText: 'Yaşadığınız sorun için özür dileriz. Lütfen müşteri hizmetlerimizi arayarak sorununuzu çözmenize yardımcı olalım.'
  },
  {
    id: 'ios-6',
    userName: 'BlockchainFan',
    userImage: null,
    date: new Date('2023-12-12'),
    score: 5,
    title: 'Harika Deneyim',
    text: 'Uzun süredir kripto yatırımı yapıyorum ve bu uygulama ile deneyimim mükemmel. Banka güvencesi ile kripto işlemi yapmak büyük avantaj. Garanti BBVA\'ya teşekkürler.',
    replyDate: new Date('2023-12-13'),
    replyText: 'Güzel sözleriniz için teşekkür ederiz. Kullanıcılarımızın memnuniyeti bizim için en önemli öncelik.'
  },
  {
    id: 'ios-7',
    userName: 'TLInvestor',
    userImage: null,
    date: new Date('2023-11-19'),
    score: 4,
    title: 'Pratik ve Güvenli',
    text: 'TL-Kripto dönüşümlerini çok hızlı yapabiliyorum. Bankamın sunduğu bu hizmet için teşekkürler. Sadece bazı altcoin\'ler eklense daha iyi olacak.',
    replyDate: null,
    replyText: null
  },
  {
    id: 'ios-8',
    userName: 'EthereumTrader',
    userImage: null,
    date: new Date('2023-11-14'),
    score: 3,
    title: 'Geliştirilmeli',
    text: 'Ethereum işlemleri sırasında gaz ücretleri konusunda daha fazla bilgi verilmeli. Bazen beklenmedik komisyonlarla karşılaşıyorum. Kullanıcı dostu ama teknik bilgi eksik.',
    replyDate: new Date('2023-11-15'),
    replyText: 'Önerileriniz için teşekkür ederiz. Kripto işlem ücretleri konusunda daha fazla şeffaflık sağlamak için çalışıyoruz.'
  },
  {
    id: 'ios-9',
    userName: 'BTCMiner',
    userImage: null,
    date: new Date('2023-11-09'),
    score: 5,
    title: 'Güvenlik Üst Düzeyde',
    text: 'Diğer kripto borsalarında yaşanan güvenlik sorunlarından sonra paramın büyük kısmını buraya taşıdım. Garantinin güvencesi paha biçilemez.',
    replyDate: null,
    replyText: null
  },
  {
    id: 'ios-10',
    userName: 'AltcoinHunter',
    userImage: null,
    date: new Date('2023-11-04'),
    score: 2,
    title: 'Sınırlı Kripto Çeşitliliği',
    text: 'Sadece ana kripto paralar listeleniyor. Daha küçük ama potansiyeli yüksek coinler de eklenmeli. Limitler de çok düşük, yatırımcıyı kısıtlıyor.',
    replyDate: new Date('2023-11-05'),
    replyText: 'Geribildiriminiz için teşekkür ederiz. Kripto çeşitliliğimizi artırmak için çalışmalarımız devam ediyor.'
  }
];

module.exports = {
  mockAndroidAppInfo,
  mockIosAppInfo,
  mockAndroidReviews,
  mockIosReviews
};