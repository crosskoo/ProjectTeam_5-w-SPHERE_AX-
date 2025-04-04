'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var RegionSchema = new Schema({
    name: {
        type: String,
        unique: true,
        required: true,
        trim: true
    },
    bounds: {
        northeast: {
            lat: Number,
            lng: Number
        },
        southwest: {
            lat: Number,
            lng: Number
        }
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

// 지역 이름으로 검색하기 위한 인덱스
RegionSchema.index({ name: 1 });

// 지역 업데이트 전 lastUpdated 필드 갱신
RegionSchema.pre('findOneAndUpdate', function(next) {
    this.set({ lastUpdated: new Date() });
    next();
});

mongoose.model('Region', RegionSchema);