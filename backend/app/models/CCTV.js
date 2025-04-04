'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var CCTVSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    streamUrl: {
        type: String,
        required: true
    },
    location: {
        lat: {
            type: Number,
            required: true
        },
        lng: {
            type: Number,
            required: true
        }
    },
    region_id: {
        type: Schema.Types.ObjectId,
        ref: 'Region',
        required: true
    },
    status: {
        type: String,
        enum: ['active', 'inactive', 'maintenance'],
        default: 'active'
    },
    created: {
        type: Date,
        default: Date.now
    },
    lastUpdated: {
        type: Date,
        default: Date.now
    }
});

// 지역별 CCTV 검색을 위한 인덱스
CCTVSchema.index({ region_id: 1 });
// 상태별 CCTV 검색을 위한 인덱스
CCTVSchema.index({ status: 1 });
// 지역 및 상태별 CCTV 검색을 위한 인덱스
CCTVSchema.index({ region_id: 1, status: 1 });

// CCTV 업데이트 전 lastUpdated 필드 갱신
CCTVSchema.pre('findOneAndUpdate', function(next) {
    this.set({ lastUpdated: new Date() });
    next();
});

mongoose.model('CCTV', CCTVSchema);