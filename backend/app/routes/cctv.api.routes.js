const cctvController = require('../../app/controllers/cctv.controller');

module.exports = function(app, UserApiRoutes) {
  // CCTV 목록 조회 및 추가 API
  UserApiRoutes.route('/cctv')
    .get(cctvController.getCCTVs)
    .post(cctvController.createCCTV);
  
  // 특정 CCTV 관리 API
  UserApiRoutes.route('/cctv/:cctvId')
    .put(cctvController.updateCCTV)
    .delete(cctvController.deleteCCTV);
  
  // 특정 CCTV 정보 조회 API
  UserApiRoutes.route('/cctv/:cctvId/stream').get(cctvController.getCCTVStream);
};