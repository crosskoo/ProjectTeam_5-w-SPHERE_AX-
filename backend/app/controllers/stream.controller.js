const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');
const CCTV = mongoose.model('CCTV');
const streamManager = require('../services/stream_manager');

// HLS 스트림 제공
exports.getHlsStream = async (req, res) => {
  try {
    const cctvId = req.params.cctvId;
    const playlistName = req.params.playlist;
    
    console.log(`HLS 스트림 요청: CCTV ID=${cctvId}, 파일=${playlistName}`);
    
    // CCTV 존재 확인
    const cctv = await CCTV.findById(cctvId);
    if (!cctv) {
      console.log(`CCTV를 찾을 수 없음: ${cctvId}`);
      return res.status(404).json({
        status: 'error',
        message: 'CCTV를 찾을 수 없습니다.'
      });
    }
    
    // 사용자 권한 확인 - 관리자가 아닌 경우 지역 접근 권한 확인
    if (req.decoded.role !== 'admin') {
      // 사용자의 지역 정보 가져오기
      const UserRegion = mongoose.model('UserRegion');
      const userRegions = await UserRegion.find({ user_id: req.decoded.id });
      
      // 사용자가 접근 가능한 지역 ID 목록
      const allowedRegionIds = userRegions.map(ur => ur.region_id.toString());
      
      // CCTV가 사용자의 지역에 속하는지 확인
      if (!allowedRegionIds.includes(cctv.region_id.toString())) {
        console.log(`지역 접근 권한 없음: 사용자=${req.decoded.id}, CCTV 지역=${cctv.region_id}`);
        return res.status(403).json({
          status: 'error',
          message: '이 CCTV 스트림에 접근할 권한이 없습니다.'
        });
      }
    }
    
    // HLS 스트림 폴더 경로
    const cctvIdStr = cctvId.toString();
    const hlsDir = path.join(__dirname, '../../public/streams', cctvIdStr);
    console.log(`HLS 디렉토리 경로: ${hlsDir}`);
    
    // 요청된 파일 경로
    let filePath;
    
    if (playlistName === 'index.m3u8' || playlistName === 'index') {
      // 마스터 플레이리스트 (index.m3u8)
      filePath = path.join(hlsDir, 'index.m3u8');
      console.log(`요청 타입: 마스터 플레이리스트, 경로: ${filePath}`);
    } else if (playlistName.endsWith('.ts')) {
      // TS 세그먼트 파일
      filePath = path.join(hlsDir, playlistName);
      console.log(`요청 타입: TS 세그먼트, 경로: ${filePath}`);
    } else {
      // 세그먼트 플레이리스트 (다른 .m3u8 파일)
      filePath = path.join(hlsDir, playlistName);
      if (!filePath.endsWith('.m3u8')) {
        filePath += '.m3u8';
      }
      console.log(`요청 타입: 세그먼트 플레이리스트, 경로: ${filePath}`);
    }
    
    console.log(`요청 파일 경로: ${filePath}`);
    
    // 디렉토리 존재 여부 확인
    if (!fs.existsSync(hlsDir)) {
      console.log(`HLS 디렉토리가 존재하지 않음: ${hlsDir}`);
      fs.mkdirSync(hlsDir, { recursive: true });
      console.log(`HLS 디렉토리 생성됨: ${hlsDir}`);
    }
    
    // 파일 존재 여부 확인
    const fileExists = fs.existsSync(filePath);
    console.log(`파일 존재 여부: ${fileExists ? '있음' : '없음'}`);
    
    if (!fileExists) {
      // 스트림이 아직 시작되지 않았거나 요청된 파일이 없는 경우
      // 스트림 시작 시도
      try {
        console.log(`스트림 활성화 시도: ${cctvId}`);
        await streamManager.ensureStreamActive(cctv._id, cctv.streamUrl);
        
        // 스트림 시작 후 약간의 지연 (파일 생성 대기)
        console.log('스트림 시작 후 파일 생성 대기 중...');
        await new Promise(resolve => setTimeout(resolve, 5000)); 
        
        // 파일 다시 확인
        if (!fs.existsSync(filePath)) {
          console.log(`파일이 여전히 존재하지 않음: ${filePath}`);
          
          // 라이브 스트림이므로, 파일이 없더라도 대기해야 할 수 있음
          // 브라우저에게 스트림이 준비 중임을 알리는 응답 보내기
          if (filePath.endsWith('.m3u8')) {
            console.log('빈 m3u8 플레이리스트 생성 후 응답');
            // 빈 HLS 플레이리스트 생성
            const emptyPlaylist = `#EXTM3U
#EXT-X-VERSION:3
#EXT-X-TARGETDURATION:2
#EXT-X-MEDIA-SEQUENCE:0
`;
            fs.writeFileSync(filePath, emptyPlaylist);
            
            res.setHeader('Content-Type', 'application/vnd.apple.mpegurl');
            res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
            res.setHeader('Pragma', 'no-cache');
            res.setHeader('Expires', '0');
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
            
            console.log('초기 빈 플레이리스트 응답 전송');
            return res.send(emptyPlaylist);
          } else {
            return res.status(404).json({
              status: 'error',
              message: '스트림 파일을 찾을 수 없습니다.'
            });
          }
        } else {
          console.log(`파일 생성 확인됨: ${filePath}`);
        }
      } catch (err) {
        console.error(`스트림 시작 오류 (CCTV ID: ${cctvId}):`, err);
        return res.status(500).json({
          status: 'error',
          message: '스트림을 시작할 수 없습니다.'
        });
      }
    }
    
    // 적절한 콘텐츠 타입 설정
    let contentType;
    if (filePath.endsWith('.m3u8')) {
      contentType = 'application/vnd.apple.mpegurl';
      // HLS 플레이리스트는 캐싱하지 않도록 설정
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
    } else if (filePath.endsWith('.ts')) {
      contentType = 'video/mp2t';
      // TS 세그먼트는 캐싱 가능
      res.setHeader('Cache-Control', 'public, max-age=86400');
    }
    
    if (contentType) {
      res.setHeader('Content-Type', contentType);
    }
    
    // CORS 헤더 추가 
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    
    console.log(`응답 콘텐츠 타입: ${contentType}`);
    
    // 요청된 파일 스트리밍
    console.log(`파일 스트리밍 시작: ${filePath}`);
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
    
    // 스트림 에러 처리
    fileStream.on('error', (err) => {
      console.error(`파일 스트리밍 오류 (${filePath}):`, err);
      if (!res.headersSent) {
        res.status(500).json({
          status: 'error',
          message: '스트림 파일을 제공할 수 없습니다.'
        });
      }
    });
  } catch (err) {
    console.error('HLS 스트림 제공 에러:', err);
    if (!res.headersSent) {
      res.status(500).json({
        status: 'error',
        message: '서버 오류가 발생했습니다.'
      });
    }
  }
};

