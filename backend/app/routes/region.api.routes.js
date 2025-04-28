const regionController = require('../../app/controllers/region.controller');

module.exports = function(app, UserApiRoutes) {
  // 지역 정보 조회 API
  UserApiRoutes.route('/regions')
    .get(regionController.getRegions)
    .post(regionController.createRegion);
  
  // 지역 관리 API
  UserApiRoutes.route('/regions/:regionId')
    .put(regionController.updateRegion)
    .delete(regionController.deleteRegion);
};