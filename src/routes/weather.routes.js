const router = require('express').Router();
const axios = require('axios');
const { log } = console;
const WEATHER_API = process.env.WEATHER_URL;
const redisService = require('../services/redis.service');
const { format } = require('date-fns');

function transformData(data) {

  const hourly = data.hourly.splice(0, 24)
  const threeDay = data.daily.splice(0, 3).map(obj => {
    return {
      temp: obj.temp.day,
      high: obj.temp.max,
      low: obj.temp.min
    }
  })
  return {
    date: format(new Date(), 'yyyy-MM-dd'),
    temp: data.current.temp,
    high: threeDay[0].high,
    low: threeDay[0].low,
    hourly,
    threeDay
  }

}


router.get('/', async (req, res, next) => {

  try {
    const lat = req.query.lat;
    const lng = req.query.lng;

    if (!lat || !lng || isNaN(lat) || isNaN(lng)) {
      throw new Error('Bad Request')
    }

    const cachedData = await redisService.geoExists(lat, lng);
    if (cachedData !== null) {
      // log('CACHE HIT !!');
      return res.status(200).json({
        success: true,
        message: `lat: ${lat}, lng: ${lng}`,
        data: cachedData,
      });
    }

    // log('CACHE MISS !!');
    const weatherApi = WEATHER_API.replace('<<lat>>', `${lat}`).replace('<<lng>>', `${lng}`);
    const { data } = await axios.get(weatherApi);
    if (!data) throw new Error('Weather is not available at the moment.');
    const transformedData = transformData(data);
    await redisService.geoSet(lat, lng, transformedData);

    return res.status(200).json({
      success: true,
      message: `lat: ${lat}, lng: ${lng}`,
      data: transformedData
    });
  } catch (error) {
    log(`[WEATHER SERVICE] [getWeather Error] [${error.message}]`);
    return res.status(400).json({
      success: false,
      message: error.message
    })
  }

});

module.exports = router;



