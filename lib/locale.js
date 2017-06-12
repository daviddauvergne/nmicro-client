const fs = require('fs');
const	logger = require('./logger');
module.exports = function(file,sourcesFolder,callback){
	fs.readFile(file, 'utf8', function (err,data) {
		if (err) {
			// TODO: log error
			return callback({});
		}
		try {
			data = JSON.parse(data);
			callback(data);
		} catch (err) {
			var x = err.stack.split('\n');
			logger.msg([{b_red:'Error: '},{blue:file.substring(sourcesFolder.length+1)},{b_blue:' '+x[0]}]);
			callback({});
		}
	});
};
