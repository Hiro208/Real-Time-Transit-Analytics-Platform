// src/services/MtaParser.js
const { TERMINAL_MAP } = require('../config/constants');

class MtaParser {
  static getStatusText(statusEnum) {
    const STATUS_MAP = { 0: "INCOMING AT", 1: "STOPPED AT", 2: "EN ROUTE TO" };
    return STATUS_MAP[statusEnum] || "MOVING TO";
  }

  // 解析单条 Vehicle Entity，返回标准化对象
  static parse(entity, stationMap) {
    if (!entity.vehicle || !entity.vehicle.trip) return null;

    const v = entity.vehicle;
    const trip = v.trip;
    
    // 基础校验
    if (!v.stopId) return null;

    //解析方向和终点
    const sid = String(v.stopId);
    const suffix = sid.slice(-1).toUpperCase(); 
    const routeConf = TERMINAL_MAP[trip.routeId] || {};
    const termInfo = routeConf[suffix] || { term: 'Check Sign', dir: suffix === 'N' ? 'Uptown' : 'Downtown' };

    //解析站点名
    const cleanId = sid.replace(/[NS]$/, "");
    const station = stationMap[sid] || stationMap[cleanId] || stationMap[sid.substring(0,3)];
    const stopName = station ? station.name : `Stop ${sid}`;

    //坐标处理
    let lat = v.position?.latitude || 0;
    let lon = v.position?.longitude || 0;
    
    if (lat === 0 && station) {
      lat = station.lat;
      lon = station.lon;
    }

    if (lat === 0 || lon === 0) return null;

    //返回标准对象
    return {
      trip_id: trip.tripId,
      route_id: trip.routeId,
      lat,
      lon,
      timestamp: v.timestamp ? (v.timestamp.low || v.timestamp) : Math.floor(Date.now() / 1000),
      stop_name: stopName,
      current_status: this.getStatusText(v.currentStatus),
      direction: termInfo.dir,
      destination: termInfo.term
    };
  }
}

module.exports = MtaParser;