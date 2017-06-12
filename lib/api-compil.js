const dir = require('node-dir');
const path = require('path');

const loc = require('./locale');
const apiJS = require('./api-js');

module.exports = function(api,callback){

	var fncs = [];

	var fn = function(callback){
		return new Promise(
			function(resolve,reject) {
				callback(resolve,reject);
			}
		);
	};

	dir.readFiles(api.folder,{},
		function(err, content, filename, next) {

			var filePath = path.parse(filename)
			var fileExtention = path.extname(filename);
			switch (filePath.ext) {
				case '.js':
					fncs.push(fn(function(resolve,reject){
						var apiObj = apiJS(api.name,filename,api.config);
						resolve({name:'script',content:apiObj});
					}));
				break;
				case '.json':
					fncs.push(fn(function(resolve,reject){
						loc(filename,api.config.sources,function(result) {
							resolve({name:'locale',lang:filePath.name,content:result});
						});
					}));
				break;

			}
			next();
		},
		function(err, files){
			if (err) {
				console.log(err);
				// return null;
			}

			Promise.all(fncs).then(function(data){
				var publicScript = '';
				var locale = {};

				data.forEach(function(el){
					switch (el.name) {
						case 'script':
							if(el.content.public!=undefined){
								publicScript = el.content.public;
							}
						break;
						case 'locale':
							locale[el.lang] = el.content;
						break;
					}
				});

				callback({
					locale: locale,
					public: publicScript
				});
			}).catch(function(data){
				console.log(data);
				callback(null)
			});
		}
	);
};
