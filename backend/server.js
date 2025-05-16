process.env.NODE_ENV = process.env.NODE_ENV || 'production';
var express = require('./config/express_config')
  , mongoose = require('./config/mongoose_config');

// MongoDB 연결 설정
mongoose();

var app = express()
  , port = process.env.PORT || 10111;

global.socketSalt = '';
// global.socketCli = require('socket.io-client')('http://localhost:' + port, {secure: true, rejectUnauthorized: false})
global.socketCli = require('socket.io-client')('http://localhost:' + port)

app.listen(port, function (err) {
  if (!err) {
    console.log("Server start");
    socketCli.on('connect', function (err) {
      if (err) {
        console.log("Server open err");
      } else {
        console.log("Server running at http://localhost:" + port);
        
        // 모든 활성 CCTV 스트림 초기화
        setTimeout(() => {
          try {
            const streamManager = require('./app/services/stream_manager');
            streamManager.initializeAllStreams()
              .then(() => console.log("All streams initialized"))
              .catch(err => console.error("Stream initialization error:", err));
          } catch (e) {
            console.error("Failed to initialize streams:", e);
          }
        }, 5000); // 서버 시작 후 5초 대기 (데이터베이스 연결 확인을 위해)
      }
    })
  } else {
    console.log("Server open err");
  }
});