const dir = require('node-dir');
const path = require('path');

const template = require('./template');
const style = require('./style');
const loc = require('./locale');
const moduleJS = require('./module-js');

module.exports = function(module,callback){

	var fncs = [];

	var fn = function(callback){
		return new Promise(
			function(resolve,reject) {
				callback(resolve,reject);
			}
		);
	};

	dir.readFiles(module.folder,{},
		function(err, content, filename, next) {
			var filePath = path.parse(filename)
			var fileExtention = path.extname(filename);
			switch (filePath.ext) {
				case '.js':
					fncs.push(fn(function(resolve,reject){
						var moduleObj = moduleJS(module.name,filename,module);
						resolve({name:'script',content:moduleObj});
					}));
				break;
				case '.json':
					fncs.push(fn(function(resolve,reject){
						loc(filename,module.sources,function(result) {
							resolve({name:'locale',lang:filePath.name,content:result});
						});
					}));
				break;
				case '.tpl':
					fncs.push(fn(function(resolve,reject){
						template(module.sources,filename,function(tpls){
							resolve({name:'templates',content:tpls});
						},false,false);
					}));
				break;
				case '.scss':
					fncs.push(fn(function(resolve,reject){
						style(module.scssMainFile,module.sources,[module.folder],[module.name],function(result) {
							resolve({name:'style',content:result});
						});
					}));
				break;

			}
			next();
		},
		function(err, files){
			if (err) {
				console.log(err);
				return null;
			}

			Promise.all(fncs).then(function(data){

				var md = {};
				var publicScript = '';
				var privateScript = '';
				var css = '';
				var locale = {};
				var multiTemplates = {};
				var match = {};
				var events = {};

				data.forEach(function(el){
					switch (el.name) {
						case 'script':

							if(el.content.public!=undefined){
								publicScript = el.content.public;
							}
							if(el.content.private!=undefined){
								if(module.dev){
									el.content.private.___init = function(dev){
										if(this.init)
											this.init();
										dev(this);
									};
								}
								privateScript = el.content.private;
							}
							if(el.content.match){
								for (var k in el.content.match) {
									match[k] = el.content.match[k];
								}
							}
							if(el.content.events){
								for (var l in el.content.events) {
									events[l] = el.content.events[l];
								}
							}
						break;
						case 'templates':
							for (var k in el.content) {
								if (k==module.name) {
									md = el.content[k];
								} else {
									multiTemplates[k] = el.content[k];
									multiTemplates[k].ref = module.name;
									multiTemplates[k].type = 'md';
									if(module.dev){
										multiTemplates[k].___init = function(dev){
											if(this.init)
												this.init();
											dev(this);
										};
									}
								}
							}
						break;
						case 'style':
							css = el.content;
						break;
						case 'locale':
							locale[el.lang] = el.content;
						break;
					}
				});

				for (var n in privateScript) {
					md[n] = privateScript[n];
				}

				if(match[module.name]){
					md.match = match[module.name];
				}

				if(events[module.name]){
					md.events = events[module.name];
				}

				for (var k in multiTemplates) {
					if(match[k]){
						multiTemplates[k].match = match[k];
					}
					if(events[k]){
						multiTemplates[k].events = events[k];
					}
				}

				callback({
					locale: locale,
					css : css,
					public: publicScript,
					module: md,
					multiTemplates : multiTemplates
				});
			}).catch(function(data){
				console.log(data);
				// log error
				callback(null)
			});
		}
	);
};
