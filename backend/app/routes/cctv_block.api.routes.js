const cctvBlockController = require('../controllers/cctv_block.controller');

module.exports = function(app, UserApiRoutes) {
  // 특정 CCTV 차단 상태 조회
  UserApiRoutes.route('/cctv-block/:cctvId/status').get(cctvBlockController.getBlockStatus);
  
  // CCTV 차단 해제 (관리자만)
  UserApiRoutes.route('/cctv-block/:cctvId/unblock').post(cctvBlockController.unblockCCTV);
  
  // 모든 CCTV 차단 상태 조회 (관리자만)
  UserApiRoutes.route('/cctv-block/status').get(cctvBlockController.getAllBlockStatus);
};