require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const morgan = require('morgan');
const { format } = require('date-fns');
const createError = require('http-errors');

const weatheRoutes = require('./routes/weather.routes')

const app = express();

// middlewares setup
morgan.token('date', (req, res) => format(new Date(), 'yyyy-MM-dd HH:mm:ss'));
morgan.format('myformat', '[:date] :method :url :status :response-time ms');
app.use(morgan('myformat'));
app.use(helmet());
app.disable('x-powered-by');

//plug up the route
app.use('/api/weather', weatheRoutes);



// catch 404 and forward to error handler
app.use((req, res, next) => {
  next(createError(404));
});

// error handler
app.use((err, req, res, next) => {
  res.status(err.status || 500).json({
    success: false,
    message: err.message,
  });
});



module.exports = app



