const mongoose = require('mongoose');
const CCTV = mongoose.model('CCTV');
const Region = mongoose.model('Region');
const Event = mongoose.model('Event');

// CCTV 목록 조회
exports.getCCTVs = async (req, res) => {
  try {
    const { region, status } = req.query;
    const query = {};
    
    // 필터 적용
    if (region) {
      query.region_id = region;
    }
    
    if (status) {
      query.status = status;
    }
    
    // CCTV 조회
    const cctvs = await CCTV.find(query).populate('region_id', 'name');
    
    const formattedCCTVs = cctvs.map(cctv => ({
      id: cctv._id,
      name: cctv.name,
      region: cctv.region_id.name,
      status: cctv.status,
      location: cctv.location // 위치 좌표 추가 (lat, lng 포함)
    }));
    
    res.status(200).json({
      status: 'success',
      data: {
        cctvs: formattedCCTVs,
        totalCount: formattedCCTVs.length
      }
    });
  } catch (err) {
    console.error('CCTV 목록 조회 에러:', err);
    res.status(500).json({
      status: 'error',
      message: '서버 오류가 발생했습니다.'
    });
  }
};

// 특정 CCTV 정보 조회
exports.getCCTVStream = async (req, res) => {
  try {
    const cctvId = req.params.cctvId;
    
    // CCTV 조회
    const cctv = await CCTV.findById(cctvId);
    
    if (!cctv) {
      return res.status(404).json({
        status: 'error',
        message: 'CCTV를 찾을 수 없습니다.'
      });
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        streamUrl: cctv.streamUrl,
        cctvInfo: {
          id: cctv._id,
          name: cctv.name,
          location: cctv.location,
          status: cctv.status
        }
      }
    });
  } catch (err) {
    console.error('CCTV 정보 조회 에러:', err);
    res.status(500).json({
      status: 'error',
      message: '서버 오류가 발생했습니다.'
    });
  }
};

// CCTV 추가
exports.createCCTV = async (req, res) => {
  try {
    // 관리자 권한 확인
    if (req.decoded.role !== 'admin') {
      return res.status(403).json({
        status: 'error',
        message: '관리자만 CCTV를 추가할 수 있습니다.'
      });
    }
    
    const { name, streamUrl, location, region_id, status = 'active' } = req.body;
    
    // 필수 필드 확인
    if (!name || !streamUrl || !location || !region_id) {
      return res.status(400).json({
        status: 'error',
        message: '이름, 스트림 URL, 위치, 지역 ID는 필수 항목입니다.'
      });
    }
    
    // 지역 존재 확인
    const region = await Region.findById(region_id);
    if (!region) {
      return res.status(404).json({
        status: 'error',
        message: '존재하지 않는 지역입니다.'
      });
    }
    
    // 스트림 URL 유효성 검사 (간단한 RTSP URL 형식 체크)
    if (!streamUrl.startsWith('rtsp://')) {
      return res.status(400).json({
        status: 'error',
        message: '유효한 RTSP 스트림 URL을 입력해주세요.'
      });
    }
    
    // 위치 유효성 검사
    if (!location.lat || !location.lng) {
      return res.status(400).json({
        status: 'error',
        message: '유효한 위치 정보(lat, lng)를 입력해주세요.'
      });
    }
    
    // 새 CCTV 생성
    const newCCTV = new CCTV({
      name,
      streamUrl,
      location,
      region_id,
      status
    });
    
    await newCCTV.save();
    
    res.status(201).json({
      status: 'success',
      data: {
        cctv: {
          id: newCCTV._id,
          name: newCCTV.name,
          region: region.name,
          status: newCCTV.status
        }
      }
    });
  } catch (err) {
    console.error('CCTV 추가 에러:', err);
    res.status(500).json({
      status: 'error',
      message: '서버 오류가 발생했습니다.'
    });
  }
};

// CCTV 수정
exports.updateCCTV = async (req, res) => {
  try {
    // 관리자 권한 확인
    if (req.decoded.role !== 'admin') {
      return res.status(403).json({
        status: 'error',
        message: '관리자만 CCTV를 수정할 수 있습니다.'
      });
    }
    
    const cctvId = req.params.cctvId;
    const { name, streamUrl, location, region_id, status } = req.body;
    
    // CCTV 존재 확인
    const cctv = await CCTV.findById(cctvId);
    if (!cctv) {
      return res.status(404).json({
        status: 'error',
        message: 'CCTV를 찾을 수 없습니다.'
      });
    }
    
    // 지역 ID 변경 시 존재 확인
    if (region_id && region_id !== cctv.region_id.toString()) {
      const region = await Region.findById(region_id);
      if (!region) {
        return res.status(404).json({
          status: 'error',
          message: '존재하지 않는 지역입니다.'
        });
      }
      cctv.region_id = region_id;
    }
    
    // 필드 업데이트
    if (name) cctv.name = name;
    
    // 스트림 URL 변경 시 유효성 검사
    if (streamUrl) {
      if (!streamUrl.startsWith('rtsp://')) {
        return res.status(400).json({
          status: 'error',
          message: '유효한 RTSP 스트림 URL을 입력해주세요.'
        });
      }
    }
    
    // 위치 정보 업데이트
    if (location) {
      if (!location.lat || !location.lng) {
        return res.status(400).json({
          status: 'error',
          message: '유효한 위치 정보(lat, lng)를 입력해주세요.'
        });
      }
      cctv.location = location;
    }
    
    // 상태 업데이트
    if (status) {
      if (!['active', 'inactive', 'maintenance'].includes(status)) {
        return res.status(400).json({
          status: 'error',
          message: '유효한 상태 값을 입력해주세요. (active, inactive, maintenance)'
        });
      }
      cctv.status = status;
    }
    
    cctv.lastUpdated = new Date();
    await cctv.save();
    
    // 지역 이름 가져오기
    const region = await Region.findById(cctv.region_id);
    
    res.status(200).json({
      status: 'success',
      data: {
        cctv: {
          id: cctv._id,
          name: cctv.name,
          region: region.name,
          status: cctv.status
        }
      }
    });
  } catch (err) {
    console.error('CCTV 수정 에러:', err);
    res.status(500).json({
      status: 'error',
      message: '서버 오류가 발생했습니다.'
    });
  }
};

// CCTV 삭제
exports.deleteCCTV = async (req, res) => {
  try {
    // 관리자 권한 확인
    if (req.decoded.role !== 'admin') {
      return res.status(403).json({
        status: 'error',
        message: '관리자만 CCTV를 삭제할 수 있습니다.'
      });
    }
    
    const cctvId = req.params.cctvId;
    
    // CCTV 존재 확인
    const cctv = await CCTV.findById(cctvId);
    if (!cctv) {
      return res.status(404).json({
        status: 'error',
        message: 'CCTV를 찾을 수 없습니다.'
      });
    }
    
    // 연결된 이벤트 확인
    const eventsCount = await Event.countDocuments({ cctv_id: cctvId });
    
    // CCTV 삭제
    await CCTV.findByIdAndDelete(cctvId);
    
    // 응답
    res.status(200).json({
      status: 'success',
      message: 'CCTV가 성공적으로 삭제되었습니다.',
      data: {
        relatedEventsCount: eventsCount
      }
    });
  } catch (err) {
    console.error('CCTV 삭제 에러:', err);
    res.status(500).json({
      status: 'error',
      message: '서버 오류가 발생했습니다.'
    });
  }
};