// 스트림 관리 API (관리자용)
exports.manageStream = async (req, res) => {
  try {
    // 관리자 권한 확인
    if (req.decoded.role !== 'admin') {
      return res.status(403).json({
        status: 'error',
        message: '관리자만 스트림을 관리할 수 있습니다.'
      });
    }
    
    const { action } = req.body;
    const cctvId = req.params.cctvId;
    
    // CCTV 존재 확인
    const cctv = await CCTV.findById(cctvId);
    if (!cctv) {
      return res.status(404).json({
        status: 'error',
        message: 'CCTV를 찾을 수 없습니다.'
      });
    }
    
    let result;
    
    switch (action) {
      case 'start':
        result = await streamManager.startStream(cctvId, cctv.streamUrl);
        break;
      case 'stop':
        result = await streamManager.stopStream(cctvId);
        break;
      case 'restart':
        await streamManager.stopStream(cctvId);
        result = await streamManager.startStream(cctvId, cctv.streamUrl);
        break;
      default:
        return res.status(400).json({
          status: 'error',
          message: '유효하지 않은 작업입니다. (start, stop, restart 중 하나를 선택하세요)'
        });
    }
    
    res.status(200).json({
      status: 'success',
      message: `스트림 ${action} 작업이 성공적으로 수행되었습니다.`,
      data: result
    });
  } catch (err) {
    console.error('스트림 관리 에러:', err);
    res.status(500).json({
      status: 'error',
      message: '서버 오류가 발생했습니다.'
    });
  }
};

// 스트림 상태 확인
exports.checkStreamStatus = async (req, res) => {
  try {
    const cctvId = req.params.cctvId;
    
    // CCTV 존재 확인
    const cctv = await CCTV.findById(cctvId);
    if (!cctv) {
      return res.status(404).json({
        status: 'error',
        message: 'CCTV를 찾을 수 없습니다.'
      });
    }
    
    const status = streamManager.getStreamStatus(cctvId);
    
    res.status(200).json({
      status: 'success',
      data: {
        cctvId,
        name: cctv.name,
        isActive: status.isActive,
        startedAt: status.startedAt,
        hlsUrl: status.isActive ? `/api/stream/hls/${cctvId}/index.m3u8` : null,
        uptime: status.isActive ? Math.floor((new Date() - status.startedAt) / 1000) : 0
      }
    });
  } catch (err) {
    console.error('스트림 상태 확인 에러:', err);
    res.status(500).json({
      status: 'error',
      message: '서버 오류가 발생했습니다.'
    });
  }
};