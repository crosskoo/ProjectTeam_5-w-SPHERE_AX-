const express = require('express') 
    , fileUpload = require('express-fileupload')
    , morgan = require('morgan')
    , compress = require('compression')
    , bodyParser = require('body-parser')
    , methodOverride = require('method-override') 
    , passport = require('passport') 
    , APIroutesConfig = require('./routes_config')
    , http = require('http')
    , socketio = require('socket.io')
    , path = require('path')
    , fs = require('fs')


module.exports = function(){
  var app = express()  
    , server = http.createServer(app)
    , io = socketio(server, { 
        'destroy buffer size': Infinity, 
        pingTimeout: 600000, 
        pingInterval: 300000, 
        upgradeTimeout: 30000,
        cors: {
          origin: '*',  // 소켓 통신 크로스도메인 허용
        }
      });
    
  var UserApiRoutes = express.Router();
    
  app.use(morgan('dev'));
  app.use(compress()); 
  app.use(bodyParser.urlencoded({limit:"50mb", extended: false}));
  app.use(bodyParser.json({limit:"50mb"}));
  app.use(methodOverride());
  app.use(fileUpload({
    useTempFiles : true,
    tempFileDir : 'tmp/', 
    createParentPath: true
  }));
    
  // CORS 설정 추가
  app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
      
    // preflight 요청 처리
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }
      
    next();
  });
    
  app.use(express.static('./public'));
    
  // 필요한 디렉토리 생성
  const createRequiredDirectories = () => {
    const dirs = [
      path.join(__dirname, '../public/uploads/events'),
      path.join(__dirname, '../public/streams')
    ];
      
    dirs.forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        console.log(`디렉토리 생성됨: ${dir}`);
      }
    });
  };
    
  createRequiredDirectories();
    
  // API 라우트
  app.use('/api', UserApiRoutes);
    
  UserApiRoutes.use(APIroutesConfig.userapi);
    
  // 경로 설정
  require('../app/routes/auth.api.routes')(app, UserApiRoutes);
  require('../app/routes/user.api.routes')(app, UserApiRoutes);
  require('../app/routes/region.api.routes')(app, UserApiRoutes);
  require('../app/routes/cctv.api.routes')(app, UserApiRoutes);
  require('../app/routes/event.api.routes')(app, UserApiRoutes);
  require('../app/routes/stream.api.routes')(app, UserApiRoutes);
  require('../app/routes/cctv_block.api.routes')(app, UserApiRoutes);
  
  // 카카오 알림 라우트 추가
  require('../app/routes/kakao.api.routes')(app, UserApiRoutes);
    
  // 소켓 설정
  require('./socketio')(io);

  return server;  
}