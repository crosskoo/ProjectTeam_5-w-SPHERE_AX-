const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const crypto = require('crypto');

// 스트림 프로세스 관리를 위한 맵
const streamProcesses = new Map();

// 스트림 상태 관리를 위한 맵
const streamStatus = new Map();

// HLS 스트림 디렉토리 생성
const createHlsDirectory = (cctvId) => {
  const cctvIdStr = cctvId.toString();
  const hlsDir = path.join(__dirname, '../public/streams', cctvIdStr);
  
  if (!fs.existsSync(hlsDir)) {
    fs.mkdirSync(hlsDir, { recursive: true });
  }
  
  return hlsDir;
};

// RTSP 스트림을 HLS로 변환
const convertRtspToHls = (rtspUrl, cctvId) => {
  return new Promise((resolve, reject) => {
    // 이미 실행 중인 프로세스가 있는지 확인
    if (streamProcesses.has(cctvId)) {
      return resolve({
        cctvId,
        status: 'already_running',
        message: '이미 실행 중인 스트림이 있습니다.'
      });
    }
    
    // 가짜 URL 체크 - 재시작 하지 않음
    if (rtspUrl.includes('example.com')) {
      return reject(new Error('테스트 URL은 사용할 수 없습니다.'));
    }
    
    // HLS 디렉토리 생성
    const hlsDir = createHlsDirectory(cctvId);
    
    // FFmpeg 명령어 구성 (MediaMTX 최적화)
    const ffmpegArgs = [
      '-rtsp_transport', 'tcp',
      '-i', rtspUrl,
      '-c:v', 'copy',                  // 비디오 복사 (재인코딩 없음)
      '-an',                           // 오디오 제거
      '-f', 'hls',
      '-hls_time', '6',
      '-hls_list_size', '5',
      '-hls_flags', 'delete_segments+append_list',
      '-hls_segment_filename', path.join(hlsDir, '%d.ts'),
      path.join(hlsDir, 'index.m3u8')
    ];
    
    console.log(`FFmpeg 시작: CCTV ID ${cctvId}`);
    
    // FFmpeg 프로세스 실행
    const ffmpegProcess = spawn('ffmpeg', ffmpegArgs);
    
    const processId = crypto.randomBytes(4).toString('hex');
    
    // 프로세스 맵에 추가
    streamProcesses.set(cctvId, {
      process: ffmpegProcess,
      rtspUrl,
      hlsDir,
      processId
    });
    
    // 스트림 상태 업데이트
    streamStatus.set(cctvId, {
      isActive: true,
      startedAt: new Date(),
      hlsUrl: `/api/stream/hls/${cctvId}/index.m3u8`
    });
    
    // 오류 출력 처리
    ffmpegProcess.stderr.on('data', (data) => {
      const output = data.toString();
      
      // 연결 오류 체크
      if (output.includes('Cannot assign requested address') ||
          output.includes('Connection refused') ||
          output.includes('Network is unreachable')) {
        console.error(`[${processId}] 연결 불가: ${rtspUrl}`);
      }
    });
    
    // 프로세스 종료 처리
    ffmpegProcess.on('close', (code) => {
      console.log(`[${processId}] FFmpeg 종료 (코드: ${code})`);
      streamProcesses.delete(cctvId);
      
      if (code !== 0) {
        streamStatus.set(cctvId, { isActive: false, failed: true });
      } else {
        streamStatus.set(cctvId, { isActive: false });
      }
    });
    
    ffmpegProcess.on('error', (err) => {
      console.error(`[${processId}] FFmpeg 오류:`, err);
      streamProcesses.delete(cctvId);
      streamStatus.set(cctvId, { isActive: false });
      reject(err);
    });
    
    // HLS 파일 생성 확인 (15초)
    setTimeout(() => {
      const indexFile = path.join(hlsDir, 'index.m3u8');
      
      if (fs.existsSync(indexFile)) {
        const content = fs.readFileSync(indexFile, 'utf8');
        if (content.includes('#EXTM3U')) {
          console.log(`[${processId}] HLS 생성 성공`);
          resolve({
            cctvId,
            status: 'started',
            hlsUrl: `/api/stream/hls/${cctvId}/index.m3u8`,
            processId
          });
        } else {
          reject(new Error('무효한 HLS 플레이리스트'));
        }
      } else {
        console.error(`[${processId}] HLS 파일 생성 실패`);
        reject(new Error('HLS 파일 생성 실패'));
      }
    }, 15000);
  });
};

// HLS 스트림 중지
const stopHlsStream = (cctvId) => {
  console.log(`스트림 중지: CCTV ID ${cctvId}`);
  
  if (streamProcesses.has(cctvId)) {
    const { process, processId } = streamProcesses.get(cctvId);
    console.log(`[${processId}] 프로세스 종료 중...`);
    
    process.kill('SIGTERM');
    streamProcesses.delete(cctvId);
    streamStatus.set(cctvId, { isActive: false });
    
    return {
      cctvId,
      status: 'stopped',
      message: '스트림이 중지되었습니다.'
    };
  }
  
  return {
    cctvId,
    status: 'not_running',
    message: '실행 중인 스트림이 없습니다.'
  };
};

// 스트림 상태 확인
const getStreamStatus = (cctvId) => {
  return streamStatus.get(cctvId) || { isActive: false };
};

// 모든 스트림 정보 조회
const getAllStreams = () => {
  const streams = [];
  
  for (const [cctvId, status] of streamStatus.entries()) {
    if (status.isActive) {
      streams.push({
        cctvId,
        ...status
      });
    }
  }
  
  return streams;
};

module.exports = {
  convertRtspToHls,
  stopHlsStream,
  getStreamStatus,
  getAllStreams
};