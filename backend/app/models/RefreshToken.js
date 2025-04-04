'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var RefreshTokenSchema = new Schema({
    token: {
        type: String,
        unique: true,
        required: true
    },
    user_id: {
        type: Schema.Types.ObjectId,
        ref: 'UserInfo',
        required: true
    },
    expiresAt: {
        type: Date,
        required: true
    },
    issuedAt: {
        type: Date,
        default: Date.now
    },
    isRevoked: {
        type: Boolean,
        default: false
    }
});

// 만료된 토큰 쿼리 최적화
RefreshTokenSchema.index({ expiresAt: 1 });
// 사용자별 토큰 검색 최적화
RefreshTokenSchema.index({ user_id: 1 });

// 토큰이 유효한지 확인하는 메서드
RefreshTokenSchema.methods.isValid = function() {
    return !this.isRevoked && this.expiresAt > new Date();
};

mongoose.model('RefreshToken', RefreshTokenSchema);