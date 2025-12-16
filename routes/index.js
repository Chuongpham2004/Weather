var express = require('express');
var router = express.Router();
const weatherService = require('../services/weatherService');

/* GET home page */
router.get('/', function (req, res, next) {
  res.render('index', {
    title: 'Weather App | Dự báo thời tiết chính xác',
    description: 'Tra cứu thời tiết tại bất kỳ thành phố nào trên thế giới. Dự báo thời tiết theo giờ và 5 ngày với dữ liệu từ OpenWeatherMap.',
    city: null,
    weather: null
  });
});

/* GET weather results */
router.get('/weather', async function (req, res, next) {
  const city = req.query.city;

  if (!city || city.trim() === '') {
    return res.redirect('/');
  }

  const weather = await weatherService.getWeatherData(city.trim());

  if (!weather.success) {
    return res.render('index', {
      title: 'Không tìm thấy | Weather App',
      description: 'Tra cứu thời tiết tại bất kỳ thành phố nào trên thế giới.',
      city: city,
      weather: null,
      error: weather.error
    });
  }

  const cityName = weather.current.city;
  const countryName = weather.current.country;
  const temp = weather.current.temperature;
  const desc = weather.current.description;

  res.render('result', {
    title: `Thời tiết ${cityName}, ${countryName} | Dự báo theo giờ`,
    description: `Thời tiết ${cityName}: ${temp}°C, ${desc}. Xem dự báo thời tiết theo giờ và 5 ngày tới.`,
    city: cityName,
    weather: weather,
    getWindDirection: weatherService.getWindDirection
  });
});

/* GET about page */
router.get('/about', function (req, res, next) {
  res.render('about', {
    title: 'Giới thiệu | Weather App',
    description: 'Weather App - Ứng dụng tra cứu thời tiết miễn phí với dữ liệu từ OpenWeatherMap API.'
  });
});

/* API endpoint for cache stats (development only) */
router.get('/api/cache-stats', function (req, res, next) {
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({ error: 'Not available in production' });
  }
  res.json(weatherService.getCacheStats());
});

module.exports = router;
