const cron = require('node-cron');
const axios = require('axios');
const mongoose = require('mongoose');
const config = require('../../config/node_config');
const UserInfo = mongoose.model('UserInfo');

class TokenRefreshScheduler {
  constructor() {
    this.isRunning = false;
  }

  // 스케줄러 시작
  start() {
    if (this.isRunning) {
      console.log('토큰 갱신 스케줄러가 이미 실행 중입니다.');
      return;
    }

    // 매일 새벽 2시에 토큰 갱신 작업 실행
    cron.schedule('0 2 * * *', async () => {
      console.log('카카오 토큰 갱신 작업 시작...');
      await this.refreshExpiredTokens();
    });

    // 서버 시작 시 한 번 실행
    setTimeout(() => {
      this.refreshExpiredTokens();
    }, 30000); // 30초 후 실행

    this.isRunning = true;
    console.log('카카오 토큰 갱신 스케줄러가 시작되었습니다.');
  }

  // 만료 예정인 토큰들 갱신
  async refreshExpiredTokens() {
    try {
      // 24시간 이내에 만료될 토큰을 가진 사용자들 조회
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      const usersWithExpiringTokens = await UserInfo.find({
        kakaoAccessToken: { $exists: true, $ne: null },
        kakaoRefreshToken: { $exists: true, $ne: null },
        kakaoTokenExpiresAt: {
          $exists: true,
          $lte: tomorrow
        },
        'notificationSettings.kakaoEnabled': true
      });

      console.log(`만료 예정 토큰을 가진 사용자 수: ${usersWithExpiringTokens.length}`);

      if (usersWithExpiringTokens.length === 0) {
        console.log('갱신할 토큰이 없습니다.');
        return;
      }

      // 각 사용자의 토큰 갱신
      for (const user of usersWithExpiringTokens) {
        try {
          await this.refreshUserToken(user);
          
          // API 제한을 피하기 위한 지연
          await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (err) {
          console.error(`사용자 ${user.ID}의 토큰 갱신 실패:`, err.message);
        }
      }

      console.log('카카오 토큰 갱신 작업 완료');
    } catch (err) {
      console.error('토큰 갱신 작업 중 오류:', err);
    }
  }

  // 개별 사용자 토큰 갱신
  async refreshUserToken(user) {
    try {
      console.log(`사용자 ${user.ID}의 카카오 토큰 갱신 시도...`);

      const response = await axios.post('https://kauth.kakao.com/oauth/token', {
        grant_type: 'refresh_token',
        client_id: config.kakaoClientId,
        client_secret: config.kakaoClientSecret,
        refresh_token: user.kakaoRefreshToken
      }, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });

      const { access_token, refresh_token, expires_in } = response.data;

      // 새 토큰 정보 저장
      user.kakaoAccessToken = access_token;
      if (refresh_token) {
        user.kakaoRefreshToken = refresh_token;
      }
      user.kakaoTokenExpiresAt = new Date(Date.now() + expires_in * 1000);

      await user.save();

      console.log(`사용자 ${user.ID}의 카카오 토큰 갱신 성공 (만료일: ${user.kakaoTokenExpiresAt})`);
      
      return true;
    } catch (err) {
      console.error(`사용자 ${user.ID}의 토큰 갱신 실패:`, err.response?.data || err.message);
      
      // 리프레시 토큰도 만료된 경우 카카오 연동 해제
      if (err.response?.status === 400 || err.response?.data?.error === 'invalid_grant') {
        console.log(`사용자 ${user.ID}의 리프레시 토큰이 만료되어 카카오 연동을 해제합니다.`);
        
        user.kakaoAccessToken = undefined;
        user.kakaoRefreshToken = undefined;
        user.kakaoTokenExpiresAt = undefined;
        user.notificationSettings.kakaoEnabled = false;
        
        await user.save();
      }
      
      throw err;
    }
  }

  // 특정 사용자의 토큰 강제 갱신
  async forceRefreshUserToken(userId) {
    try {
      const user = await UserInfo.findById(userId);
      if (!user || !user.kakaoRefreshToken) {
        throw new Error('사용자를 찾을 수 없거나 리프레시 토큰이 없습니다.');
      }

      await this.refreshUserToken(user);
      return true;
    } catch (err) {
      console.error(`사용자 ${userId}의 강제 토큰 갱신 실패:`, err);
      throw err;
    }
  }

  // 스케줄러 중지
  stop() {
    this.isRunning = false;
    console.log('카카오 토큰 갱신 스케줄러가 중지되었습니다.');
  }
}

module.exports = new TokenRefreshScheduler();