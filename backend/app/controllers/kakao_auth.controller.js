// app/controllers/kakao_auth.controller.js - 보안 강화 버전
const axios = require('axios');
const mongoose = require('mongoose');
const crypto = require('crypto');
const config = require('../../config/node_config');
const UserInfo = mongoose.model('UserInfo');

// 임시 인증 상태 저장 (메모리 캐시 또는 Redis 사용 권장)
const authStates = new Map();

// 만료된 상태 정리 (5분 후 만료)
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of authStates.entries()) {
    if (now - value.timestamp > 5 * 60 * 1000) { // 5분 후 만료
      authStates.delete(key);
    }
  }
}, 60000); // 1분마다 정리

// 카카오 로그인 URL 생성
exports.getKakaoAuthUrl = (req, res) => {
  try {
    const userId = req.decoded.id;
    
    // 고유한 state 값 생성
    const stateKey = crypto.randomBytes(32).toString('hex');
    
    // 사용자 정보를 임시 저장 (5분 후 만료)
    authStates.set(stateKey, {
      userId: userId,
      timestamp: Date.now()
    });
    
    const kakaoAuthUrl = `https://kauth.kakao.com/oauth/authorize?client_id=${config.kakaoClientId}&redirect_uri=${config.kakaoRedirectUri}&response_type=code&scope=talk_message&state=${stateKey}`;
    
    res.status(200).json({
      status: 'success',
      data: {
        authUrl: kakaoAuthUrl,
        state: stateKey // 디버깅용 (실제로는 제거 권장)
      }
    });
  } catch (err) {
    console.error('카카오 인증 URL 생성 오류:', err);
    res.status(500).json({
      status: 'error',
      message: '서버 오류가 발생했습니다.'
    });
  }
};

// 카카오 인증 콜백 처리
exports.kakaoCallback = async (req, res) => {
  try {
    const { code, state, error } = req.query;
    
    // 에러 처리
    if (error) {
      return res.send(createErrorPage('카카오 인증이 취소되었습니다.', error));
    }
    
    if (!code || !state) {
      return res.send(createErrorPage('인증 정보가 누락되었습니다.', '코드 또는 상태값 없음'));
    }
    
    // state 검증 및 사용자 정보 가져오기
    const authState = authStates.get(state);
    if (!authState) {
      return res.send(createErrorPage('인증 상태가 만료되었거나 유효하지 않습니다.', '상태값 불일치'));
    }
    
    // 사용된 state 삭제 (재사용 방지)
    authStates.delete(state);
    
    const userId = authState.userId;
    
    try {
      // 액세스 토큰 요청
      const tokenResponse = await axios.post('https://kauth.kakao.com/oauth/token', 
        new URLSearchParams({
          grant_type: 'authorization_code',
          client_id: config.kakaoClientId,
          client_secret: config.kakaoClientSecret,
          redirect_uri: config.kakaoRedirectUri,
          code: code
        }), {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        });
      
      const { access_token, refresh_token, expires_in } = tokenResponse.data;
      
      // 사용자 정보 업데이트
      const user = await UserInfo.findById(userId);
      if (!user) {
        return res.send(createErrorPage('사용자 정보를 찾을 수 없습니다.', '사용자 ID: ' + userId));
      }
      
      // 토큰 정보 저장
      user.kakaoAccessToken = access_token;
      user.kakaoRefreshToken = refresh_token;
      user.kakaoTokenExpiresAt = new Date(Date.now() + expires_in * 1000);
      
      // 알림 설정이 없으면 기본값 설정
      if (!user.notificationSettings) {
        user.notificationSettings = {
          kakaoEnabled: true,
          emailEnabled: true,
          fireDetection: true,
          systemAlerts: true,
          urgentOnly: false
        };
      } else {
        user.notificationSettings.kakaoEnabled = true;
      }
      
      await user.save();
      
      // 성공 페이지 반환
      res.send(createSuccessPage(user));
      
    } catch (tokenErr) {
      console.error('카카오 토큰 요청 실패:', tokenErr.response?.data || tokenErr.message);
      return res.send(createErrorPage('카카오 토큰 요청에 실패했습니다.', tokenErr.message));
    }
    
  } catch (err) {
    console.error('카카오 인증 처리 오류:', err);
    res.send(createErrorPage('서버 오류가 발생했습니다.', err.message));
  }
};

