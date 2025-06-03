const axios = require('axios');
const config = require('../../config/node_config');

class KakaoNotificationService {
  constructor() {
    this.apiKey = config.kakaoApiKey;
    this.baseUrl = 'https://kapi.kakao.com';
  }

  /**
   * 카카오톡 메시지 전송
   * @param {string} accessToken - 사용자의 카카오 액세스 토큰
   * @param {Object} messageData - 메시지 데이터
   */
  async sendMessage(accessToken, messageData) {
    try {
      const response = await axios.post(
        `${this.baseUrl}/v2/api/talk/memo/default/send`,
        {
          template_object: JSON.stringify(messageData)
        },
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );

      console.log('카카오톡 메시지 전송 성공:', response.data);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('카카오톡 메시지 전송 실패:', error.response?.data || error.message);
      return { success: false, error: error.response?.data || error.message };
    }
  }

  /**
   * 화재 감지 알림 메시지 템플릿
   * @param {Object} eventData - 이벤트 데이터
   */
  createFireDetectionMessage(eventData) {
    return {
      object_type: "text",
      text: `🔥 화재 감지 알림 🔥
      
📍 위치: ${eventData.region} - ${eventData.cctvName}
🕐 시간: ${new Date(eventData.timestamp).toLocaleString('ko-KR')}
📊 신뢰도: ${(eventData.confidence * 100).toFixed(1)}%
📋 상태: ${this.getStatusText(eventData.status)}

${eventData.imageUrl ? '📸 이미지가 첨부되었습니다.' : ''}

즉시 현장을 확인해주세요!`,
      link: {
        web_url: `${config.webUrl}${eventData.imageUrl}`,
        mobile_web_url: `${config.webUrl}${eventData.imageUrl}`
      }
    };
  }

  /**
   * 시스템 알림 메시지 템플릿
   * @param {string} title - 제목
   * @param {string} message - 메시지
   */
  createSystemMessage(title, message) {
    return {
      object_type: "text",
      text: `🔔 ${title}
      
${message}

시간: ${new Date().toLocaleString('ko-KR')}`,
      link: {
        web_url: config.webUrl,
        mobile_web_url: config.webUrl
      }
    };
  }

  /**
   * 상태 텍스트 변환
   * @param {string} status - 상태 코드
   */
  getStatusText(status) {
    const statusMap = {
      'new': '신규',
      'processing': '처리중',
      'confirmed': '확인됨',
      'falseAlarm': '오탐지지',
      'resolved': '해결됨'
    };
    return statusMap[status] || status;
  }

  /**
   * 여러 사용자에게 메시지 전송
   * @param {Array} users - 사용자 목록 (카카오 토큰 포함)
   * @param {Object} messageData - 메시지 데이터
   */
  async sendToMultipleUsers(users, messageData) {
    const results = [];
    
    for (const user of users) {
      if (user.kakaoAccessToken) {
        const result = await this.sendMessage(user.kakaoAccessToken, messageData);
        results.push({
          userId: user.id,
          userName: user.name,
          success: result.success,
          error: result.error
        });
        
        // API 제한을 피하기 위한 지연
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    
    return results;
  }
}

module.exports = new KakaoNotificationService();