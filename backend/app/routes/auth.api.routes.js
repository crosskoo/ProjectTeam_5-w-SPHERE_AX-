const authController = require('../../app/controllers/auth.controller');

module.exports = function(app, UserApiRoutes) {
  // 모든 인증 관련 API (routes_config.js에서 공개 경로 예외 처리)
  UserApiRoutes.route('/auth/login').post(authController.login);
  UserApiRoutes.route('/auth/refresh').post(authController.refreshToken);
  UserApiRoutes.route('/auth/logout').post(authController.logout);
  UserApiRoutes.route('/auth/admin/register').post(authController.register);
  UserApiRoutes.route('/auth/admin/users/:userId').delete(authController.deleteUser);
};