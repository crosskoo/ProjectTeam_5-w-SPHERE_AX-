'use strict';

var mongoose = require('mongoose'), 
    Schema = mongoose.Schema;  

var UserLogsSchema = new Schema({  
    created: {
        type: Date,
        default: Date.now
    },
    event: {
        type: String,
        required: true,
        enum: [
            '사용자 접속(로그인)', 
            '사용자 접속(로그인 실패)', 
            '로그아웃', 
            '프로필 수정', 
            '계정 생성', 
            '계정 삭제'
        ]
    },
    IPAddress: {
        type: String
    },
    user_id: {
        type: String,
        required: true,
        ref: 'UserInfo'
    },
    details: {
        type: String
    }
});

// 사용자별 로그 검색을 위한 인덱스
UserLogsSchema.index({ user_id: 1 });
// 시간순 로그 검색을 위한 인덱스
UserLogsSchema.index({ created: -1 });
// 이벤트 타입별 로그 검색을 위한 인덱스
UserLogsSchema.index({ event: 1 });

mongoose.model('UserLogs', UserLogsSchema);