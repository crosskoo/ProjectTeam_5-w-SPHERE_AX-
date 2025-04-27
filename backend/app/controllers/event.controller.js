const mongoose = require('mongoose');
const Event = mongoose.model('Event');
const CCTV = mongoose.model('CCTV');
const Region = mongoose.model('Region');

// 이벤트 리스트 조회
exports.getEvents = async (req, res) => {
  try {
    const { region, startDate, endDate, lastEventId, limit = 30 } = req.query;
    const query = {};
    
    // 필터 적용
    if (region) {
      query.region_id = region;
    }
    
    // 날짜 필터
    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) {
        query.timestamp.$gte = new Date(startDate);
      }
      if (endDate) {
        query.timestamp.$lte = new Date(endDate);
      }
    }
    
    // 페이지네이션 - lastEventId가 있으면 해당 ID 이후의 결과 가져오기
    if (lastEventId) {
      const lastEvent = await Event.findById(lastEventId);
      if (lastEvent) {
        query._id = { $lt: lastEventId };
      }
    }
    
    // 이벤트 조회 (최신순, limit 개수만큼)
    const events = await Event.find(query)
      .sort({ timestamp: -1 })
      .limit(parseInt(limit) + 1) 
      .populate('cctv_id', 'name')
      .populate('region_id', 'name');
    
    const hasMore = events.length > limit;
    const eventsToReturn = events.slice(0, limit);
    
    const formattedEvents = eventsToReturn.map(event => ({
      id: event._id,
      timestamp: event.timestamp,
      cctvId: event.cctv_id._id,
      region: event.region_id.name,
      status: event.status
    }));
    
    // 전체 이벤트 수 계산
    const totalCount = await Event.countDocuments(query);
    
    res.status(200).json({
      status: 'success',
      data: {
        events: formattedEvents,
        hasMore,
        lastEventId: formattedEvents.length > 0 ? formattedEvents[formattedEvents.length - 1].id : null,
        totalCount
      }
    });
  } catch (err) {
    console.error('이벤트 리스트 조회 에러:', err);
    res.status(500).json({
      status: 'error',
      message: '서버 오류가 발생했습니다.'
    });
  }
};

// 이벤트 상세 조회
exports.getEventDetail = async (req, res) => {
  try {
    const eventId = req.params.eventId;
    
    // 이벤트 조회
    const event = await Event.findById(eventId)
      .populate('cctv_id', 'name')
      .populate('region_id', 'name');
    
    if (!event) {
      return res.status(404).json({
        status: 'error',
        message: '이벤트를 찾을 수 없습니다.'
      });
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        event: {
          id: event._id,
          timestamp: event.timestamp,
          cctvId: event.cctv_id._id,
          location: event.location,
          region: event.region_id.name,
          confidence: event.confidence,
          imageUrl: event.imageUrl,
          status: event.status,
          description: event.description
        }
      }
    });
  } catch (err) {
    console.error('이벤트 상세 조회 에러:', err);
    res.status(500).json({
      status: 'error',
      message: '서버 오류가 발생했습니다.'
    });
  }
};

