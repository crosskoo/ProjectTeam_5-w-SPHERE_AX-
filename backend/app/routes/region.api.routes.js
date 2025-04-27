const regionController = require('../../app/controllers/region.controller');

module.exports = function(app, UserApiRoutes) {
  // 지역 정보 조회 API
  UserApiRoutes.route('/regions').get(regionController.getRegions);
};