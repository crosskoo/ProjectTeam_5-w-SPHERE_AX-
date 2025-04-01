'use strict';

module.exports = function(io) {

    io.on('connection', function(socket) {
	var address = socket.handshake.address;
    var ip;
    var time = socket.handshake.time;
    ip = address.split(':');
    
  	console.log('New connection from ' + ip[3] + ' id: ' + socket.id + ' ' + time);	
            socket.broadcast.emit('statusCheck', socket.id);
            require('../app/controllers/socketio.controller')(io, socket);
    });
    
}
