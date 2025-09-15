require('dotenv').config();
const app = require('./app');
const { fetchAndProcessData } = require('./worker/index'); 
const PORT = process.env.PORT || 5000;

//启动 HTTP Server
app.listen(PORT, () => {
  console.log(`\n🚀 API Server running on port ${PORT}`);
  console.log(`📡 Endpoint: http://localhost:${PORT}/api/vehicles`);
});

//启动后台 
try {
  console.log("🛠️  Initializing Background ETL Worker...");

  fetchAndProcessData();

  setInterval(fetchAndProcessData, 15000);
  
} catch (err) {
  console.error("💥 Worker Initialization Failed:", err);
}