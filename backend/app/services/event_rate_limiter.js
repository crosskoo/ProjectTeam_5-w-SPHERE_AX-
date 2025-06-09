'use strict';

class SimpleRateLimiter {
  constructor() {
    // cctvId -> { events: [timestamp], blockedUntil: timestamp }
    this.cctvData = new Map();
    this.MAX_EVENTS = 5;          // 1분에 5번
    this.TIME_WINDOW = 60 * 1000; // 1분
    this.BLOCK_TIME = 5 * 60 * 1000; // 5분 차단
  }

  // 이벤트 허용 여부 확인
  isAllowed(cctvId) {
    const now = Date.now();
    
    if (!this.cctvData.has(cctvId)) {
      this.cctvData.set(cctvId, { events: [], blockedUntil: null });
    }
    
    const data = this.cctvData.get(cctvId);
    
    // 차단 중인지 확인
    if (data.blockedUntil && now < data.blockedUntil) {
      return false;
    }
    
    // 차단 해제
    if (data.blockedUntil && now >= data.blockedUntil) {
      data.blockedUntil = null;
      data.events = [];
    }
    
    // 1분 이내 이벤트만 유지
    data.events = data.events.filter(time => now - time < this.TIME_WINDOW);
    
    // 현재 이벤트 추가
    data.events.push(now);
    
    // 제한 확인
    if (data.events.length > this.MAX_EVENTS) {
      data.blockedUntil = now + this.BLOCK_TIME;
      console.log(`CCTV ${cctvId} 차단 시작 (5분간)`);
      return false;
    }
    
    return true;
  }

  // 차단 해제
  unblock(cctvId) {
    if (this.cctvData.has(cctvId)) {
      this.cctvData.get(cctvId).blockedUntil = null;
      this.cctvData.get(cctvId).events = [];
      return true;
    }
    return false;
  }

  // 상태 조회
  getStatus(cctvId) {
    if (!this.cctvData.has(cctvId)) {
      return { isBlocked: false, remainingTime: 0 };
    }
    
    const data = this.cctvData.get(cctvId);
    const now = Date.now();
    const isBlocked = data.blockedUntil && now < data.blockedUntil;
    const remainingTime = isBlocked ? Math.ceil((data.blockedUntil - now) / 1000) : 0;
    
    return { isBlocked, remainingTime };
  }
}

module.exports = new SimpleRateLimiter();