const userController = require('../../app/controllers/user.controller');





module.exports = function (app, UserApiRoutes){ 


  app.route('/master/1').post(userController.userLogs);
  app.route('/master/2').get(userController.userInfo);


};