const mongoose = require('mongoose');
const Region = mongoose.model('Region');
const CCTV = mongoose.model('CCTV');
const UserRegion = mongoose.model('UserRegion');

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

// 지역 추가
exports.createRegion = async (req, res) => {
  try {
    // 관리자 권한 확인
    if (req.decoded.role !== 'admin') {
      return res.status(403).json({
        status: 'error',
        message: '관리자만 지역을 추가할 수 있습니다.'
      });
    }
    
    const { name, bounds } = req.body;
    
    // 필수 필드 확인
    if (!name) {
      return res.status(400).json({
        status: 'error',
        message: '지역 이름은 필수 항목입니다.'
      });
    }
    
    // 지역명 중복 확인
    const existingRegion = await Region.findOne({ name });
    if (existingRegion) {
      return res.status(400).json({
        status: 'error',
        message: '이미 존재하는 지역 이름입니다.'
      });
    }
    
    // 새 지역 생성
    const newRegion = new Region({
      name,
      bounds: bounds || {
        northeast: { lat: 0, lng: 0 },
        southwest: { lat: 0, lng: 0 }
      }
    });
    
    await newRegion.save();
    
    res.status(201).json({
      status: 'success',
      data: {
        region: {
          id: newRegion._id,
          name: newRegion.name,
          bounds: newRegion.bounds
        }
      }
    });
  } catch (err) {
    console.error('지역 추가 에러:', err);
    res.status(500).json({
      status: 'error',
      message: '서버 오류가 발생했습니다.'
    });
  }
};

// 지역 수정
exports.updateRegion = async (req, res) => {
  try {
    // 관리자 권한 확인
    if (req.decoded.role !== 'admin') {
      return res.status(403).json({
        status: 'error',
        message: '관리자만 지역을 수정할 수 있습니다.'
      });
    }
    
    const regionId = req.params.regionId;
    const { name, bounds } = req.body;
    
    // 지역 존재 확인
    const region = await Region.findById(regionId);
    if (!region) {
      return res.status(404).json({
        status: 'error',
        message: '지역을 찾을 수 없습니다.'
      });
    }
    
    // 이름 변경 시 중복 확인
    if (name && name !== region.name) {
      const existingRegion = await Region.findOne({ name });
      if (existingRegion) {
        return res.status(400).json({
          status: 'error',
          message: '이미 존재하는 지역 이름입니다.'
        });
      }
      region.name = name;
    }
    
    // bounds 업데이트
    if (bounds) {
      region.bounds = bounds;
    }
    
    region.lastUpdated = new Date();
    await region.save();
    
    res.status(200).json({
      status: 'success',
      data: {
        region: {
          id: region._id,
          name: region.name,
          bounds: region.bounds
        }
      }
    });
  } catch (err) {
    console.error('지역 수정 에러:', err);
    res.status(500).json({
      status: 'error',
      message: '서버 오류가 발생했습니다.'
    });
  }
};

// 지역 삭제
exports.deleteRegion = async (req, res) => {
  try {
    // 관리자 권한 확인
    if (req.decoded.role !== 'admin') {
      return res.status(403).json({
        status: 'error',
        message: '관리자만 지역을 삭제할 수 있습니다.'
      });
    }
    
    const regionId = req.params.regionId;
    
    // 지역 존재 확인
    const region = await Region.findById(regionId);
    if (!region) {
      return res.status(404).json({
        status: 'error',
        message: '지역을 찾을 수 없습니다.'
      });
    }
    
    // 지역 내 CCTV 확인
    const cctvCount = await CCTV.countDocuments({ region_id: regionId });
    if (cctvCount > 0) {
      return res.status(400).json({
        status: 'error',
        message: '해당 지역에 CCTV가 존재합니다. 먼저 CCTV를 삭제해주세요.'
      });
    }
    
    // 지역과 연결된 사용자 관계 삭제
    await UserRegion.deleteMany({ region_id: regionId });
    
    // 지역 삭제
    await Region.findByIdAndDelete(regionId);
    
    res.status(200).json({
      status: 'success',
      message: '지역이 성공적으로 삭제되었습니다.'
    });
  } catch (err) {
    console.error('지역 삭제 에러:', err);
    res.status(500).json({
      status: 'error',
      message: '서버 오류가 발생했습니다.'
    });
  }
};