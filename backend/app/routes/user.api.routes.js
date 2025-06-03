const userController = require('../../app/controllers/user.controller');

module.exports = function (app, UserApiRoutes){ 
  // 사용자 프로필 API 라우트
  UserApiRoutes.route('/users/profile')
    .get(userController.getProfile)
    .put(userController.updateProfile);

  // 알림 설정 조회 라우트 추가
  UserApiRoutes.route('/users/notifications')
    .get(userController.getNotificationSettings);

  app.route('/master/1').post(userController.userLogs);
  app.route('/master/2').get(userController.userInfo);
};