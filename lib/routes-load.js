const dir = require('node-dir');
const reload = require('require-reload')(require);
module.exports = function(routesFolder,callback){
	var routes = {};
	dir.files(routesFolder, function(err, files) {
			if (err) throw err;
			files.forEach(function(file){
				var r = reload(file);
				for (var k in r) {
					routes[k] = r[k];
				}
			});
			callback(routes);
	});
};
