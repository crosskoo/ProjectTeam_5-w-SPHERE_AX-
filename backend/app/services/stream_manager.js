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
    
    console.log(`스트림 시작 성공 (CCTV ID: ${cctvId}):`, result);
    
    // 스트림 상태 업데이트 (WebSocket을 통해 알림)
    try {
      // CCTV 정보 가져오기 (지역 정보 포함)
      const cctv = await CCTV.findById(cctvId).populate('region_id');
      if (cctv && cctv.region_id) {
        console.log(`스트림 업데이트 이벤트 전송 준비 (CCTV: ${cctv.name}, 지역: ${cctv.region_id.name})`);
        
        // Socket.IO가 전역 변수로 설정되어 있는지 확인
        if (global.io) {
          console.log('Socket.IO 인스턴스 찾음, 이벤트 전송 시도...');
          
          // 특정 지역 방에 이벤트 전송
          global.io.to(`region:${cctv.region_id.name}`).emit('stream_update', {
            type: 'stream_update',
            data: {
              cctvId: cctvId.toString(),
              cctvName: cctv.name,
              streamUrl: `/api/stream/hls/${cctvId}/index.m3u8`,
              status: 'active',
              region: cctv.region_id.name,
              timestamp: new Date()
            }
          });
          
          console.log(`지역 ${cctv.region_id.name}에 스트림 업데이트 이벤트 전송됨`);
          
          // 관리자에게도 전송
          global.io.to('role:admin').emit('stream_update', {
            type: 'stream_update',
            data: {
              cctvId: cctvId.toString(),
              cctvName: cctv.name,
              streamUrl: `/api/stream/hls/${cctvId}/index.m3u8`,
              status: 'active',
              region: cctv.region_id.name,
              timestamp: new Date()
            }
          });
          
          console.log('관리자에게 스트림 업데이트 이벤트 전송됨');
          
          // // 모든 클라이언트에게 브로드캐스트 (디버깅용)
          // global.io.emit('stream_update', {
          //   type: 'stream_update',
          //   data: {
          //     cctvId: cctvId.toString(),
          //     cctvName: cctv.name,
          //     streamUrl: `/api/stream/hls/${cctvId}/index.m3u8`,
          //     status: 'active',
          //     region: cctv.region_id.name,
          //     timestamp: new Date()
          //   }
          // });
          
          // console.log('모든 클라이언트에게 스트림 업데이트 이벤트 전송됨 (디버깅용)');
        } else {
          console.error('Socket.IO 인스턴스를 찾을 수 없음. 이벤트를 전송할 수 없습니다.');
        }
      } else {
        console.error(`CCTV 또는 지역 정보가 없음 (CCTV ID: ${cctvId})`);
      }
    } catch (socketErr) {
      console.error('스트림 업데이트 이벤트 전송 중 오류:', socketErr);
    }
    
    return result;
  } catch (err) {
    console.error(`스트림 시작 오류 (CCTV ID: ${cctvId}):`, err);
    throw err;
  }
};

// 스트림 중지
const stopStream = async (cctvId) => {
  try {
    // 스트림 중지 전에 CCTV 정보 가져오기
    const cctv = await CCTV.findById(cctvId).populate('region_id');
    
    if (!cctv) {
      throw new Error(`CCTV 정보를 찾을 수 없음 (ID: ${cctvId})`);
    }
    
    console.log(`스트림 중지 시작 (CCTV: ${cctv.name}, ID: ${cctvId})`);
    
    // 스트림 중지
    const result = videoStream.stopHlsStream(cctvId);
    
    console.log(`스트림 중지 결과:`, result);
    
    // 스트림 상태 업데이트 (WebSocket을 통해 알림)
    try {
      if (cctv.region_id) {
        console.log(`스트림 업데이트 이벤트 전송 준비 (CCTV: ${cctv.name}, 지역: ${cctv.region_id.name})`);
        
        // Socket.IO가 전역 변수로 설정되어 있는지 확인
        if (global.io) {
          console.log('Socket.IO 인스턴스 찾음, 이벤트 전송 시도...');
          
          // 특정 지역 방에 이벤트 전송
          global.io.to(`region:${cctv.region_id.name}`).emit('stream_update', {
            type: 'stream_update',
            data: {
              cctvId: cctvId.toString(),
              cctvName: cctv.name,
              status: 'inactive',
              region: cctv.region_id.name,
              timestamp: new Date()
            }
          });
          
          console.log(`지역 ${cctv.region_id.name}에 스트림 중지 이벤트 전송됨`);
          
          // 관리자에게도 전송
          global.io.to('role:admin').emit('stream_update', {
            type: 'stream_update',
            data: {
              cctvId: cctvId.toString(),
              cctvName: cctv.name,
              status: 'inactive',
              region: cctv.region_id.name,
              timestamp: new Date()
            }
          });
          
          console.log('관리자에게 스트림 중지 이벤트 전송됨');
          
          // // 모든 클라이언트에게 브로드캐스트 (디버깅용)
          // global.io.emit('stream_update', {
          //   type: 'stream_update',
          //   data: {
          //     cctvId: cctvId.toString(),
          //     cctvName: cctv.name,
          //     status: 'inactive',
          //     region: cctv.region_id.name,
          //     timestamp: new Date()
          //   }
          // });
          
          // console.log('모든 클라이언트에게 스트림 중지 이벤트 전송됨 (디버깅용)');
        } else {
          console.error('Socket.IO 인스턴스를 찾을 수 없음. 이벤트를 전송할 수 없습니다.');
        }
      } else {
        console.error(`CCTV의 지역 정보가 없음 (CCTV ID: ${cctvId})`);
      }
    } catch (socketErr) {
      console.error('스트림 업데이트 이벤트 전송 중 오류:', socketErr);
    }
    
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