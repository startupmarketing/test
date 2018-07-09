const express = require('express');
const mongoose = require('mongoose');
const app = express();
const currencyExchangeRoutes = require('./api/routes/currency_exchange');
const webviewsRoutes = require('./webviews/routes/webviews');
const bodyParser = require('body-parser')

mongoose.connect(
	'mongodb+srv://startupmarketing:klepetalnirobot2018@startupmarketing-hzand.mongodb.net/test?retryWrites=true'
);

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

app.use('/test', express.static('public/'));// setup static files into public folder

app.use('/test', currencyExchangeRoutes);
app.use('/test/webviews', webviewsRoutes);

module.exports = app;
