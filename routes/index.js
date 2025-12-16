var express = require('express');
var router = express.Router();
const weatherService = require('../services/weatherService');

/* GET home page */
router.get('/', function (req, res, next) {
  res.render('index', {
    title: res.__('home.title'),
    description: res.__('home.description'),
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
    // Translate error code to message
    const errorMessage = res.__(`weather.errors.${weather.errorCode}`, { city: city });

    return res.render('index', {
      title: res.__('home.title'),
      description: res.__('home.description'),
      city: city,
      weather: null,
      error: errorMessage
    });
  }

  const cityName = weather.current.city;
  const countryName = weather.current.country;
  const temp = weather.current.temperature;
  const desc = weather.current.description;

  // Dynamic titles based on language
  const title = res.__('result.title', { city: cityName, country: countryName });
  const description = res.__('result.description', {
    city: cityName,
    temp: temp,
    condition: desc
  });

  res.render('result', {
    title: title,
    description: description,
    city: cityName,
    weather: weather,
    getWindDirection: weatherService.getWindDirection
  });
});

/* GET about page */
router.get('/about', function (req, res, next) {
  res.render('about', {
    title: res.__('about.title'),
    description: res.__('about.description'),
    weather: null
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
