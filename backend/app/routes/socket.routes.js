const jwt = require('jsonwebtoken');
const config = require('../../config/node_config');
const socketController = require('../controllers/socketio.controller');

module.exports = function(io) {
  // 소켓 인증 미들웨어
  io.use((socket, next) => {
    // 핸드셰이크 쿼리에서 토큰 가져오기
    const token = socket.handshake.auth.token || socket.handshake.query.token;

    // AI 서버 연결 확인 - 토큰 검증 없이 클라이언트 타입만 확인
    if (socket.handshake.query.client === 'ai-server') {
      socket.clientType = 'ai-server';
      console.log('AI 서버 연결 감지됨');
      return next();
    }

    // 토큰이 없는 경우 인증 없이 연결 허용 (일부 기능에만 접근 가능)
    if (!token) {
      socket.authenticated = false;
      return next();
    }

    // 일반 사용자 토큰 검증
    jwt.verify(token, config.UsertokenSecret, (err, decoded) => {
      if (err) {
        socket.authenticated = false;
        return next(new Error('인증 실패'));
      }

      socket.authenticated = true;
      socket.userId = decoded.id;
      socket.userRole = decoded.role;
      socket.userName = decoded.ID;

      if (decoded.role === 'admin') {
        socket.join('role:admin');
      }

      next();
    });
  });

  // 연결 이벤트 처리
  io.on('connection', (socket) => {
    const address = socket.handshake.address;
    const ip = address.split(':').pop();
    const time = new Date().toISOString();
    
    console.log(`새 소켓 연결: ${ip} (ID: ${socket.id}) ${time}`);
    
    // 인증 상태 확인
    if (socket.authenticated) {
      console.log(`인증된 사용자: ${socket.userName} (역할: ${socket.userRole})`);
    } else if (socket.clientType === 'ai-server') {
      console.log('AI 서버 연결 확인됨');
      socket.join('ai-server');
    } else {
      console.log('미인증 연결: 인증 대기 중');
    }

    // 소켓 컨트롤러에 소켓 전달
    socketController(io, socket);
  });
};