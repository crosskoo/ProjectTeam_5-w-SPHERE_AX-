var config = require('./node_config'), 
    mongoose = require('mongoose');
    
module.exports = function(){
    
    var db = mongoose.connect(config.db, {useNewUrlParser : true, useUnifiedTopology: true}); 
    console.log("MongoDB ver: " + mongoose.version);	      
    mongoose.set('useCreateIndex', true); 
    
    // 모델 로드
    require('../app/models/UserInfo.js');
    require('../app/models/UserLogs.js');
    require('../app/models/UserRegion.js');
    require('../app/models/RefreshToken.js');
    require('../app/models/Region.js');
    require('../app/models/CCTV.js');
    require('../app/models/Event.js');
    
    return db;
}