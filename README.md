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

Proje dizininde aşağıdaki komut çalıştırılarak gerekli paketler yüklenir.

```bash
npm install
```

Aynı komut proje klasörü içindeki "Chatgpt Api" dizini içinde de çalıştırılmalıdır. Bu sayede REST API sorunsuz çalışacaktır.

### 4. MySQL Veritabanını Kur

- XAMPP veya benzeri bir yazılımla MySQL sunucusunu başlat.
- `phpMyAdmin` arayüzü veya bash kullanarak yeni bir veritabanı oluştur.
- Ardından, `ProjeKlasörü/SQL` dizininde bulunan örnek SQL dosyasını içeri aktar.
- ⁠Veritabanı kullanıcı adı 'root' ve şifresiz olarak kullanılabilir test amacıyla.

### 5. ChatGPT REST API'sini Başlat

Botun GPT desteğini kullanabilmesi için yerel bir API servisi çalıştırmalısın:

```bash
cd ChatgptApi
node main.js
```

> `main.js`, REST API sunucusunu başlatır. API anahtarının ve gerekli yapılandırmanın dosya içinde tanımlı olduğundan emin olun.

## 🔐 Ortam Değişkenleri ve Token Ayarları

Projenin güvenli ve esnek bir şekilde çalışabilmesi için API anahtarları, veritabanı bilgileri gibi hassas verileri doğrudan kod içine yazmak yerine `.env` dosyasında tutuyoruz.

### 1. `.env` Dosyası Oluştur

Proje ana dizininde bir `.env` dosyası oluştur ve aşağıdaki örneğe benzer şekilde doldur:

```
# ChatGPT API Ayarları
OPENAI_API_KEY=sk-abc123def456ghi789
```

### 2. Ortam Değişkenlerini Koda Dahil Et

Kod içinde bu değişkenleri kullanmak için `dotenv` paketini kurduğundan emin ol.

```bash
npm install
```

komutu ile zaten kurulmuş olmalı.

## 📦 Yapı

```
telegram-rusya-burs-botu/
├── ChatgptApi/
│   └── main.js
├── SQL/
│   └── ornek-veritabani.sql
├── bot.js
├── package.json
└── README.md
```
