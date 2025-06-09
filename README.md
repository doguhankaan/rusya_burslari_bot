# 🇷🇺 Rusya Bursları Bilgilendirme Telegram Botu

Bu proje, öğrencilere Rusya devlet bursları hakkında bilgi vermek ve başvuru sürecini daha sistemli hale getirmek amacıyla geliştirilmiş bir Telegram botudur. Bot; kullanıcıya rehberlik eden yanıtlar sunar, veri tabanı desteğiyle bilgi akışını düzenler ve ChatGPT API entegrasyonuyla akıllı yanıtlar üretir.

## 🔧 Kurulum Adımları

### 1. Gereksinimler

- [Node.js](https://nodejs.org/) (v18+ önerilir)
- Node JS yola eklenmelidir.
- MySQL sunucusu (yerel kullanım için [XAMPP](https://www.apachefriends.org/index.html) önerilir)
- Git (isteğe bağlı)

### 2. Projeyi Klonla

```bash
git clone https://github.com/doguhankaan/rusya_burslari_bot.git
cd rusya_burslari_bot
```

### 3. Node.js Bağımlılıklarını Kur
Proje Dizini/rusya_burslari_bot içerisinde aşağıdaki komut çalıştırılarak gerekli paketler yüklenir.
```bash
npm install
```

Aynı komut proje klasörü içindeki "ChatGPT API" dizini içinde de çalıştırılmalıdır. Bu sayede REST API sorunsuz çalışacaktır.

### 4. MySQL Veritabanını Kur

- XAMPP veya benzeri bir yazılımla MySQL sunucusunu başlat.
- `phpMyAdmin` arayüzü veya bash kullanarak yeni bir veritabanı oluştur.
- Ardından, `ProjeKlasörü/SQL` dizininde bulunan örnek SQL dosyasını içeri aktar.
- Veritabanı kullanıcı adı 'root'  ve şifresiz olarak kullanılabilir test amacıyla.

### 5. ChatGPT REST API'sini Başlat

Botun GPT desteğini kullanabilmesi için yerel bir API servisi çalıştırmalısın:

```bash
cd "ChatGPT API"
node main.js
```

> `main.js`, REST API sunucusunu başlatır. API anahtarının ve gerekli yapılandırmanın dosya içinde tanımlı olduğundan emin olun.

## 🔐 Ortam Değişkenleri ve Token Ayarları

Projenin güvenli ve esnek bir şekilde çalışabilmesi için API anahtarları, veritabanı bilgileri gibi hassas verileri doğrudan kod içine yazmak yerine `.env` dosyasında tutuyoruz.

### 1. `.env` Dosyası Oluştur

"ChatGPT API" dizininde bir `.env` dosyası oluştur ve aşağıdaki örneğe benzer şekilde doldur:

```
# ChatGPT API Ayarları
OPENAI_API_KEY=sk-abc123def456ghi789
```

## 📦 Yapı

```
Project Path/
├── ChatgptApi/
│   └── main.js
    └── .
    └── .
    └── .
├── SQL/
│   └── rusya_burslari_bot.sql
├── rusya_burslari_bot/
    └── bot.js
    └── package.json
    └── .
    └── .
    └── .
└── README.md
```
