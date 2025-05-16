const streamController = require('../controllers/stream.controller');

module.exports = function(app, UserApiRoutes) {
  // HLS 스트림 제공 API
  UserApiRoutes.route('/stream/hls/:cctvId/:playlist').get(streamController.getHlsStream);
  
  // 스트림 관리 API (관리자용)
  UserApiRoutes.route('/stream/:cctvId/manage').post(streamController.manageStream);
  
  // 스트림 상태 확인 API
  UserApiRoutes.route('/stream/:cctvId/status').get(streamController.checkStreamStatus);
};