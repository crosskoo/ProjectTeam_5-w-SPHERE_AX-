var config = require('./node_config')
  , jwt = require('jsonwebtoken'); 
 
// 인증이 필요 없는 경로 목록
const PUBLIC_PATHS = [
  '/auth/login',
  '/auth/refresh',
  '/auth/kakao/callback'
];
 
exports.userapi = function(req, res, next) { 
    console.log("현재 요청 경로:", req.path);
    
    // 공개 API 경로는 토큰 검증 없이 통과
    if (PUBLIC_PATHS.some(path => req.path === path || req.path.endsWith(path))) {
        return next();
    }

    // 요청 헤더에서 토큰 확인
    // 1. 표준 Bearer 토큰 (Authorization 헤더)
    // 2. x-access-token 헤더
    // 3. body나 query의 token 필드
    var authHeader = req.headers.authorization;
    var token = null;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
    } else {
        token = req.headers['x-access-token'] || req.body.token || req.query.token;
    }

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