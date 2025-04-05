'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var UserRegionSchema = new Schema({
    user_id: {
        type: Schema.Types.ObjectId,
        ref: 'UserInfo',
        required: true
    },
    region_id: {
        type: Schema.Types.ObjectId,
        ref: 'Region',
        required: true
    },
    created: {
        type: Date,
        default: Date.now
    }
});

// 사용자 ID와 지역 ID의 조합이 유일해야
UserRegionSchema.index({ user_id: 1, region_id: 1 }, { unique: true });

mongoose.model('UserRegion', UserRegionSchema);