'use strict';

var mongoose = require('mongoose'), 
    crypto = require('crypto'),  
    Schema = mongoose.Schema;  

var UserSchema = new Schema({  
    ID: {
        type: String,
        unique: true,
        required: true,
        trim: true,
        match: [/^[a-zA-Z]{1}[a-zA-Z0-9_]+$/]
    },
    PASSWORD: {  
        type: String,
        required: true 
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        trim: true,
        match: [/.+\@.+\..+/]
    },
    phone: {
        type: String,
        trim: true
    },
    role: {
        type: String,
        enum: ['admin', 'user'],
        default: 'user'
    },
    salt: {
        type: String 
    },
    created: {
        type: Date,
        default: Date.now 
    },
    lastLogin: {
        type: Date
    }
});

// 인덱스 추가
UserSchema.index({ ID: 1 });
UserSchema.index({ role: 1 });

UserSchema.pre('save', function(next) {  
    if (this.isNew || this.isModified('PASSWORD')) { 
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

// 사용자 로그인 시 lastLogin 업데이트
UserSchema.methods.updateLastLogin = function() {
    this.lastLogin = new Date();
    return this.save();
};

mongoose.model('UserInfo', UserSchema);