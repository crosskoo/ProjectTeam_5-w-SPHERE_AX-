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


module.exports = function(){
  var app = express()  
    , server = http.createServer(app)
    , io = socketio(server,  { 'destroy buffer size': Infinity, 
                                pingTimeout: 600000, 
                                pingInterval: 300000, 
                                upgradeTimeout:30000,
                                cors: {
                                  origin: '*',  //소켓 통신 크로스도메인 허용
                                }
      })
    , UserApiRoutes = express.Router();		
    
    app.use(compress()); 
    app.use(bodyParser.urlencoded({limit:"50mb", extended: false}));
    app.use(bodyParser.json({limit:"50mb"}));
    app.use(methodOverride());
    app.use(fileUpload({
      useTempFiles : true,
      tempFileDir : 'tmp/', 
      createParentPath: true
    }));
    app.use(passport.initialize()); 
    app.use(express.static('./public'));
    
    
    
    UserApiRoutes.use(APIroutesConfig.userapi);  
    require('../app/routes/user.api.routes')(app,UserApiRoutes);
    require('./socketio')(io);

   
	  return server;	 
   
}
