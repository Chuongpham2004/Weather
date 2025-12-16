# 🌤️ Weather App

Ứng dụng tra cứu thời tiết đạt chuẩn Production với giao diện AccuWeather-inspired, tối ưu SEO theo Google Search Quality Evaluator Guidelines 2025.

![Node.js](https://img.shields.io/badge/Node.js-18+-green?logo=node.js)
![Express](https://img.shields.io/badge/Express-4.x-blue?logo=express)
![EJS](https://img.shields.io/badge/EJS-Template-yellow)
![License](https://img.shields.io/badge/License-MIT-purple)

---

## 📸 Screenshots

### Homepage
![Homepage](docs/screenshots/homepage.png)

### Weather Results
![Weather Results](docs/screenshots/results.png)

---

## ✨ Features

- 🔍 **Tra cứu thời tiết** - Tìm kiếm theo tên thành phố
- 🌡️ **Thời tiết hiện tại** - Nhiệt độ, độ ẩm, gió, áp suất, tầm nhìn
- ⏰ **Dự báo theo giờ** - 48 giờ tới với khoảng cách 3 giờ
- 📅 **Dự báo 5 ngày** - Nhiệt độ cao/thấp, mô tả, khả năng mưa
- 💾 **Server-side Caching** - Giảm API calls, tăng tốc độ (TTL: 15 phút)
- 📱 **Responsive Design** - Mobile-first, tương thích mọi thiết bị
- 🔒 **SEO Optimized** - Meta tags động, JSON-LD Schema Markup
- ⚡ **Core Web Vitals** - Tối ưu LCP, CLS

---

## 🛠️ Tech Stack

| Category | Technology |
|----------|------------|
| **Runtime** | Node.js 18+ |
| **Framework** | Express.js 4.x |
| **Template Engine** | EJS |
| **Styling** | CSS thuần (Mobile-first) |
| **HTTP Client** | Axios |
| **Caching** | node-cache |
| **Environment** | dotenv |
| **Data Source** | OpenWeatherMap API |

---

## 📁 Project Structure

```
Weather/
├── 📄 .env                          # Environment variables
├── 📄 .env.example                  # Example environment file
├── 📄 package.json                  # Dependencies & scripts
├── 📄 app.js                        # Express app configuration
├── 📁 bin/
│   └── 📄 www                       # Server entry point
├── 📁 routes/
│   └── 📄 index.js                  # Main routes
├── 📁 services/
│   └── 📄 weatherService.js         # API + caching logic
├── 📁 views/
│   ├── 📁 partials/
│   │   ├── 📄 header.ejs            # Header + Meta tags
│   │   └── 📄 footer.ejs            # Footer + JSON-LD Schema
│   ├── 📄 index.ejs                 # Homepage
│   ├── 📄 result.ejs                # Weather results
│   ├── 📄 about.ejs                 # About page (E-E-A-T)
│   └── 📄 error.ejs                 # Error page
└── 📁 public/
    └── 📁 stylesheets/
        └── 📄 style.css             # Main stylesheet
```

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18.x or higher
- **npm** 9.x or higher
- **OpenWeatherMap API Key** (Free tier available)

### 1. Clone Repository

```bash
git clone https://github.com/yourusername/weather-app.git
cd weather-app
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment

Tạo file `.env` từ example:

```bash
cp .env.example .env
```

Mở file `.env` và thêm API key của bạn:

```env
OPENWEATHERMAP_API_KEY=your_api_key_here
CACHE_TTL_SECONDS=900
PORT=3000
```

> 💡 **Lấy API Key**: Đăng ký miễn phí tại [OpenWeatherMap](https://openweathermap.org/api)

### 4. Start Server

```bash
# Development
npm start

# hoặc với nodemon (auto-reload)
npm run dev
```

### 5. Open Browser

Truy cập: **http://localhost:3000**

---

## 📖 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Trang chủ với search form |
| GET | `/weather?city={name}` | Kết quả thời tiết |
| GET | `/about` | Trang giới thiệu |
| GET | `/api/cache-stats` | Cache statistics (dev only) |

### Example Usage

```bash
# Tìm thời tiết Hà Nội
curl http://localhost:3000/weather?city=Hanoi

# Xem cache stats
curl http://localhost:3000/api/cache-stats
```

---

## 🎨 SEO Features

### Dynamic Meta Tags

```html
<!-- Homepage -->
<title>Weather App | Dự báo thời tiết chính xác</title>
<meta name="description" content="Tra cứu thời tiết tại bất kỳ thành phố nào...">

<!-- Result Page -->
<title>Thời tiết Hanoi, VN | Dự báo theo giờ</title>
<meta name="description" content="Thời tiết Hanoi: 28°C, Nắng nhẹ...">
```

### JSON-LD Schema

```json
{
  "@context": "https://schema.org",
  "@type": "WebPage",
  "name": "Weather Lookup - Hanoi",
  "mainEntity": {
    "@type": "Place",
    "name": "Hanoi, VN",
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": 21.0285,
      "longitude": 105.8542
    }
  }
}
```

### Semantic HTML

- `<header>` - Navigation
- `<main>` - Main content
- `<section>` - Content sections
- `<article>` - Weather cards
- `<footer>` - Footer info

---

## ⚡ Performance Optimization

### Caching Strategy

```javascript
// Server-side caching với node-cache
const cache = new NodeCache({ 
  stdTTL: 900,      // 15 phút
  checkperiod: 120  // Check mỗi 2 phút
});
```

### Core Web Vitals

| Metric | Optimization |
|--------|--------------|
| **LCP** | Preconnect, optimized fonts, minimal CSS |
| **CLS** | Fixed dimensions cho icons, cards |
| **FID** | Minimal JavaScript |

### CSS Optimization

- Mobile-first approach
- System fonts fallback
- Minimal animations
- No render-blocking

---

## 🔧 Configuration

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `OPENWEATHERMAP_API_KEY` | - | API key từ OpenWeatherMap |
| `CACHE_TTL_SECONDS` | 900 | Cache lifetime (seconds) |
| `PORT` | 3000 | Server port |
| `NODE_ENV` | development | Environment mode |

### Customization

#### Thay đổi Cache TTL

```env
CACHE_TTL_SECONDS=1800  # 30 phút
```

#### Thay đổi Port

```env
PORT=8080
```

---

## 📝 E-E-A-T Compliance

Ứng dụng tuân thủ Google E-E-A-T Guidelines:

- **Experience**: Giao diện trực quan, dễ sử dụng
- **Expertise**: Dữ liệu từ OpenWeatherMap (nguồn uy tín)
- **Authoritativeness**: Trang About với thông tin developer
- **Trustworthiness**: Data attribution, privacy policy

---

## 🧪 Testing

### Manual Testing

```bash
# Test homepage
curl http://localhost:3000/

# Test weather search
curl "http://localhost:3000/weather?city=Tokyo"

# Test error handling
curl "http://localhost:3000/weather?city=InvalidCity123"

# Test about page
curl http://localhost:3000/about
```

### Validate SEO

1. **JSON-LD**: [Google Rich Results Test](https://search.google.com/test/rich-results)
2. **Performance**: [PageSpeed Insights](https://pagespeed.web.dev/)
3. **Mobile**: Chrome DevTools > Device Mode

---

## 🐛 Troubleshooting

### API Key không hoạt động

```
Error: 401 Unauthorized
```

**Giải pháp**: 
- Kiểm tra API key trong `.env`
- API key mới cần 10-30 phút để kích hoạt
- Kiểm tra tại [OpenWeatherMap Dashboard](https://home.openweathermap.org/api_keys)

### Không tìm thấy thành phố

```
Error: 404 City not found
```

**Giải pháp**:
- Sử dụng tên tiếng Anh (VD: "Ho Chi Minh" thay vì "Hồ Chí Minh")
- Thử thêm mã quốc gia (VD: "Hanoi,VN")

### Port đã được sử dụng

```
Error: EADDRINUSE
```

**Giải pháp**:
```bash
# Đổi port trong .env
PORT=3001
```

---

## 📄 License

MIT License - xem file [LICENSE](LICENSE) để biết thêm chi tiết.

---

## 🙏 Credits

- **Weather Data**: [OpenWeatherMap](https://openweathermap.org/)
- **Design Inspiration**: [AccuWeather](https://www.accuweather.com/)
- **Icons**: Emoji icons
- **Fonts**: [Inter](https://fonts.google.com/specimen/Inter) by Google Fonts

---

## 👨‍💻 Author

**Weather App Team**

- 📧 Email: contact@weatherapp.com
- 🌐 Website: https://weatherapp.com

---

<p align="center">
  Made with ❤️ and ☕
</p>
