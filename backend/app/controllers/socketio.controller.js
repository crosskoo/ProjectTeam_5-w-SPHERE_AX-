'use strict';

process.on('uncaughtException', (err) => {
	console.error('uncaughtException: ', err);
});








module.exports = function(io, socket){

    io.sockets.setMaxListeners(0);

	

	// socket.on('이벤트명', function (data) {
		
	// })

	// socket.emit('이벤트명', params)

	

}



