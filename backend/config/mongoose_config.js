var config = require('./node_config'), 
	mongoose = require('mongoose');
	
module.exports = function(){
    
    var db = mongoose.connect(config.db, {useNewUrlParser : true, useUnifiedTopology: true}); //DeprecationWarning: current URL string parser is deprecated, and will be removed in a future version. To use the new parser, pass option { useNewUrlParser: true } to MongoClient.connect. ??
    console.log("MongoDB ver: " + mongoose.version);	      
    mongoose.set('useCreateIndex', true); // DeprecationWarning: collection.ensureIndex is deprecated. Use createIndexes instead. ??
    
    //require('../app/models/UserInfo.js');
    //require('../app/models/UserLogs.js');
    
    return db;
}

