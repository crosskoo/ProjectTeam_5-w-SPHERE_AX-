const mongoose = require('mongoose');
const Region = mongoose.model('Region');
const CCTV = mongoose.model('CCTV');

// 지역 정보 조회
exports.getRegions = async (req, res) => {
  try {
    // 모든 지역 정보 조회
    const regions = await Region.find({});
    
    // 각 지역별 CCTV 개수 계산
    const regionsWithCounts = await Promise.all(regions.map(async (region) => {
      const cctvCount = await CCTV.countDocuments({ region_id: region._id });
      
      return {
        id: region._id,
        name: region.name,
        bounds: region.bounds,
        cctvCount
      };
    }));
    
    res.status(200).json({
      status: 'success',
      data: {
        regions: regionsWithCounts
      }
    });
  } catch (err) {
    console.error('지역 정보 조회 에러:', err);
    res.status(500).json({
      status: 'error',
      message: '서버 오류가 발생했습니다.'
    });
  }
};