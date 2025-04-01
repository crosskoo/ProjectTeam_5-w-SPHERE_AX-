var config = require('./node_config')
  , jwt = require('jsonwebtoken'); 
 
 
exports.userapi = function(req, res, next){ 

    var token = req.body.token || req.query.token || req.headers['x-access-token'];
    if (token) {
            jwt.verify(token, config.UsertokenSecret, function(err, decoded) {			
            if (err) {  
                console.log("user api token decode err");              
                return res.status(401).end("user api token decode err");     
            } else {  
                req.decoded = decoded;
                var timestamp_exp = req.decoded.exp * 1000;
                var timestamp_iat = req.decoded.iat * 1000;
                var exp = new Date(timestamp_exp);
                var iat = new Date(timestamp_iat);
                //console.log('exp: ' + exp)
                //console.log('iat: ' + iat)
                next(); 
            }
        });

    } else {  
        console.log("user api token not found");
        return res.status(403).end("user api token not found");
    }
        
}
    

