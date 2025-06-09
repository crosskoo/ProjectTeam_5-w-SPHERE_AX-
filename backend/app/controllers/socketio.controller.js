'use strict';

const mongoose = require('mongoose');
const Event = mongoose.model('Event');
const CCTV = mongoose.model('CCTV');
const Region = mongoose.model('Region');
const UserInfo = mongoose.model('UserInfo');
const UserRegion = mongoose.model('UserRegion');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const rateLimiter = require('../services/event_rate_limiter');

// 카카오톡 알림 서비스 추가
const kakaoNotificationService = require('../services/kakao_notification_service');

// 이미지 저장 유틸리티 함수
const saveEventImage = (base64Image, eventId) => {
  return new Promise((resolve, reject) => {
    try {
      if (!base64Image) {
        console.log('이미지 저장 실패: 이미지 데이터 없음');
        return resolve(null);
      }
      
      console.log(`이미지 데이터 길이: ${base64Image.length}`);
      console.log(`이미지 데이터 앞부분: ${base64Image.substring(0, 50)}...`);

      // base64 데이터에서 실제 이미지 데이터 추출
      let imageData;
      
      if (base64Image.startsWith('data:')) {
        // 정규 base64 이미지 포맷인 경우
        const matches = base64Image.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
        if (matches && matches.length === 3) {
          console.log(`이미지 타입: ${matches[1]}`);
          imageData = Buffer.from(matches[2], 'base64');
        } else {
          console.error('이미지 데이터 형식 오류: data: 형식이지만 추출 실패');
          return resolve(null);
        }
      } else {
        // 단순 base64 문자열인 경우
        try {
          imageData = Buffer.from(base64Image, 'base64');
          console.log(`단순 base64 문자열에서 추출 성공: ${imageData.length} 바이트`);
        } catch (error) {
          console.error('base64 디코딩 오류:', error);
          return resolve(null);
        }
      }

      // 이미지 데이터 유효성 확인
      if (!imageData || imageData.length === 0) {
        console.error('이미지 데이터가 유효하지 않음: 빈 버퍼');
        return resolve(null);
      }
      
      console.log(`변환된 이미지 데이터 크기: ${imageData.length} 바이트`);

      // 이미지 저장 경로 설정
      const uploadsDir = path.join(__dirname, '../../public/uploads/events');
      console.log(`업로드 디렉토리 경로: ${uploadsDir}`);
      
      if (!fs.existsSync(uploadsDir)) {
        console.log(`업로드 디렉토리가 없어 생성 중: ${uploadsDir}`);
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      // 파일명 생성 (이벤트 ID + 타임스탬프)
      const fileName = `${eventId}_${Date.now()}.jpg`;
      const filePath = path.join(uploadsDir, fileName);
      console.log(`저장할 파일 경로: ${filePath}`);

      // 파일 저장
      fs.writeFileSync(filePath, imageData);
      console.log(`이미지 파일 저장 완료: ${filePath}`);

      // 접근 URL 반환
      const imageUrl = `/uploads/events/${fileName}`;
      console.log(`반환할 이미지 URL: ${imageUrl}`);
      return resolve(imageUrl);
    } catch (err) {
      console.error('이미지 저장 오류:', err);
      return resolve(null);
    }
  });
};

// 카카오톡 알림 전송 함수
const sendKakaoNotifications = async (eventData) => {
  try {
    console.log('카카오톡 알림 전송 시작:', eventData.region);
    
    // 해당 지역의 사용자들 조회
    let targetUsers = [];
    
    if (eventData.regionId) {
      // 해당 지역 담당 사용자들 조회
      const userRegions = await UserRegion.find({ region_id: eventData.regionId })
        .populate('user_id');
      
      targetUsers = userRegions
        .map(ur => ur.user_id)
        .filter(user => user && user.canReceiveKakaoNotification() && user.notificationSettings.fireDetection);
    }
    
    // 관리자 사용자들도 포함
    const adminUsers = await UserInfo.find({ 
      role: 'admin',
      'notificationSettings.kakaoEnabled': true,
      'notificationSettings.fireDetection': true
    });
    
    // 중복 제거하여 합치기
    const allTargetUsers = [...targetUsers, ...adminUsers.filter(admin => 
      !targetUsers.some(user => user._id.toString() === admin._id.toString())
    )];
    
    console.log(`카카오톡 알림 대상 사용자 수: ${allTargetUsers.length}`);
    
    if (allTargetUsers.length === 0) {
      console.log('카카오톡 알림을 받을 사용자가 없습니다.');
      return;
    }
    
    // 화재 감지 메시지 생성
    const messageData = kakaoNotificationService.createFireDetectionMessage(eventData);
    
    // 알림 전송
    const results = await kakaoNotificationService.sendToMultipleUsers(allTargetUsers, messageData);
    
    console.log('카카오톡 알림 전송 결과:', results);
    
    // 전송 결과 로깅
    const successCount = results.filter(r => r.success).length;
    const failCount = results.filter(r => !r.success).length;
    
    console.log(`카카오톡 알림 전송 완료: 성공 ${successCount}건, 실패 ${failCount}건`);
    
  } catch (err) {
    console.error('카카오톡 알림 전송 중 오류:', err);
  }
};

// AI 서버로부터 이벤트 처리 함수
const processDetectionEvent = async (data) => {
  try {
    const { streamUrl, timestamp, confidence, bounding_box, imageData, metadata } = data;
    
    console.log('이벤트 처리 시작:', {
      streamUrl,
      timestamp,
      confidence,
      hasImageData: !!imageData,
      imageDataLength: imageData ? imageData.length : 0,
      bounding_box,
      metadata
    });
    
    // 스트림 URL로 CCTV 정보 조회
    const cctv = await CCTV.findOne({ streamUrl });
    if (!cctv) {
      console.error(`스트림 URL에 해당하는 CCTV를 찾을 수 없음: ${streamUrl}`);
      return null;
    }
    
    console.log('CCTV 정보 조회 성공:', {
      id: cctv._id,
      name: cctv.name,
      location: cctv.location,
      region_id: cctv.region_id
    });
    
    // CCTV ID 설정
    const cctvId = cctv._id;
    
    // 이미지 저장
    let imageUrl = null;
    if (imageData) {
      console.log('이미지 데이터 존재, 저장 시도 중...');
      imageUrl = await saveEventImage(imageData, cctvId);
      console.log('이미지 저장 결과:', imageUrl);
    } else {
      console.log('이미지 데이터 없음, 이미지 저장 건너뜀');
    }
    
    // 지역 정보 조회
    const region = await Region.findById(cctv.region_id);
    if (!region) {
      console.error(`지역 정보를 찾을 수 없음: ${cctv.region_id}`);
    } else {
      console.log('지역 정보 조회 성공:', {
        id: region._id,
        name: region.name
      });
    }
    
    // 새 이벤트 생성
    const newEvent = new Event({
      timestamp: timestamp ? new Date(timestamp) : new Date(),
      cctv_id: cctvId,
      location: cctv.location,
      region_id: cctv.region_id,
      confidence: confidence || 0,
      imageUrl: imageUrl,
      status: 'new',
      boundingBox: bounding_box || {},
      metadata: metadata || {}
    });
    
    await newEvent.save();
    console.log('새 이벤트 저장 성공:', {
      id: newEvent._id,
      timestamp: newEvent.timestamp,
      location: newEvent.location,
      confidence: newEvent.confidence,
      imageUrl: newEvent.imageUrl
    });
    
    // 이벤트 데이터 구성 (전체 정보 포함)
    const eventData = {
      eventId: newEvent._id,
      cctvId: cctvId,
      cctvName: cctv.name,
      timestamp: newEvent.timestamp,
      location: newEvent.location,
      region: region ? region.name : '알 수 없음',
      regionId: cctv.region_id,
      confidence: newEvent.confidence,
      imageUrl: imageUrl,
      status: newEvent.status,
      boundingBox: newEvent.boundingBox,
      metadata: newEvent.metadata
    };
    
    // 카카오톡 알림 전송 (비동기로 실행하여 응답 지연 방지)
    setImmediate(() => {
      sendKakaoNotifications(eventData);
    });
    
    return eventData;
  } catch (err) {
    console.error('감지 이벤트 처리 오류:', err);
    return null;
  }
};

// 소켓 연결을 지역별로 관리
const socketSubscriptions = new Map();
const regionSockets = new Map();

module.exports = function(io, socket) {
  // 클라이언트 인증 처리
  socket.on('authenticate', async (data) => {
    try {
      const { token } = data;
      
      // 토큰 검증
      const jwt = require('jsonwebtoken');
      const config = require('../../config/node_config');
      
      jwt.verify(token, config.UsertokenSecret, async (err, decoded) => {
        if (err) {
          console.error('토큰 검증 실패:', err);
          return socket.emit('auth_error', { message: '인증에 실패했습니다.' });
        }
        
        // 인증 성공
        socket.userId = decoded.id;
        socket.userRole = decoded.role;
        socket.userName = decoded.ID;
        
        // 관리자 역할 설정
        if (decoded.role === 'admin') {
          socket.join('role:admin');
          console.log(`사용자 ${decoded.ID}가 관리자 역할로 인증됨`);
        }
        
        // 사용자의 지역 정보 가져오기
        let regionNames = [];
        
        if (decoded.role !== 'admin') {
          const userRegions = await UserRegion.find({ user_id: decoded.id }).populate('region_id');
          
          console.log(`사용자 ${decoded.ID}의 지역 정보:`, userRegions.map(ur => ({
            id: ur.region_id._id.toString(),
            name: ur.region_id.name
          })));
          
          // 사용자가 접근 가능한 지역 정보 목록
          const allowedRegions = userRegions.map(ur => ({
            id: ur.region_id._id.toString(),
            name: ur.region_id.name
          }));
          
          socket.allowedRegions = allowedRegions;
          regionNames = allowedRegions.map(region => region.name);
          
          // 각 지역의 방에 조인 (이름 기반)
          allowedRegions.forEach(region => {
            const roomName = `region:${region.name}`;
            socket.join(roomName);
            console.log(`사용자 ${decoded.ID}가 방 ${roomName}에 참여함`);
            
            // 지역별 소켓 맵에 추가
            if (!regionSockets.has(region.name)) {
              regionSockets.set(region.name, new Set());
            }
            regionSockets.get(region.name).add(socket);
          });
          
          console.log(`사용자 ${decoded.ID}의 접근 가능 지역: ${regionNames.join(', ')}`);
        } else {
          // 관리자는 모든 지역에 접근 가능
          socket.allowedRegions = 'all';
          
          // 모든 지역 찾기
          const allRegions = await Region.find({});
          regionNames = allRegions.map(r => r.name);
          
          // 관리자가 모든 지역 방에 조인
          regionNames.forEach(regionName => {
            const roomName = `region:${regionName}`;
            socket.join(roomName);
            console.log(`관리자 ${decoded.ID}가 방 ${roomName}에 참여함`);
          });
        }
        
        // 인증된 소켓에 현재 참여 중인 방 목록 전송
        const rooms = Array.from(socket.rooms).filter(room => room !== socket.id);
        console.log(`소켓 ${socket.id}의 현재 방 목록:`, rooms);
        
        socket.emit('authenticated', { 
          message: '인증 성공', 
          userId: decoded.id,
          role: decoded.role,
          regions: regionNames
        });
        
        console.log(`소켓 인증 성공: 사용자 ${decoded.ID}, 역할: ${decoded.role}`);
      });
    } catch (err) {
      console.error('소켓 인증 오류:', err);
      socket.emit('auth_error', { message: '인증 중 오류가 발생했습니다.' });
    }
  });
  
  // AI 서버로부터 감지 이벤트 수신
  socket.on('detection_event', async (data) => {
    // 클라이언트 타입 검사
    if (socket.handshake.query.client !== 'ai-server') {
      console.warn(`비AI서버 클라이언트(${socket.id})가 detection_event를 시도함`);
      return;
    }
    
    console.log('AI 서버로부터 감지 이벤트 수신:', data.streamUrl);
    
    // CCTV 정보 조회
    const cctv = await CCTV.findOne({ streamUrl: data.streamUrl });
    if (!cctv) {
      console.error(`CCTV를 찾을 수 없음: ${data.streamUrl}`);
      return socket.emit('detection_processed', { success: false, message: 'CCTV not found' });
    }
    
    const cctvId = cctv._id.toString();
    
    // 레이트 리미터 확인
    if (!rateLimiter.isAllowed(cctvId)) {
      const status = rateLimiter.getStatus(cctvId);
      console.log(`CCTV ${cctv.name} 이벤트 차단됨 (${status.remainingTime}초 남음)`);
      
      return socket.emit('detection_processed', {
        success: false,
        blocked: true,
        remainingTime: status.remainingTime,
        message: `이벤트가 차단되었습니다. ${status.remainingTime}초 후 재시도하세요.`
      });
    }
    
    // 정상 이벤트 처리
    const eventData = await processDetectionEvent(data);
    
    if (eventData) {
      // 알림 전송
      if (eventData.region) {
        io.to(`region:${eventData.region}`).emit('event_detected', {
          type: 'event_detected',
          data: eventData
        });
      }
      
      io.to('role:admin').emit('event_detected', {
        type: 'event_detected',
        data: eventData
      });
      
      socket.emit('detection_processed', {
        success: true,
        eventId: eventData.eventId,
        data: eventData
      });
    } else {
      socket.emit('detection_processed', {
        success: false,
        message: '이벤트 처리 중 오류가 발생했습니다.'
      });
    }
  });

  // 스트림 상태 업데이트
  socket.on('stream_status', (data) => {
    // 특정 지역이나 해당 CCTV를 구독 중인 소켓에만 전송
    if (data.region) {
      const roomName = `region:${data.region}`;
      io.to(roomName).emit('stream_update', {
        type: 'stream_update',
        data: {
          cctvId: data.cctvId,
          streamUrl: data.streamUrl,
          status: data.status,
          timestamp: new Date()
        }
      });
    } else {
      // 특정 지역이 없는 경우 전체 소켓에 전송
      socket.broadcast.emit('stream_update', {
        type: 'stream_update',
        data: {
          cctvId: data.cctvId,
          streamUrl: data.streamUrl,
          status: data.status,
          timestamp: new Date()
        }
      });
    }
  });

  // 테스트용 카카오 알림 전송
  socket.on('test_kakao_notification', async (data) => {
    if (!socket.authenticated || socket.userRole !== 'admin') {
      return socket.emit('error', { message: '관리자만 테스트 알림을 보낼 수 있습니다.' });
    }
    
    try {
      const testEventData = {
        eventId: 'test-' + Date.now(),
        cctvName: '테스트 CCTV',
        region: '테스트 지역',
        timestamp: new Date(),
        confidence: 0.95,
        status: 'new',
        imageUrl: null
      };
      
      await sendKakaoNotifications(testEventData);
      
      socket.emit('test_notification_sent', {
        success: true,
        message: '테스트 알림이 전송되었습니다.'
      });
    } catch (err) {
      console.error('테스트 알림 전송 오류:', err);
      socket.emit('test_notification_sent', {
        success: false,
        message: '테스트 알림 전송에 실패했습니다.'
      });
    }
  });

  // 연결 해제 시 정리
  socket.on('disconnect', () => {
    // 지역 구독 맵에서 제거
    if (socket.allowedRegions && socket.allowedRegions !== 'all') {
      socket.allowedRegions.forEach(region => {
        if (regionSockets.has(region.name)) {
          regionSockets.get(region.name).delete(socket);
          if (regionSockets.get(region.name).size === 0) {
            regionSockets.delete(region.name);
          }
        }
      });
    }

    console.log(`소켓 연결 종료: ${socket.userName || socket.id}`);
  });
};