// 성공 페이지 HTML 생성
function createSuccessPage(user) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <title>카카오톡 연동 완료</title>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { 
            font-family: Arial, sans-serif; 
            text-align: center; 
            padding: 50px; 
            background: #f5f5f5;
          }
          .container {
            background: white;
            border-radius: 10px;
            padding: 30px;
            max-width: 400px;
            margin: 0 auto;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          }
          .success { color: #28a745; }
          .button { 
            padding: 10px 20px; 
            background: #fee500; 
            border: none; 
            border-radius: 5px; 
            cursor: pointer;
            font-size: 16px;
            margin: 10px;
          }
          .info { 
            background: #f8f9fa; 
            padding: 15px; 
            border-radius: 5px; 
            margin: 20px 0;
            font-size: 14px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h2 class="success">🎉 카카오톡 알림 연동 완료!</h2>
          <div class="info">
            <p><strong>사용자:</strong> ${user.name} (${user.ID})</p>
            <p><strong>만료일:</strong> ${user.kakaoTokenExpiresAt.toLocaleString('ko-KR')}</p>
            <p>이제 화재 감지 시 카카오톡으로 알림을 받을 수 있습니다.</p>
          </div>
          
          <button class="button" onclick="closeWindow()">창 닫기</button>
          <button class="button" onclick="testNotification()">테스트 알림</button>
          
          <script>
            function closeWindow() {
              // 부모 창에 성공 메시지 전달
              if (window.opener) {
                window.opener.postMessage({
                  type: 'kakao_auth_success',
                  data: {
                    kakaoEnabled: true,
                    expiresAt: '${user.kakaoTokenExpiresAt.toISOString()}',
                    userName: '${user.name}'
                  }
                }, '*');
              }
              window.close();
            }
            
            function testNotification() {
              alert('테스트 알림 기능은 개발 중입니다.');
            }
            
            // 10초 후 자동으로 창 닫기
            setTimeout(() => {
              closeWindow();
            }, 10000);
          </script>
        </div>
      </body>
    </html>
  `;
}

// 에러 페이지 HTML 생성
function createErrorPage(message, detail) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <title>카카오톡 연동 실패</title>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { 
            font-family: Arial, sans-serif; 
            text-align: center; 
            padding: 50px; 
            background: #f5f5f5;
          }
          .container {
            background: white;
            border-radius: 10px;
            padding: 30px;
            max-width: 400px;
            margin: 0 auto;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          }
          .error { color: #dc3545; }
          .button { 
            padding: 10px 20px; 
            background: #6c757d; 
            color: white;
            border: none; 
            border-radius: 5px; 
            cursor: pointer;
            font-size: 16px;
            margin: 10px;
          }
          .detail { 
            background: #f8f9fa; 
            padding: 10px; 
            border-radius: 5px; 
            margin: 15px 0;
            font-size: 12px;
            color: #666;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h2 class="error">❌ 카카오톡 연동 실패</h2>
          <p>${message}</p>
          <div class="detail">상세: ${detail}</div>
          
          <button class="button" onclick="window.close()">창 닫기</button>
          <button class="button" onclick="location.reload()">다시 시도</button>
          
          <script>
            // 부모 창에 실패 메시지 전달
            if (window.opener) {
              window.opener.postMessage({
                type: 'kakao_auth_error',
                data: {
                  message: '${message}',
                  detail: '${detail}'
                }
              }, '*');
            }
          </script>
        </div>
      </body>
    </html>
  `;
}

exports.refreshKakaoToken = async (req, res) => {
  try {
    const userId = req.decoded.id;
    
    const user = await UserInfo.findById(userId);
    if (!user || !user.kakaoRefreshToken) {
      return res.status(404).json({
        status: 'error',
        message: '카카오 리프레시 토큰을 찾을 수 없습니다.'
      });
    }
    
    // 토큰 갱신 요청
    const tokenResponse = await axios.post('https://kauth.kakao.com/oauth/token',
      new URLSearchParams({
        grant_type: 'refresh_token',
        client_id: config.kakaoClientId,
        client_secret: config.kakaoClientSecret,
        refresh_token: user.kakaoRefreshToken
      }), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });
    
    const { access_token, refresh_token, expires_in } = tokenResponse.data;
    
    // 새 토큰 정보 저장
    user.kakaoAccessToken = access_token;
    if (refresh_token) user.kakaoRefreshToken = refresh_token;
    user.kakaoTokenExpiresAt = new Date(Date.now() + expires_in * 1000);
    
    await user.save();
    
    res.status(200).json({
      status: 'success',
      message: '카카오 토큰이 갱신되었습니다.',
      data: {
        expiresAt: user.kakaoTokenExpiresAt
      }
    });
  } catch (err) {
    console.error('카카오 토큰 갱신 오류:', err);
    res.status(500).json({
      status: 'error',
      message: '토큰 갱신 중 오류가 발생했습니다.'
    });
  }
};

