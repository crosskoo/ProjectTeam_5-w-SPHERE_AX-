var passport = require('passport'),
	LocalStrategy = require('passport-local').Strategy,
	UserInfo = require('mongoose').model('UserInfo'),
	UserLogs = require('mongoose').model('UserLogs'),
	CryptoJs = require('crypto-js');

module.exports = function () {
	function getUserIP(req) {

		var ipAddress;
		var ip;
		if (!!req.hasOwnProperty('sessionID')) {
			ipAddress = req.headers['x-forwarded-for'];

		} else {
			if (!ipAddress) {
				var forwardeIpsStr = req.header('x-forwarded-for');
				if (forwardeIpsStr) {
					var forwardedIps = forwardeIpsStr.split(',');
					ipAddress = forwardedIps[0];
				}
				if (!ipAddress) {
					ipAddress = req.connection.remoteAddress;
				}
			}
		}

		ip = ipAddress.split(':');
		//return ipAddress;
		return ip[3];
	}

	passport.use('user-local', new LocalStrategy({
		usernameField: 'ID',
		passwordField: 'PASSWORD',
		passReqToCallback: true
	},

		function (req, ID, PASSWORD, done) {
			/* 패스 비번 평문 전송 방지 */
			var passbytes = CryptoJs.AES.decrypt(PASSWORD, socketSalt)
			var idbytes = CryptoJs.AES.decrypt(ID, foldersrc)
			ID = idbytes.toString(CryptoJs.enc.Utf8)
			PASSWORD = passbytes.toString(CryptoJs.enc.Utf8)


			UserInfo.findOne({ ID: ID }, function (err, userinfo) {
				if (err) {
					console.log(err);
					return done(err);
				}
				if (!userinfo) {
					console.log('Unknown user');
					var userlogs = new UserLogs();
					userlogs.event = '사용자 접속(로그인 실패)';
					userlogs.IPAddress = getUserIP(req);
					userlogs.ID = ID
					userlogs.save(function (err, userlog) {
						if (err) console.log(err);
						else {
							console.log(userlog)
						}
					})
					return done(null, false, {
						message: 'Unknown user'
					});
				}
				if (!userinfo.authenticate(PASSWORD)) {
					console.log('Invalid password');
					var userlogs = new UserLogs();
					userlogs.event = '사용자 접속(로그인 실패)';
					userlogs.IPAddress = getUserIP(req);
					userlogs.ID = ID
					userlogs.save(function (err, userlog) {
						if (err) console.log(err);
						else {
							console.log(userlog)
						}
					})
					return done(null, false, {
						message: 'Invalid password'
					});
				}
				
				socketSalt = "";
				return done(null, userinfo);
			});
		}));
};