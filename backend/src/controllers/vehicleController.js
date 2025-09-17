const VehicleService = require('../services/vehicleService');

class VehicleController {
  static async getVehicles(req, res) {
    try {
      // 调用 Service 层获取数据
      const vehicles = await VehicleService.getRealTimeVehicles();
      
      // 标准化 API 响应格式 
      res.status(200).json({
        success: true,
        meta: {
          total: vehicles.length,
          timestamp: new Date().toISOString()
        },
        data: vehicles
      });
    } catch (error) {
      console.error('🔥 [VehicleController] Error:', error.message);
      res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
}

module.exports = VehicleController;