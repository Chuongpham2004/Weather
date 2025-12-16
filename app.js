require('dotenv').config();
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var i18n = require('i18n');

var indexRouter = require('./routes/index');

var app = express();

// i18n configuration
i18n.configure({
  locales: ['vi', 'en'],
  defaultLocale: 'vi',
  directory: path.join(__dirname, 'locales'),
  objectNotation: true,
  updateFiles: false,
  cookie: 'lang',
  queryParameter: 'lang',
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

// Make common helpers available to all views
app.use((req, res, next) => {
  // Current year
  res.locals.currentYear = new Date().getFullYear();

  // Current language
  res.locals.currentLang = req.getLocale();
  res.locals.languages = [
    { code: 'vi', name: 'Tiếng Việt', flag: '🇻🇳' },
    { code: 'en', name: 'English', flag: '🇬🇧' }
  ];

  // Translation function for views
  res.locals.__ = res.__;
  res.locals.t = res.__;

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

// Language switch route
app.get('/lang/:locale', (req, res) => {
  const locale = req.params.locale;
  if (['vi', 'en'].includes(locale)) {
    res.cookie('lang', locale, { maxAge: 365 * 24 * 60 * 60 * 1000 }); // 1 year
    req.setLocale(locale);
  }
  // Redirect back to previous page or home
  const referer = req.get('Referer') || '/';
  res.redirect(referer);
});

app.use('/', indexRouter);

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
