'use strict';

var mongoose = require('mongoose'), 
	crypto = require('crypto'),  
	Schema = mongoose.Schema;  

var UserSchema = new Schema({  
    ID: {
		 
		type: String    
		, unique: true  
		, required: true 
		, trim: true 
        , match: [/^[a-zA-Z]{1}[a-zA-Z0-9_]+$/], 
	},
    PASSWORD: {  
		type: String 
        , required: true 
  	},    


  salt: {
		type: String 
  },
   
  created: {
		type: Date, 
        	default: Date.now 
	}
	
});



UserSchema.pre('save', function(next) {  
	
	if (this.PASSWORD) { 
	
		this.salt = crypto.randomBytes(128).toString('base64');
		this.PASSWORD = this.hashPassword(this.PASSWORD);
	  
	}
    	next();
});

UserSchema.methods.hashPassword = function(PASSWORD) {  
	
	return crypto.createHash('sha512').update(PASSWORD + this.salt).digest('hex');
};


UserSchema.methods.authenticate = function(PASSWORD) {  
	return this.PASSWORD === this.hashPassword(PASSWORD);
};

mongoose.model('UserInfo', UserSchema);  




