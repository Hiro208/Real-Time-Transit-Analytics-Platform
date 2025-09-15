// backend/src/config/db.js
const { Pool } = require('pg');

// 引入 dotenv
require('dotenv').config();

// 创建连接池实例
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  // 生产环境优化配置 
  max: 20, 
  idleTimeoutMillis: 30000 
});

pool.on('connect', () => {
});

pool.on('error', (err) => {
  console.error('❌ Unexpected error on idle client', err);
  process.exit(-1); 
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool: pool 
};