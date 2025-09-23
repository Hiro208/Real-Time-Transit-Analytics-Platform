// src/worker/index.js
const axios = require('axios');
const GtfsRealtimeBindings = require('gtfs-realtime-bindings');
const { FEED_URLS } = require('../config/constants');
const MtaParser = require('../services/MtaParser');
const VehicleRepository = require('../repositories/VehicleRepository');
require('dotenv').config();

let _stationMapCache = null;

const buildStationMap = async () => {
  if (_stationMapCache) return _stationMapCache;
  console.log("🗺️ Fetching Station Meta Data...");
  try {
    const { data } = await axios.get("https://data.ny.gov/resource/39hk-dx4f.json?$limit=5000");
    _stationMapCache = {};
    data.forEach(s => {
      const stopId = s.gtfs_stop_id || s.stop_id;
      if (stopId) {
        _stationMapCache[stopId] = {
          lat: parseFloat(s.gtfs_latitude),
          lon: parseFloat(s.gtfs_longitude),
          name: s.stop_name
        };
      }
    });
    return _stationMapCache;
  } catch (e) {
    console.error("Failed to build station map", e);
    return {};
  }
};

const fetchFeed = async (url) => {
  try {
    const response = await axios({
      method: 'GET',
      url,
      responseType: 'arraybuffer',
      timeout: 5000,
      headers: { 'x-api-key': process.env.MTA_API_KEY }
    });
    return GtfsRealtimeBindings.transit_realtime.FeedMessage.decode(new Uint8Array(response.data));
  } catch (err) {
    console.warn(`⚠️ Skipped feed: ${url.slice(-5)} - ${err.message}`);
    return null;
  }
};

const fetchAndProcessData = async () => {
  const stationMap = await buildStationMap();
  const startTime = Date.now();

  try {
    // 并行抓取 (IO Bound)
    const results = await Promise.all(FEED_URLS.map(fetchFeed));
    
    //  解析数据 (CPU Bound)
    const allVehicles = [];
    results.forEach(feed => {
      if (!feed) return;
      feed.entity.forEach(entity => {
        const parsedVehicle = MtaParser.parse(entity, stationMap);
        if (parsedVehicle) {
          allVehicles.push(parsedVehicle);
        }
      });
    });

    // 批量入库 (IO Bound)
    if (allVehicles.length > 0) {
      await VehicleRepository.bulkUpsert(allVehicles);
      console.log(`✅ [${new Date().toLocaleTimeString()}] Processed ${allVehicles.length} vehicles in ${Date.now() - startTime}ms`);
    }

  } catch (error) {
    console.error("❌ ETL Loop Error:", error);
  }
};

module.exports = { fetchAndProcessData };