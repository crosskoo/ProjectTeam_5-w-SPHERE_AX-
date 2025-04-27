const eventController = require('../../app/controllers/event.controller');

module.exports = function(app, UserApiRoutes) {
  // 이벤트 리스트 조회 API
  UserApiRoutes.route('/events').get(eventController.getEvents);
  
  // 이벤트 상세 조회 API
  UserApiRoutes.route('/events/:eventId').get(eventController.getEventDetail);
};