# Katkı Sağlama Rehberi

Web Analiz projesine katkı sağlamak istediğiniz için teşekkür ederiz! Bu rehber, projeye katkı sağlamak için izlemeniz gereken adımları ve uymanız gereken kuralları içerir.

## Geliştirme Ortamı

Projeyi geliştirmek için aşağıdaki araçları kullanıyoruz:

- Node.js (v14.x veya üzeri)
- npm veya yarn
- Git

## Katkı Sağlama Süreci

1. Projeyi fork edin.
2. Feature branch oluşturun: `git checkout -b feature/xyz`
3. Değişikliklerinizi yapın ve commit edin: `git commit -m 'feat: Add new feature xyz'`
4. Branch'inizi push edin: `git push origin feature/xyz`
5. Pull Request açın.

## Commit Mesajları

Commit mesajlarınızı [Conventional Commits](https://www.conventionalcommits.org/) formatında yazmanızı öneririz:

- `feat`: Yeni bir özellik eklediğinizde
- `fix`: Bir hatayı düzelttiğinizde
- `docs`: Sadece dokümantasyonla ilgili değişiklikler yaptığınızda
- `style`: Kod davranışını etkilemeyen biçimsel değişiklikler (boşluk, format, noktalama vb.)
- `refactor`: Hata düzeltmesi veya özellik eklemeyen kod değişiklikleri
- `test`: Test ekleme veya düzeltme
- `chore`: Yapı süreciyle ilgili değişiklikler

Örnek: `feat: Add user authentication feature`

## Kod Stili

Projede aşağıdaki kod stillerine uyulmalıdır:

- ESLint kuralları takip edilmelidir
- İsimlendirmeler anlamlı ve tutarlı olmalıdır
- Bileşenler ve fonksiyonlar tek sorumluluk prensibine uygun olmalıdır
- Yorum satırları net ve anlaşılır olmalıdır

## Pull Request Süreci

1. PR başlıkları açıklayıcı olmalıdır
2. PR açıklaması yapılan değişiklikleri ve neden yapıldığını içermelidir
3. PR, CI/CD testlerinden geçmelidir
4. PR, en az bir onay aldıktan sonra merge edilebilir

## Lisans

Projeye katkı sağlayarak, katkılarınızın MIT lisansı altında lisanslanmasını kabul etmiş olursunuz.

## Sorular?

Eğer katkı sağlama süreciyle ilgili herhangi bir sorunuz varsa, lütfen bir issue açarak veya [email adresi] adresine e-posta göndererek bizimle iletişime geçin.

Katkılarınız için teşekkür ederiz!
