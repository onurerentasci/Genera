# 📌 Development Steps – Genera

Bu dosya, **Genera** adlı yapay zekâ destekli sanat paylaşım platformunun geliştirme sürecini adım adım ve eş zamanlı olarak yönetmek için hazırlanmıştır. Frontend ve backend tarafı birlikte, modüler ve senkron biçimde inşa edilir.

---

## 🔧 1. Proje Ortamı Hazırlığı

### ✅ Backend
- `backend/` klasörü oluşturulur.
- `npm init -y` ile `package.json` oluşturulur.
- Express.js, Mongoose, JWT, CSURF gibi gerekli paketler yüklenir.
- TypeScript ve ts-node-dev kurulumu yapılır.
- `src/` klasörü altında temel klasör yapısı kurulup `app.ts`, `server.ts` oluşturulur.

### ✅ Frontend
- `frontend/` klasöründe Next.js projesi başlatılır.
- App Router yapısı (`/app` dizini) kullanılır.
- Tailwind CSS entegre edilir.
- `src/components`, `src/app`, `src/context`, `src/hooks` dizinleri kurulur.

---

## 🔐 2. Kimlik Doğrulama Sistemi

### Backend
- Kullanıcı modeli (`User.ts`) oluşturulur.
- `/api/auth/register` ve `/api/auth/login` endpoint’leri yazılır.
- Parola `bcrypt` ile hashlenir, JWT token üretimi yapılır.
- Auth middleware yazılır (`verifyToken`, `isAdmin`).

### Frontend
- `/login` ve `/register` sayfaları oluşturulur.
- Auth context yazılır (`AuthContext`).
- Giriş yapan kullanıcı context’e alınır ve localStorage ile saklanır.

---

## 🎨 3. Görsel Üretimi (Prompt Sistemi)

### Backend
- `/api/generate` endpoint’i oluşturulur (başlangıçta mock veri döner).
- `/api/art/submit` ile prompt + image kayıt edilir.
- MongoDB'de `Art` modeli tanımlanır.

### Frontend
- `PromptInput` bileşeni yapılır.
- Görsel üretme sonucu ekranda gösterilir.
- “Yalnızca bana sakla” ve “Timeline’a gönder” seçenekleri sunulur.

---

## 🧭 4. Timeline – Ana Sayfa

### Backend
- `/api/art/timeline` endpoint’i yazılır.
- Tüm paylaşılan (published) görseller geri döndürülür.

### Frontend
- `ArtCard` bileşeni oluşturulur.
- `/` sayfasında `ArtCard` listesi ile timeline gösterilir.
- Sonsuz scroll veya sayfalama yapılır.

---

## ❤️ 5. Beğeni ve Yorumlama Sistemi

### Backend
- `like`, `unlike`, `comment` endpoint’leri eklenir.
- `Comment` modeli oluşturulur.
- Sadece giriş yapmış kullanıcılar işlem yapabilir.

### Frontend
- `LikeButton`, `CommentBox` bileşenleri oluşturulur.
- Yorumlar listelenebilir ve eklenebilir hale getirilir.

---

## 👤 6. Kullanıcı Profili ve Galeri

### Backend
- `/api/user/:username` endpoint’i yazılır.
- Kullanıcının paylaştığı görseller MongoDB’den çekilir.

### Frontend
- `/user/[username]` sayfası oluşturulur.
- Kullanıcının galerisi grid formatında gösterilir.

---

## 🛠️ 7. Admin Paneli & Duyurular

### Backend
- Admin yetkisi kontrolü için middleware yazılır.
- `/api/admin/news` CRUD endpoint’leri yazılır.
- `News` modeli oluşturulur.

### Frontend
- `/admin` sayfası yapılır.
- Duyuru/haber ekleme ve silme işlemleri arayüzden yapılabilir.

---

## 📊 8. Sayaçlar & Güvenlik

### Backend
- `/api/stats/visit` → Ziyaretçi sayısı için endpoint yazılır.
- `socket.io` entegre edilerek online kullanıcı sayısı takip edilir.
- `csurf` ile CSRF token koruması entegre edilir.

### Frontend
- Ziyaretçi sayısı ve aktif kullanıcı sayısı footer veya navbar’da gösterilir.
- CSRF token’ı formlarda otomatik kullanacak şekilde yapılandırılır.

---

## 🔗 9. Slugify ve SEO Uyumlu Yapı

### Backend
- Prompt’a dayalı slug oluşturma fonksiyonu (`slugify`) uygulanır.
- Her görselin kendi URL’si `/art/:slug` olarak tanımlanır.

### Frontend
- `/art/[slug]` route’unda görsel detay sayfası açılır.
- Prompt ve paylaşım detayları burada gösterilir.

---

## 🧪 10. Test ve Yayına Hazırlık

- Tüm REST API’ler Postman ile test edilir.
- Kullanıcı senaryoları tarayıcıda kontrol edilir.
- Uygulama `build` edilerek dağıtıma hazır hale getirilir.

---

## ✅ Öneri: Geliştirme Sırası İçin Kısayol

```
1. Auth (Login/Register)
2. Prompt Üretimi
3. Prompt Paylaşımı
4. Timeline
5. Beğeni ve Yorum
6. Profil Sayfası
7. Admin Panel
8. Sayaçlar ve Socket
9. CSRF ve Slug
```

---

## 📂 Dizin Referansı

Geliştirme süreci boyunca `src/` klasör yapısı hem frontend hem backend tarafında modüler olarak tutulur. Yapıya README dosyasından ulaşabilirsiniz.

---

Bu doküman, proje boyunca takip edilmesi gereken adımları rehber niteliğinde sunar. Her aşama tamamlandıkça test edilmesi önerilir.
