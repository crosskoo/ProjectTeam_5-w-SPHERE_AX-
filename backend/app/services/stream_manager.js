const videoStream = require('../../utils/video_stream');
const mongoose = require('mongoose');
const CCTV = mongoose.model('CCTV');

// 스트림 시작
const startStream = async (cctvId, rtspUrl) => {
  try {
    // RTSP URL이 없는 경우 CCTV 정보에서 가져오기
    if (!rtspUrl) {
      const cctv = await CCTV.findById(cctvId);
      if (!cctv) {
        throw new Error('CCTV를 찾을 수 없습니다.');
      }
      rtspUrl = cctv.streamUrl;
    }
    
    // RTSP URL 확인
    if (!rtspUrl || !rtspUrl.startsWith('rtsp://')) {
      throw new Error('유효한 RTSP URL이 필요합니다.');
    }
    
    // RTSP → HLS 변환 시작
    const result = await videoStream.convertRtspToHls(rtspUrl, cctvId);
    
    // 스트림 상태 업데이트 (WebSocket을 통해 알림)
    global.socketCli.emit('stream_update', {
      type: 'stream_update',
      data: {
        cctvId,
        streamUrl: `/api/stream/hls/${cctvId}/index.m3u8`, // 인증이 필요한 URL로 변경됨
        status: 'active',
        timestamp: new Date()
      }
    });
    
    return result;
  } catch (err) {
    console.error(`스트림 시작 오류 (CCTV ID: ${cctvId}):`, err);
    throw err;
  }
};

// 스트림 중지
const stopStream = async (cctvId) => {
  try {
    const result = videoStream.stopHlsStream(cctvId);
    
    // 스트림 상태 업데이트 (WebSocket을 통해 알림)
    global.socketCli.emit('stream_update', {
      type: 'stream_update',
      data: {
        cctvId,
        status: 'inactive',
        timestamp: new Date()
      }
    });
    
    return result;
  } catch (err) {
    console.error(`스트림 중지 오류 (CCTV ID: ${cctvId}):`, err);
    throw err;
  }
};

// 스트림 상태 확인
const getStreamStatus = (cctvId) => {
  return videoStream.getStreamStatus(cctvId);
};

// 모든 활성 스트림 조회
const getAllActiveStreams = () => {
  return videoStream.getAllStreams();
};

// 스트림 활성화 확인 및 필요시 시작
const ensureStreamActive = async (cctvId, rtspUrl) => {
  const status = getStreamStatus(cctvId);
  
  if (!status.isActive) {
    return await startStream(cctvId, rtspUrl);
  }
  
  return {
    cctvId,
    status: 'already_active',
    hlsUrl: `/api/stream/hls/${cctvId}/index.m3u8`
  };
};

// 시스템 시작 시 모든 활성 CCTV 스트림 시작
const initializeAllStreams = async () => {
  try {
    // 상태가 'active'인 모든 CCTV 조회
    const activeCCTVs = await CCTV.find({ status: 'active' });
    
    console.log(`시스템 초기화: ${activeCCTVs.length}개의 활성 CCTV 스트림 시작 중...`);
    
    // 각 CCTV에 대해 스트림 시작
    for (const cctv of activeCCTVs) {
      try {
        await startStream(cctv._id, cctv.streamUrl);
        console.log(`CCTV '${cctv.name}' 스트림 시작 성공`);
      } catch (err) {
        console.error(`CCTV '${cctv.name}' 스트림 시작 실패:`, err);
      }
    }
    
    console.log('모든 활성 CCTV 스트림 초기화 완료');
  } catch (err) {
    console.error('스트림 초기화 오류:', err);
  }
};

module.exports = {
  startStream,
  stopStream,
  getStreamStatus,
  getAllActiveStreams,
  ensureStreamActive,
  initializeAllStreams
};