

const db = require('../config/db');

async function initDB() {
  console.log("🛠️  Starting Database Initialization...");

  const client = await db.pool.connect(); // 从连接池拿一个连接

  try {
    // 开启 PostGIS 插件
    await client.query('CREATE EXTENSION IF NOT EXISTS postgis;');
    console.log("✅ PostGIS Extension Enabled.");

    // 删除旧表 
    await client.query('DROP TABLE IF EXISTS vehicle_positions;');

    // 创建新表
    const createTableQuery = `
      CREATE TABLE vehicle_positions (
        id SERIAL PRIMARY KEY,
        trip_id VARCHAR(100) NOT NULL,
        route_id VARCHAR(50) NOT NULL,
        direction_id INTEGER, 
        latitude FLOAT,
        longitude FLOAT,
        current_status VARCHAR(50),
        timestamp BIGINT,
        geom GEOMETRY(Point, 4326)
      );
    `;
    await client.query(createTableQuery);
    console.log("✅ Table 'vehicle_positions' created.");

    //创建空间索引 
    await client.query('CREATE INDEX idx_vehicle_positions_geom ON vehicle_positions USING GIST(geom);');
    console.log("✅ Spatial Index (GIST) created.");
    
    // 创建基础索引
    await client.query('CREATE INDEX idx_vehicle_positions_route ON vehicle_positions(route_id);');
    console.log("✅ Route Index created.");

  } catch (err) {
    console.error("❌ Database Initialization Failed:", err);
  } finally {
    client.release(); // 释放连接回池子
    db.pool.end();    // 关闭整个连接池，脚本退出
    console.log("🏁 Initialization Complete. Connection closed.");
  }
}

// 执行函数
initDB();