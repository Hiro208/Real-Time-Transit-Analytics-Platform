// src/repositories/VehicleRepository.js
const db = require('../config/db');

class VehicleRepository {
  /**
   * 批量写入车辆数据
   * @param {Array} vehicles - 车辆数据数组，每个元素包含 trip_id, route_id, lat, lon, timestamp, stop_name, current_status, direction, destination
   */
  static async bulkUpsert(vehicles) {
    if (!vehicles || vehicles.length === 0) return;

    const client = await db.pool.connect();
    try {
      await client.query('BEGIN');
      
      // 清理旧数据 
      await client.query('TRUNCATE TABLE vehicle_positions');

      //构建批量插入 SQL
      const values = [];
      const placeHolders = vehicles.map((v, i) => {
        const offset = i * 9; // 每行9个参数
        // 把参数推入大数组
        values.push(
            v.trip_id, v.route_id, v.lat, v.lon, v.timestamp,
            v.stop_name, v.current_status, v.direction, v.destination
        );
        return `($${offset + 1}, $${offset + 2}, $${offset + 3}, $${offset + 4}, $${offset + 5}, $${offset + 6}, $${offset + 7}, $${offset + 8}, $${offset + 9}, ST_SetSRID(ST_MakePoint($${offset + 4}, $${offset + 3}), 4326))`;
      }).join(', ');

      const queryText = `
        INSERT INTO vehicle_positions (
          trip_id, route_id, latitude, longitude, timestamp, 
          stop_name, current_status, direction, destination, geom
        ) VALUES ${placeHolders}
      `;

      await client.query(queryText, values);
      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }
}

module.exports = VehicleRepository;