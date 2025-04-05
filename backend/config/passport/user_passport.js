var passport = require('passport'),
	mongoose = require('mongoose');
	
module.exports = function(){
	var UserInfo = mongoose.model('UserInfo');
	
	passport.serializeUser(function(userinfo, done){
		done(null, userinfo.id);
	});
	
	passport.deserializeUser(function(id, done){
		UserInfo.findOne({_id: id}, '-PASSWORD -salt', function(err, userinfo){
		done(err, userinfo);	
		});
	});	
	
	require('./strategies/user.js')();
};
