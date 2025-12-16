const axios = require('axios');
const NodeCache = require('node-cache');

// Initialize cache with TTL from environment or default 15 minutes
const cache = new NodeCache({
  stdTTL: parseInt(process.env.CACHE_TTL_SECONDS) || 900,
  checkperiod: 120
});

const API_KEY = process.env.OPENWEATHERMAP_API_KEY;
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

/**
 * Normalize city name for cache key
 * @param {string} city 
 * @returns {string}
 */
const normalizeCityName = (city) => {
  return city.toLowerCase().trim().replace(/\s+/g, ' ');
};

/**
 * Get current weather for a city
 * @param {string} city 
 * @returns {Promise<Object>}
 */
const getCurrentWeather = async (city) => {
  const cacheKey = `current_${normalizeCityName(city)}`;
  const cached = cache.get(cacheKey);

  if (cached) {
    console.log(`[Cache HIT] Current weather for: ${city}`);
    return cached;
  }

  console.log(`[Cache MISS] Fetching current weather for: ${city}`);

  try {
    const response = await axios.get(`${BASE_URL}/weather`, {
      params: {
        q: city,
        appid: API_KEY,
        units: 'metric',
        lang: 'vi'
      }
    });

    const data = {
      city: response.data.name,
      country: response.data.sys.country,
      temperature: Math.round(response.data.main.temp),
      feelsLike: Math.round(response.data.main.feels_like),
      tempMin: Math.round(response.data.main.temp_min),
      tempMax: Math.round(response.data.main.temp_max),
      humidity: response.data.main.humidity,
      pressure: response.data.main.pressure,
      windSpeed: response.data.wind.speed,
      windDeg: response.data.wind.deg,
      description: response.data.weather[0].description,
      icon: response.data.weather[0].icon,
      iconUrl: `https://openweathermap.org/img/wn/${response.data.weather[0].icon}@4x.png`,
      visibility: response.data.visibility / 1000, // Convert to km
      clouds: response.data.clouds.all,
      sunrise: new Date(response.data.sys.sunrise * 1000),
      sunset: new Date(response.data.sys.sunset * 1000),
      timezone: response.data.timezone,
      dt: new Date(response.data.dt * 1000),
      coord: response.data.coord
    };

    cache.set(cacheKey, data);
    return data;
  } catch (error) {
    throw error;
  }
};

/**
 * Get hourly forecast for a city (next 48 hours from 5-day forecast)
 * @param {string} city 
 * @returns {Promise<Array>}
 */
const getHourlyForecast = async (city) => {
  const cacheKey = `hourly_${normalizeCityName(city)}`;
  const cached = cache.get(cacheKey);

  if (cached) {
    console.log(`[Cache HIT] Hourly forecast for: ${city}`);
    return cached;
  }

  console.log(`[Cache MISS] Fetching hourly forecast for: ${city}`);

  try {
    const response = await axios.get(`${BASE_URL}/forecast`, {
      params: {
        q: city,
        appid: API_KEY,
        units: 'metric',
        lang: 'vi'
      }
    });

    // Get next 16 items (48 hours, 3-hour intervals)
    const hourlyData = response.data.list.slice(0, 16).map(item => ({
      dt: new Date(item.dt * 1000),
      temperature: Math.round(item.main.temp),
      feelsLike: Math.round(item.main.feels_like),
      humidity: item.main.humidity,
      description: item.weather[0].description,
      icon: item.weather[0].icon,
      iconUrl: `https://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png`,
      windSpeed: item.wind.speed,
      windDeg: item.wind.deg,
      pop: Math.round((item.pop || 0) * 100), // Probability of precipitation
      clouds: item.clouds.all
    }));

    cache.set(cacheKey, hourlyData);
    return hourlyData;
  } catch (error) {
    throw error;
  }
};

/**
 * Get 5-day forecast for a city
 * @param {string} city 
 * @returns {Promise<Array>}
 */
const getDailyForecast = async (city) => {
  const cacheKey = `daily_${normalizeCityName(city)}`;
  const cached = cache.get(cacheKey);

  if (cached) {
    console.log(`[Cache HIT] Daily forecast for: ${city}`);
    return cached;
  }

  console.log(`[Cache MISS] Fetching daily forecast for: ${city}`);

  try {
    const response = await axios.get(`${BASE_URL}/forecast`, {
      params: {
        q: city,
        appid: API_KEY,
        units: 'metric',
        lang: 'vi'
      }
    });

    // Group by day and get representative data
    const dailyMap = new Map();

    response.data.list.forEach(item => {
      const date = new Date(item.dt * 1000).toDateString();

      if (!dailyMap.has(date)) {
        dailyMap.set(date, {
          dt: new Date(item.dt * 1000),
          temps: [],
          icons: [],
          descriptions: [],
          humidity: [],
          pop: []
        });
      }

      const day = dailyMap.get(date);
      day.temps.push(item.main.temp);
      day.icons.push(item.weather[0].icon);
      day.descriptions.push(item.weather[0].description);
      day.humidity.push(item.main.humidity);
      day.pop.push(item.pop || 0);
    });

    const dailyData = Array.from(dailyMap.values()).slice(0, 5).map(day => ({
      dt: day.dt,
      tempMax: Math.round(Math.max(...day.temps)),
      tempMin: Math.round(Math.min(...day.temps)),
      // Get the most common icon (daytime preferred)
      icon: day.icons.find(i => i.endsWith('d')) || day.icons[0],
      iconUrl: `https://openweathermap.org/img/wn/${day.icons.find(i => i.endsWith('d')) || day.icons[0]}@2x.png`,
      description: day.descriptions[Math.floor(day.descriptions.length / 2)],
      humidity: Math.round(day.humidity.reduce((a, b) => a + b, 0) / day.humidity.length),
      pop: Math.round(Math.max(...day.pop) * 100)
    }));

    cache.set(cacheKey, dailyData);
    return dailyData;
  } catch (error) {
    throw error;
  }
};

/**
 * Get all weather data for a city
 * @param {string} city 
 * @returns {Promise<Object>}
 */
const getWeatherData = async (city) => {
  try {
    const [current, hourly, daily] = await Promise.all([
      getCurrentWeather(city),
      getHourlyForecast(city),
      getDailyForecast(city)
    ]);

    return {
      success: true,
      current,
      hourly,
      daily,
      fetchedAt: new Date()
    };
  } catch (error) {
    console.error('Weather API Error:', error.response?.data || error.message);

    // Return error code for i18n translation in routes
    let errorCode = 'generic';

    if (error.response) {
      switch (error.response.status) {
        case 404:
          errorCode = 'notFound';
          break;
        case 401:
          errorCode = 'invalidApiKey';
          break;
        case 429:
          errorCode = 'rateLimit';
          break;
      }
    }

    return {
      success: false,
      errorCode: errorCode,
      city
    };
  }
};

/**
 * Get wind direction key from degrees (for i18n)
 * @param {number} deg 
 * @returns {string}
 */
const getWindDirection = (deg) => {
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  const index = Math.round(deg / 45) % 8;
  return directions[index];
};

/**
 * Clear all cache
 */
const clearCache = () => {
  cache.flushAll();
  console.log('[Cache] All cache cleared');
};

/**
 * Get cache stats
 */
const getCacheStats = () => {
  return cache.getStats();
};

module.exports = {
  getWeatherData,
  getCurrentWeather,
  getHourlyForecast,
  getDailyForecast,
  getWindDirection,
  clearCache,
  getCacheStats
};

