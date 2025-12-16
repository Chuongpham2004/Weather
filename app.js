require('dotenv').config();
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var i18n = require('i18n');

var indexRouter = require('./routes/index');

var app = express();

// Supported languages
const SUPPORTED_LOCALES = ['vi', 'en'];
const DEFAULT_LOCALE = 'vi';

// i18n configuration
i18n.configure({
  locales: SUPPORTED_LOCALES,
  defaultLocale: DEFAULT_LOCALE,
  directory: path.join(__dirname, 'locales'),
  objectNotation: true,
  updateFiles: false,
  autoReload: true,
  syncFiles: false
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// Initialize i18n
app.use(i18n.init);

// Static files with caching headers
app.use(express.static(path.join(__dirname, 'public'), {
  maxAge: '1d',
  etag: true
}));

// Language detection middleware from URL
app.use((req, res, next) => {
  // Extract language from URL path (e.g., /vi/weather or /en/about)
  const pathParts = req.path.split('/').filter(Boolean);
  const firstPart = pathParts[0];

  if (SUPPORTED_LOCALES.includes(firstPart)) {
    // Set locale from URL
    req.setLocale(firstPart);
    res.locals.currentLang = firstPart;
    // Store the original path without language prefix
    res.locals.pathWithoutLang = '/' + pathParts.slice(1).join('/') || '/';
  } else {
    // No language in URL - redirect to default locale
    const targetLang = req.cookies.lang || DEFAULT_LOCALE;
    if (req.path !== '/favicon.ico' && !req.path.startsWith('/stylesheets') && !req.path.startsWith('/images')) {
      return res.redirect(301, `/${targetLang}${req.originalUrl}`);
    }
    req.setLocale(DEFAULT_LOCALE);
    res.locals.currentLang = DEFAULT_LOCALE;
    res.locals.pathWithoutLang = req.path;
  }

  next();
});

// Make common helpers available to all views
app.use((req, res, next) => {
  // Current year
  res.locals.currentYear = new Date().getFullYear();

  // Languages for switcher
  res.locals.languages = SUPPORTED_LOCALES.map(code => ({
    code,
    name: code === 'vi' ? 'Tiếng Việt' : 'English',
    flag: code === 'vi' ? '🇻🇳' : '🇬🇧'
  }));

  // Translation function for views
  res.locals.__ = res.__;
  res.locals.t = res.__;

  // Base URL for canonical links
  res.locals.baseUrl = process.env.BASE_URL || 'https://weatherapp.com';

  // Current path without language for hreflang (e.g., /weather?city=Hanoi)
  const pathWithoutLang = res.locals.pathWithoutLang || '/';
  const queryString = req.originalUrl.includes('?') ? req.originalUrl.split('?')[1] : '';
  res.locals.pathWithoutLang = pathWithoutLang + (queryString ? '?' + queryString : '');

  // Full current path with language
  res.locals.currentPath = `/${res.locals.currentLang}${res.locals.pathWithoutLang}`;

  // Date formatting based on locale
  const locale = req.getLocale();
  const localeCode = locale === 'vi' ? 'vi-VN' : 'en-US';

  res.locals.formatTime = (date) => {
    return new Date(date).toLocaleTimeString(localeCode, {
      hour: '2-digit',
      minute: '2-digit',
      hour12: locale === 'en'
    });
  };

  res.locals.formatDate = (date) => {
    return new Date(date).toLocaleDateString(localeCode, {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    });
  };

  res.locals.formatShortDate = (date) => {
    return new Date(date).toLocaleDateString(localeCode, {
      weekday: 'short',
      day: 'numeric',
      month: 'numeric'
    });
  };

  next();
});

// Routes with language prefix
app.use('/:lang(vi|en)', indexRouter);

// Root redirect to default language
app.get('/', (req, res) => {
  const targetLang = req.cookies.lang || DEFAULT_LOCALE;
  res.redirect(301, `/${targetLang}/`);
});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error', {
    title: res.__('error.title'),
    description: res.__('error.title'),
    weather: null,
    errorCode: err.status || 500,
    errorMessage: err.status === 404
      ? res.__('error.404.message')
      : res.__('error.500.message')
  });
});

module.exports = app;
