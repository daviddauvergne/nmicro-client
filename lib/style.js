
const fs = require('fs');
const sass = require('node-sass');
const	logger = require('./logger');

var _import = function(includeFile){
	return '\n@import "'+includeFile.join('","')+'";';
};

module.exports = function(mainFile,sourcesFolder,includePaths,includeFile,callback){
	fs.readFile(mainFile, 'utf8', function (err,data) {
		if (err) {
			// TODO: log error
			return callback(null);
		}
		sass.render({
			includePaths : includePaths,
			data: data+_import(includeFile)
		}, function(err, result) {
			if (err) {
				logger.msg([{b_red:'Error: '},{blue:err.file.substring(sourcesFolder.length+1)+':'+err.line},{b_yellow:' '+err.message}]);
				// TODO: log error
				return callback(null);
			}
			callback(result.css.toString());
		});
	});
};
