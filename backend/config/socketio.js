'use strict';

module.exports = function(io) {
  // 최대 리스너 설정
  io.sockets.setMaxListeners(0);
  
  // global.io 설정 (다른 모듈에서 사용 가능)
  global.io = io;
  
  // 소켓 라우트 설정
  require('../app/routes/socket.routes')(io);
  
  // 클라이언트에게 서버 시간 전송 (핑-퐁 및 연결 확인용)
  setInterval(() => {
    io.emit('server_time', { time: new Date().toISOString() });
  }, 60000); // 1분마다
  
  console.log('소켓 서버가 초기화되었습니다.');
};