const db = require('../config/db');

class VehicleService {
  /**
   * 获取最近活跃的车辆数据
   * @param {number} maxAgeSeconds
   */
  static async getRealTimeVehicles(maxAgeSeconds = 60) {
    const query = `
      SELECT 
        trip_id, 
        route_id, 
        latitude, 
        longitude, 
        timestamp,
        stop_name,  
        current_status, 
        direction,     
        destination,     
        geom 
      FROM vehicle_positions
      WHERE timestamp > EXTRACT(EPOCH FROM NOW()) - $1
    `;
    
    try {
      const result = await db.query(query, [maxAgeSeconds]);
      return result.rows;
    } catch (err) {
      console.error("❌ SQL Query Error:", err);
      throw err;
    }
  }
}

module.exports = VehicleService;