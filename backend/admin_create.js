// 관리자 계정 생성 스크립트
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

const mongoose = require('mongoose');
const crypto = require('crypto');
const config = require('./config/node_config');

// MongoDB 연결
mongoose.connect(config.db, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  }).then(() => {
    console.log('MongoDB 연결 성공');
  }).catch(err => {
    console.error('MongoDB 연결 오류:', err);
    process.exit(1);
  });

// UserInfo.js 모델과 동일한 스키마
const UserSchema = new mongoose.Schema({  
  ID: {
    type: String,
    unique: true,
    required: true,
    trim: true
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

// 비밀번호 해싱 메서드
UserSchema.methods.hashPassword = function(password) {
  return crypto.createHash('sha512').update(password + this.salt).digest('hex');
};

// 저장 전 비밀번호 해싱
UserSchema.pre('save', function(next) {  
  if (this.PASSWORD) { 
      this.salt = crypto.randomBytes(128).toString('base64');
      this.PASSWORD = this.hashPassword(this.PASSWORD);
  }
  next();
});

// 모델 정의
const UserInfo = mongoose.model('UserInfo', UserSchema);

async function createAdminUser() {
  try {
    // 이미 admin 계정이 있는지 확인
    const existingAdmin = await UserInfo.findOne({ ID: 'admin' });
    
    if (existingAdmin) {
      console.log('이미 admin 계정이 존재합니다.');
      return;
    } else {
      const adminUser = new UserInfo({
        ID: 'admin',
        PASSWORD: 'admin123',
        name: '관리자',
        role: 'admin'
      });
      
      await adminUser.save();
      console.log('관리자 계정이 성공적으로 생성되었습니다.');
      console.log('ID: admin');
      console.log('Password: admin123');
    }
  } catch (err) {
    console.error('관리자 계정 생성 중 오류 발생:', err);
  } finally {

    mongoose.connection.close();
    console.log('MongoDB 연결 종료');
  }
}

createAdminUser();