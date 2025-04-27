/*
 초기 데이터 생성 스크립트
*/
const mongoose = require('mongoose');
const config = require('../config/node_config');

// MongoDB 연결
mongoose.connect(config.db, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('MongoDB 연결 성공');
  seedData();
}).catch(err => {
  console.error('MongoDB 연결 오류:', err);
  process.exit(1);
});

// 모델 로드
require('../app/models/Region');
require('../app/models/CCTV');
require('../app/models/Event');
require('../app/models/UserInfo');
require('../app/models/UserRegion');

const Region = mongoose.model('Region');
const CCTV = mongoose.model('CCTV');
const Event = mongoose.model('Event');
const UserInfo = mongoose.model('UserInfo');
const UserRegion = mongoose.model('UserRegion');

// 초기 데이터 생성
async function seedData() {
  try {
    // 이미 데이터가 있는지 확인
    const regionCount = await Region.countDocuments();
    if (regionCount > 0) {
      console.log('이미 초기 데이터가 존재합니다.');
      await mongoose.connection.close();
      return;
    }

    // 지역 데이터 생성
    const regions = await Region.create([
      {
        name: '서울',
        bounds: {
          northeast: { lat: 37.7010, lng: 127.1830 },
          southwest: { lat: 37.4300, lng: 126.7670 }
        }
      },
      {
        name: '부산',
        bounds: {
          northeast: { lat: 35.3039, lng: 129.2728 },
          southwest: { lat: 34.9596, lng: 128.9401 }
        }
      },
      {
        name: '경기도',
        bounds: {
          northeast: { lat: 38.3008, lng: 127.8481 },
          southwest: { lat: 36.8451, lng: 126.3164 }
        }
      }
    ]);

    console.log(`${regions.length}개의 지역이 생성되었습니다.`);

    // CCTV 데이터 생성
    const cctvs = [];
    for (const region of regions) {
      const regionCCTVs = await CCTV.create([
        {
          name: `${region.name} CCTV 1`,
          streamUrl: 'rtsp://example.com/stream1',
          location: {
            lat: region.bounds.northeast.lat - 0.1,
            lng: region.bounds.northeast.lng - 0.1
          },
          region_id: region._id,
          status: 'active'
        },
        {
          name: `${region.name} CCTV 2`,
          streamUrl: 'rtsp://example.com/stream2',
          location: {
            lat: region.bounds.southwest.lat + 0.1,
            lng: region.bounds.southwest.lng + 0.1
          },
          region_id: region._id,
          status: 'active'
        }
      ]);
      cctvs.push(...regionCCTVs);
    }

    console.log(`${cctvs.length}개의 CCTV가 생성되었습니다.`);

    // 테스트 이벤트 생성
    const events = [];
    for (const cctv of cctvs) {
      // 각 CCTV마다 2개의 이벤트 생성
      const cctvEvents = await Event.create([
        {
          timestamp: new Date(),
          cctv_id: cctv._id,
          location: cctv.location,
          region_id: cctv.region_id,
          confidence: Math.random().toFixed(2),
          status: 'new',
          description: '화재 감지 이벤트'
        },
        {
          timestamp: new Date(Date.now() - 86400000), // 1일 전
          cctv_id: cctv._id,
          location: cctv.location,
          region_id: cctv.region_id,
          confidence: Math.random().toFixed(2),
          status: 'confirmed',
          description: '연기 감지 이벤트'
        }
      ]);
      events.push(...cctvEvents);
    }

    console.log(`${events.length}개의 이벤트가 생성되었습니다.`);

    // 사용자-지역 연결 생성 (admin 계정에 모든 지역 할당)
    const admin = await UserInfo.findOne({ ID: 'admin' });
    if (admin) {
      for (const region of regions) {
        await UserRegion.create({
          user_id: admin._id,
          region_id: region._id
        });
      }
      console.log(`관리자 계정에 ${regions.length}개의 지역이 할당되었습니다.`);
    } else {
      console.log('관리자 계정을 찾을 수 없습니다. admin_create.js를 먼저 실행하세요.');
    }

    console.log('초기 데이터 생성이 완료되었습니다.');
  } catch (err) {
    console.error('초기 데이터 생성 중 오류:', err);
  } finally {
    await mongoose.connection.close();
    console.log('MongoDB 연결 종료');
  }
}