exports.disconnectKakao = async (req, res) => {
  try {
    const userId = req.decoded.id;
    
    const user = await UserInfo.findById(userId);
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: '사용자를 찾을 수 없습니다.'
      });
    }
    
    // 카카오 연결 해제 API 호출 (선택사항)
    if (user.kakaoAccessToken) {
      try {
        await axios.post('https://kapi.kakao.com/v1/user/unlink', {}, {
          headers: {
            'Authorization': `Bearer ${user.kakaoAccessToken}`
          }
        });
      } catch (unlinkErr) {
        console.warn('카카오 연결 해제 API 호출 실패:', unlinkErr.message);
      }
    }
    
    // 카카오 관련 정보 삭제
    user.kakaoAccessToken = undefined;
    user.kakaoRefreshToken = undefined;
    user.kakaoTokenExpiresAt = undefined;
    if (user.notificationSettings) {
      user.notificationSettings.kakaoEnabled = false;
    }
    
    await user.save();
    
    res.status(200).json({
      status: 'success',
      message: '카카오톡 알림 연동이 해제되었습니다.'
    });
  } catch (err) {
    console.error('카카오 연동 해제 오류:', err);
    res.status(500).json({
      status: 'error',
      message: '연동 해제 중 오류가 발생했습니다.'
    });
  }
};

exports.updateNotificationSettings = async (req, res) => {
  try {
    const userId = req.decoded.id;
    const { kakaoEnabled, emailEnabled, fireDetection, systemAlerts, urgentOnly } = req.body;
    
    const user = await UserInfo.findById(userId);
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: '사용자를 찾을 수 없습니다.'
      });
    }
    
    // 알림 설정이 없으면 기본값으로 초기화
    if (!user.notificationSettings) {
      user.notificationSettings = {
        kakaoEnabled: false,
        emailEnabled: true,
        fireDetection: true,
        systemAlerts: true,
        urgentOnly: false
      };
    }
    
    // 알림 설정 업데이트
    if (typeof kakaoEnabled === 'boolean') {
      user.notificationSettings.kakaoEnabled = kakaoEnabled;
    }
    if (typeof emailEnabled === 'boolean') {
      user.notificationSettings.emailEnabled = emailEnabled;
    }
    if (typeof fireDetection === 'boolean') {
      user.notificationSettings.fireDetection = fireDetection;
    }
    if (typeof systemAlerts === 'boolean') {
      user.notificationSettings.systemAlerts = systemAlerts;
    }
    if (typeof urgentOnly === 'boolean') {
      user.notificationSettings.urgentOnly = urgentOnly;
    }
    
    await user.save();
    
    res.status(200).json({
      status: 'success',
      message: '알림 설정이 업데이트되었습니다.',
      data: {
        notificationSettings: user.notificationSettings
      }
    });
  } catch (err) {
    console.error('알림 설정 업데이트 오류:', err);
    res.status(500).json({
      status: 'error',
      message: '설정 업데이트 중 오류가 발생했습니다.'
    });
  }
};