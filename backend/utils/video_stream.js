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
  // ObjectID를 문자열로 변환
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
    
    // HLS 디렉토리 생성
    const hlsDir = createHlsDirectory(cctvId);
    
    // FFmpeg 명령어 구성
    // HLS 세그먼트 길이는 2초, 세그먼트 목록 크기는 10개로 설정
    const ffmpegArgs = [
      '-i', rtspUrl,
      '-c:v', 'libx264',         // H.264 비디오 코덱
      '-preset', 'ultrafast',    // 인코딩 속도 (화질과 trade-off)
      '-tune', 'zerolatency',    // 낮은 지연을 위한 설정
      '-b:v', '800k',            // 비디오 비트레이트
      '-maxrate', '1000k',       // 최대 비트레이트
      '-bufsize', '2000k',       // 버퍼 크기
      '-g', '30',                // GOP 크기 (키프레임 간격)
      '-keyint_min', '30',       // 최소 키프레임 간격
      '-sc_threshold', '0',      // 장면 변경 임계값 (0 = 비활성화)
      '-c:a', 'aac',             // AAC 오디오 코덱
      '-b:a', '128k',            // 오디오 비트레이트
      '-ac', '2',                // 오디오 채널 수
      '-ar', '44100',            // 오디오 샘플링 레이트
      '-f', 'hls',               // HLS 포맷
      '-hls_time', '2',          // 세그먼트 길이 (초)
      '-hls_list_size', '10',    // 플레이리스트에 유지할 세그먼트 수 
      '-hls_flags', 'delete_segments+append_list',  // 세그먼트 관리 옵션
      '-hls_segment_type', 'mpegts',  // 세그먼트 타입
      '-hls_init_time', '1',     // 초기 세그먼트 길이
      '-hls_segment_filename', path.join(hlsDir, '%d.ts'),  // 세그먼트 파일명 형식
      path.join(hlsDir, 'index.m3u8')  // 마스터 플레이리스트 경로
    ];
    
    // FFmpeg 프로세스 실행
    const ffmpegProcess = spawn('ffmpeg', ffmpegArgs, { shell: true });
    
    // 로그 메시지를 위한 고유 ID
    const processId = crypto.randomBytes(4).toString('hex');
    console.log(`[${processId}] RTSP → HLS 변환 시작 (CCTV ID: ${cctvId})`);
    
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
    
    // 표준 출력 로깅
    ffmpegProcess.stdout.on('data', (data) => {
      console.log(`[${processId}] FFmpeg stdout: ${data}`);
    });
    
    // 표준 에러 로깅
    ffmpegProcess.stderr.on('data', (data) => {
      console.log(`[${processId}] FFmpeg stderr: ${data}`);
    });
    
    // 프로세스 종료 처리
    ffmpegProcess.on('close', (code) => {
      console.log(`[${processId}] FFmpeg 프로세스 종료 (코드: ${code})`);
      
      // 비정상 종료인 경우 처리
      if (code !== 0 && streamProcesses.has(cctvId)) {
        streamProcesses.delete(cctvId);
        streamStatus.set(cctvId, { isActive: false });
      }
    });
    
    // 에러 처리
    ffmpegProcess.on('error', (err) => {
      console.error(`[${processId}] FFmpeg 프로세스 오류:`, err);
      streamProcesses.delete(cctvId);
      streamStatus.set(cctvId, { isActive: false });
      reject(err);
    });
    
    // HLS 인덱스 파일 생성 확인을 위한 타임아웃
    setTimeout(() => {
      const indexFile = path.join(hlsDir, 'index.m3u8');
      
      if (fs.existsSync(indexFile)) {
        console.log(`[${processId}] HLS 인덱스 파일 생성 확인 (CCTV ID: ${cctvId})`);
        resolve({
          cctvId,
          status: 'started',
          hlsUrl: `/api/stream/hls/${cctvId}/index.m3u8`
        });
      } else {
        // 인덱스 파일이 생성되지 않은 경우
        console.error(`[${processId}] HLS 인덱스 파일 생성 실패 (CCTV ID: ${cctvId})`);
        console.error(`파일이 생성되어야 할 경로: ${indexFile}`);
        console.error(`디렉토리 내용: ${fs.existsSync(hlsDir) ? fs.readdirSync(hlsDir).join(', ') : '디렉토리 없음'}`);
        
        // 프로세스 종료
        if (streamProcesses.has(cctvId)) {
          const { process } = streamProcesses.get(cctvId);
          process.kill();
          streamProcesses.delete(cctvId);
        }
        
        streamStatus.set(cctvId, { isActive: false });
        reject(new Error('HLS 인덱스 파일 생성에 실패했습니다.'));
      }
    }, 15000); // 15초 내에 index.m3u8 파일이 생성되어야 함 (시간 증가)
  });
};

// HLS 스트림 중지
const stopHlsStream = (cctvId) => {
  if (streamProcesses.has(cctvId)) {
    const { process, processId } = streamProcesses.get(cctvId);
    console.log(`[${processId}] HLS 스트림 중지 (CCTV ID: ${cctvId})`);
    
    // 프로세스 종료
    process.kill();
    streamProcesses.delete(cctvId);
    
    // 상태 업데이트
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