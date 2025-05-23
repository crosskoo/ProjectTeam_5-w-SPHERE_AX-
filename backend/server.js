process.env.NODE_ENV = process.env.NODE_ENV || 'production';
var express = require('./config/express_config')
  , mongoose = require('./config/mongoose_config');

// MongoDB 연결 설정
mongoose();

var app = express()
  , port = process.env.PORT || 10111;

// 소켓 관련 전역 변수
global.socketSalt = '';
global.socketCli = require('socket.io-client')('http://localhost:' + port);

// 서버 시작
app.listen(port, function (err) {
  if (!err) {
    console.log("서버 시작");
    
    socketCli.on('connect', function (err) {
      if (err) {
        console.log("서버 시작 오류:", err);
      } else {
        console.log("서버가 http://localhost:" + port + "에서 실행 중입니다.");
        
        // 모든 활성 CCTV 스트림 초기화
        setTimeout(() => {
          try {
            const streamManager = require('./app/services/stream_manager');
            streamManager.initializeAllStreams()
              .then(() => console.log("모든 스트림이 초기화되었습니다."))
              .catch(err => console.error("스트림 초기화 오류:", err));
          } catch (e) {
            console.error("스트림 초기화 실패:", e);
          }
        }, 5000); // 서버 시작 후 5초 대기 (데이터베이스 연결 확인을 위해)
      }
    });
    
    
  } else {
    console.log("서버 시작 오류:", err);
  }
});