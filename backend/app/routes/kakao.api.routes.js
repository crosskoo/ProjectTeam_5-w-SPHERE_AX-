const kakaoAuthController = require('../../app/controllers/kakao_auth.controller');

module.exports = function(app, UserApiRoutes) {
  // 카카오 인증 URL 조회
  UserApiRoutes.route('/notifications/kakao/auth-url').get(kakaoAuthController.getKakaoAuthUrl);
  
  // 카카오 인증 콜백 처리 (JWT 토큰 불필요)
  app.route('/auth/kakao/callback').get(kakaoAuthController.kakaoCallback);
  
  // 카카오 토큰 갱신 
  UserApiRoutes.route('/notifications/kakao/refresh').post(kakaoAuthController.refreshKakaoToken);
  
  // 카카오 연동 해제 
  UserApiRoutes.route('/notifications/kakao/disconnect').delete(kakaoAuthController.disconnectKakao);
  
  // 알림 설정 업데이트
  UserApiRoutes.route('/notifications/settings').put(kakaoAuthController.updateNotificationSettings);
};