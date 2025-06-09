'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var EventSchema = new Schema({
    timestamp: {
        type: Date,
        required: true,
        default: Date.now
    },
    cctv_id: {
        type: Schema.Types.ObjectId,
        ref: 'CCTV',
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
    confidence: {
        type: Number,
        required: true,
        min: 0,
        max: 1
    },
    imageUrl: {
        type: String
    },
    status: {
        type: String,
        enum: ['new', 'processing', 'confirmed', 'falseAlarm', 'resolved'],
        default: 'new'
    },
    description: {
        type: String
    },
    boundingBox: {
        x: Number,
        y: Number,
        width: Number,
        height: Number
    },
    metadata: {
        type: Schema.Types.Mixed
    },
    notified: {
        type: Boolean,
        default: false,
        required: true
    },
    created: {
        type: Date,
        default: Date.now
    }
});

// 지역별 이벤트 검색을 위한 인덱스
EventSchema.index({ region_id: 1 });
// 시간순 이벤트 검색을 위한 인덱스
EventSchema.index({ timestamp: -1 });
// CCTV별 이벤트 검색을 위한 인덱스
EventSchema.index({ cctv_id: 1 });
// 지역 및 시간순 이벤트 검색을 위한 인덱스
EventSchema.index({ region_id: 1, timestamp: -1 });
// 상태별 이벤트 검색을 위한 인덱스
EventSchema.index({ status: 1 });
// 알림 전송 여부별 검색을 위한 인덱스
EventSchema.index({ notified: 1 });
// CCTV별 알림 전송 여부 검색을 위한 복합 인덱스
EventSchema.index({ cctv_id: 1, notified: 1 });

mongoose.model('Event', EventSchema);