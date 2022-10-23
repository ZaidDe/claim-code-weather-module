const { default: Redis } = require('ioredis');
const client = require('../store');

const { log } = console;
const GEO_INDEX = 'geopoints';


async function geoExists(lat, lng) {
  try {
    const foundGeoPoints = await client.georadius(GEO_INDEX, lng, lat, 100, 'km', 'ASC');
    if (!Array.isArray(foundGeoPoints) || foundGeoPoints.length === 0) return null;
    const poi = foundGeoPoints[0];
    const foundData = await client.get(poi);
    if (!foundData) return null;

    return JSON.parse(foundData);
  } catch (error) {
    log(`[Redis Service][GeoExists Fn Error] [${error.message}]`);
    return null;
  }
}

async function geoSet(lat, lng, data) {
  try {
    await client.geoadd(GEO_INDEX, lng, lat, `${lng}:${lat}`);
    await client.set(`${lng}:${lat}`, JSON.stringify(data), 'ex', 1200);

    return true;
  } catch (error) {
    log(`[Redis Service][GeoExists Fn Error] [${error.message}]`);
    return false;
  }
}

module.exports = {
  geoExists,
  geoSet,
};