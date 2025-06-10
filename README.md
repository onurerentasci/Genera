**Genera**, kullanıcıların yapay zekâ destekli generatif görseller oluşturabildiği ve bu görselleri sosyal medya ortamında paylaşabildiği bir web uygulamasıdır. Metin tabanlı promptlar kullanılarak görsel üretimi yapılmakta ve bu içerikler, zaman akışı (timeline) üzerinden diğer kullanıcılarla etkileşime açılmaktadır. Kullanıcılar birbirlerinin eserlerini beğenebilir, yorumlayabilir ve kendi profil sayfalarında kişisel galerilerini oluşturabilirler.

---

## 🚀 Özellikler

- 🎨 **Prompt ile Görsel Üretimi**  
  Kullanıcı, oluştur butonuna tıklayarak prompt girişi yapar ve buna göre görsel üretir.

- 🧭 **Zaman Akışı (Timeline)**  
  Paylaşılan tüm görsellerin listelendiği sosyal medya tarzı ana sayfa.

- ❤️ **Beğeni ve Yorumlama**  
  Kullanıcılar paylaşımlara beğeni bırakabilir ve yorum yapabilir.

- 👤 **Kullanıcı Profili ve Galeri**  
  Her kullanıcının kendine ait bir galerisi bulunur. Profil sayfasında gösterilir.

- 🛡️ **Kimlik Doğrulama**  
  JWT ile kayıt ve giriş işlemleri. Rol bazlı yetkilendirme desteği.

- 📰 **Duyuru / Haber Modülü**  
  Admin kullanıcılar tarafından oluşturulan duyurular / güncellemeler sayfası.

- 🗂️ **Slugify URL’ler**  
  Her görsel için otomatik olarak SEO uyumlu bağlantı adresi oluşturulur.

- 👀 **Ziyaretçi Sayacı**  
  Siteyi ziyaret eden kullanıcıların toplam sayısı izlenir.

- 🌐 **Online Kullanıcı Takibi**  
  WebSocket üzerinden sistemde aktif olan kullanıcılar listelenir.

- 🧷 **CSRF Koruması**  
  Güvenli veri gönderimi için CSRF token ile koruma sağlanır.

---

## 🛠️ Kullanılan Teknolojiler

### Frontend
- [Next.js](https://nextjs.org/)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)

### Backend
- [Node.js](https://nodejs.org/)
- [Express.js](https://expressjs.com/)
- [MongoDB + Mongoose](https://mongoosejs.com/)
- [Socket.IO](https://socket.io/)
- [JWT (jsonwebtoken)](https://github.com/auth0/node-jsonwebtoken)
- [CSURF](https://www.npmjs.com/package/csurf)
- [Slugify](https://www.npmjs.com/package/slugify)

---

## 🎓 Gereksinimler ile Uyum

| Gereklilik               | Karşılanma Durumu |
|--------------------------|-------------------|
| Node.js tabanlı backend  | ✅                |
| Ziyaretçi sayacı         | ✅                |
| Online kullanıcı sayısı  | ✅                |
| Duyuru / haber modülü    | ✅                |
| Resim galerisi           | ✅                |
| Admin paneli             | ✅                |
| Kullanıcı yetkilendirme  | ✅                |
| CSRF koruması            | ✅                |
| Slugify kullanımı        | ✅                |

---

## 📌 Proje Amacı

Yaratıcılığı teşvik eden, kullanıcıların yapay zekâ ile sanatsal üretimlerini hem kişisel hem de sosyal bir düzlemde paylaşabileceği, etkileşimli ve güvenli bir platform geliştirmek.
