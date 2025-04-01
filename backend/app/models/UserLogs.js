'use strict';

var mongoose = require('mongoose'), 
	Schema = mongoose.Schema;  

var moment = require('moment');

var UserLogs = new Schema({  
    
		created: {
			type: new Date()
			
		},
		event: {
			type: String
		},
		IPAddress: {
			type: String
		},
		ID : {
			type: String
		}
		
	});


mongoose.model('UserLogs', UserLogs);  



