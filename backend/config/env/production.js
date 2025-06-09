module.exports = {
    db: process.env.MONGODB_URI || 'mongodb://mongodb:27017/tester',
    UsertokenSecret:'mv\5ecr3t',
    
    // 카카오 API 설정 추가
    kakaoClientId: '9b7c50b8ff68f5dbfbce1ee198a551c4',
    kakaoClientSecret: 'rUW38K2jSYStcGfjU8hHY5zFbS4BfX4N', 
    kakaoRedirectUri: 'http://localhost:10111/auth/kakao/callback',
    
    // 웹 URL (카카오 메시지 링크용)
    webUrl: 'http://localhost:10111'
};