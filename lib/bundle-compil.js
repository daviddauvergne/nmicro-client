
const dir = require('node-dir');
const path = require('path');

const template = require('./template');
const style = require('./style');
const loc = require('./locale');
const bundleJS = require('./bundle-js');
const moduleCompil = require('./module-compil');
const apiCompil = require('./api-compil');
const cpCompil = require('./component-compil');
const nConvert = require('./name-convert');
const toSourceFnc = require('tosource');
const UglifyJS = require('uglify-js');

module.exports = function(bundle,callback){
	var fncs = [];

	var fn = function(callback){
		return new Promise(
			function(resolve,reject) {
				callback(resolve,reject);
			}
		);
	};

	var nbdl = nConvert.kebabTocamel(bundle.name);

	// apis
	var createApis = function(config,apis,callback){
		var fncsApis = [];
		apis.forEach(function(api){
			fncsApis.push(fn(function(resolve,reject){
				apiCompil({name:api,folder:path.join(config.sourcesApis,api),config:config},function(result) {
					resolve({name:api,content:result});
				});
			}));
		});

		var apiPublicScript = 'window.APIS = (function(){var apis = {';
		var apiLocale = {};
		Promise.all(fncsApis).then(function(data){
			data.forEach(function(el){
				if(el.content.public!==undefined){
					apiPublicScript += el.content.public;
				}
				if(el.content.locale!==undefined){
					apiLocale[nConvert.kebabTocamel(el.name)] = el.content.locale;
				}
			});
			apiPublicScript += `
};

var r = {};
for (var name in apis) {

	r[name] = {};
	var t = r[name];

	for (var route in apis[name].__schema) {
		var nfnc = function(scope,schema) {
			if (schema.req) schema.req = Object.assign({}, this.req, schema.req); else schema.req = this.req;
			if (schema.res == undefined) schema.res = {};
			schema.res.default = this.resDefault;
			window.$load(scope,schema);
		};
		// req
		nfnc.req = apis[name].__schema[route].req;
		nfnc.req.url = apis[name].__url + nfnc.req.url.replace(/^\\/+/,'');
		nfnc.req.method = nfnc.req.method.toUpperCase();
		// error
		if(apis[name].__schema[route].res == undefined)
			apis[name].__schema[route].res = {};
		nfnc.resDefault = apis[name].__schema[route].res;
		for (var errorFnc in apis[name].__res) {
			if (nfnc.resDefault[errorFnc] == undefined) {
				nfnc.resDefault[errorFnc] = apis[name].__res[errorFnc];
			}
		}

		t[route] = nfnc.bind(nfnc);
	}
}

return r;
})();`;
			callback({
				apiPublicScript:apiPublicScript,
				apiLocale:apiLocale
			});
		}).catch(function(data){
			// TODO: log error
			console.log(data);
			callback({
				apiPublicScript:apiPublicScript,
				apiLocale:apiLocale
			});
		});
	};

	// modules
	var createModules = function(bundle,modules,callback){
		var fncsModule = [];
		var moduleTpl = {};
		var modulePublicScript = '';
		var moduleCss = '';
		var moduleLocale = {};
		modules.forEach(function(module){
			fncsModule.push(fn(function(resolve,reject){
				moduleCompil({
						name:module,
						folder:path.join(bundle.config.sourcesModules,module),
						scssMainFile:bundle.scssMainFile,
						sources:bundle.config.sources,
						dev:bundle.dev
					},function(result) {
					resolve({name:module,content:result});
				});
			}));
		});
		Promise.all(fncsModule).then(function(data){
			data.forEach(function(el){
				if(el.content.module!==undefined){
					moduleTpl[el.name] = el.content.module;
				}
				if(el.content.public!==undefined){
					modulePublicScript += el.content.public;
				}
				if(el.content.locale!==undefined){
					moduleLocale[nConvert.kebabTocamel(el.name)] = el.content.locale;
				}
				for (var k in el.content.multiTemplates) {
					moduleTpl[k] = el.content.multiTemplates[k];
				}
				moduleCss += el.content.css;
			});

			callback({
				moduleTpl:moduleTpl,
				moduleCss:moduleCss,
				modulePublicScript:modulePublicScript,
				moduleLocale:moduleLocale
			});
		}).catch(function(data){
			console.log('error compil modules');
			console.log(data);
			callback({
				moduleTpl:moduleTpl,
				moduleCss:moduleCss,
				modulePublicScript:modulePublicScript,
				moduleLocale:moduleLocale
			});
		});
	};


	var BundleFile = path.join(bundle.folder,bundle.name+'.js');
	var bundleObjRoot = bundleJS(bundle.name,BundleFile,bundle.config);

	if(bundleObjRoot.restriction===null || (bundleObjRoot.restriction!==null && bundleObjRoot.restriction==bundle.mode.type)){
		dir.readFiles(bundle.folder,{},
			function(err, content, filename, next) {
				var filePath = path.parse(filename)
				var fileExtention = path.extname(filename);
				switch (filePath.ext) {
					case '.js':
						fncs.push(fn(function(resolve,reject){
							var bundleObj;
							if(filename==BundleFile)
								bundleObj = bundleObjRoot;
							else
								bundleObj = bundleJS(bundle.name,filename,bundle.config.sources,bundle.config.sourcesModules);

							var modulePublicScript = '';
							var moduleCss = '';
							var moduleLocale = {};
							var moduleTpl = {};
							var contentApis = null;

							if(bundleObj.modules.length>0){
								createModules(bundle,bundleObj.modules,function(contentModules){
									if(bundleObj.apis.length>0){
										createApis(bundle.config,bundleObj.apis,function(contentApis){
											resolve({
												name:'script',
												apis:contentApis,
												content:bundleObj,
												moduleTpl:contentModules.moduleTpl,
												components:bundleObj.components,
												moduleCss:contentModules.moduleCss,
												modulePublicScript:contentModules.modulePublicScript,
												moduleLocale:contentModules.moduleLocale
											});
										});
									} else {
										resolve({
											name:'script',
											apis:contentApis,
											content:bundleObj,
											moduleTpl:contentModules.moduleTpl,
											components:bundleObj.components,
											moduleCss:contentModules.moduleCss,
											modulePublicScript:contentModules.modulePublicScript,
											moduleLocale:contentModules.moduleLocale
										});
									}
								});

							} else {
								if(bundleObj.apis.length>0){
									createApis(bundle.config,bundleObj.apis,function(contentApis){
										resolve({
											name:'script',
											apis:contentApis,
											content:bundleObj,
											moduleTpl:[],
											components:bundleObj.components,
											moduleCss:moduleCss,
											modulePublicScript:modulePublicScript,
											moduleLocale:moduleLocale
										});
									});
								} else {
									resolve({
										name:'script',
										apis:contentApis,
										content:bundleObj,
										moduleTpl:[],
										components:bundleObj.components,
										moduleCss:moduleCss,
										modulePublicScript:modulePublicScript,
										moduleLocale:moduleLocale
									});
								}
							}
						}));
					break;
					case '.json':
						fncs.push(fn(function(resolve,reject){
							loc(filename,bundle.config.sources,function(result) {
								resolve({name:'locale',lang:filePath.name,content:result});
							});
						}));
					break;
					case '.tpl':
						fncs.push(fn(function(resolve,reject){
							template(bundle.config.sources,filename,function(tpls){
								resolve({name:'templates',content:tpls});
							},true,false);
						}));
					break;
					case '.scss':
						fncs.push(fn(function(resolve,reject){
							style(bundle.scssMainFile,bundle.config.sources,[bundle.folder],[bundle.name],function(result) {
								resolve({name:'style',content:result});
							});
						}));
					break;

				}
				next();
			},
			function(err, files){
				if (err) {
					// log error
					return null;
				}

				Promise.all(fncs).then(function(data){

					var templates = {};
					var match = {};
					var events = {};
					templates[bundle.name] = {};
					var bundleHTML = '';
					var bundleAssign = '';
					var components = [];
					var publicScript = '';
					var restriction = null;
					var privateScript = '';
					var cssContent = '';
					var locale = {
						api : {},
						cp : {},
						md : {}
					};
					var localeBdl = {};

					data.forEach(function(el){

						switch (el.name) {
							case 'script':
								restriction = el.content.restriction;
								if(el.content.components!=undefined){
									components = el.content.components;
								}
								if(el.content.public!=undefined){
									publicScript += el.content.public;
								}
								if(el.modulePublicScript!=''){
									publicScript += "\n"+el.modulePublicScript;
								}
								if(el.moduleTpl){
									for (var m in el.moduleTpl) {
										templates[m] = el.moduleTpl[m];

										if(el.moduleTpl[m].ref){
											templates[m].ref = el.moduleTpl[m].ref;
											templates[m].type = el.moduleTpl[m].type;
										}
									}
								}
								if(el.content.private!=undefined){
									if(bundle.dev){
										el.content.private.___init = function(dev){
											if(this.init)
												this.init();
											dev(this);
										};
									} else {
										delete el.content.private.scenaridev;
									}
									privateScript = el.content.private;
								}
								if(el.apis!=undefined){
									publicScript += "\n"+el.apis.apiPublicScript;
									locale.api = el.apis.apiLocale;
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
								locale.md = el.moduleLocale;
								cssContent += el.moduleCss;

							break;
							case 'templates':
								for (var k in el.content) {
									if(k==bundle.name){
										bundleHTML = el.content[bundle.name].content.replace(/\s+el=/g,' elbdl=').replace(/\s+evt=/g,' evtbdl=');
										bundleAssign = el.content[bundle.name].overlay;
									} else {
										templates[k] = el.content[k];
										templates[k].ref = bundle.name;
										templates[k].type = 'bdl';
									}
								}
							break;
							case 'style':
								cssContent += el.content;
							break;
							case 'locale':
								localeBdl[el.lang] = el.content;
							break;
						}
					});
					for (var n in privateScript) {
						templates[bundle.name][n] = privateScript[n];
					}

					for (var k in templates) {
						if(match[k]){
							templates[k].match = match[k];
						}
						if(events[k]){
							templates[k].events = events[k];
						}
					}

					var bundleHeader = '';
					if(templates.bundleHeader){
						bundleHeader = templates.bundleHeader.content;
						delete templates.bundleHeader;
					}

					var code = `window.$bundles = (function(public) {
					window.public = public;
					// public
					${publicScript}
					public.push({name : '${bundle.name}',templates : ${toSourceFnc(templates)}  });return public;}(window.$bundles||[]));`;

					var stringJS = '';
					if(bundle.dev){
						// var stream = UglifyJS.OutputStream({beautify:true,comments:true});
						// var ast = UglifyJS.parse(code).print(stream);
						// stringJS = stream.toString();
						stringJS = code;
					} else {
						var result = UglifyJS.minify(code, {fromString:true});
						stringJS = result.code;
					}

					// generate cp
					if(components.length>0){
						var fncsCP = [];
						components.forEach(function(cpName){
							fncsCP.push(fn(function(resolve,reject){
								cpCompil({
									name:cpName,
									folder:path.join(bundle.config.sourcesCp,cpName),
									scssMainFile:bundle.scssMainFile,
									dev : bundle.dev,
									config : bundle.config
								},function(result) {
									resolve({name:cpName,content:result});
								});
							}));

						});

						Promise.all(fncsCP).then(function(data){
							var cpCSS = '';
							var cpStringJS = '';
							data.forEach(function(el){
								if(Object.keys(el.content.locale).length>0)
									locale.cp[nConvert.kebabTocamel(el.name)] = el.content.locale;

								cpCSS += el.content.css;
								cpStringJS += '\n'+el.content.string;
							});

							callback({
								restriction : restriction,
								bundleHeader : bundleHeader,
								locale : locale,
								bundleHTML:bundleHTML,
								bundleAssign:bundleAssign,
								localeBdl : localeBdl,
								js : cpStringJS+'\n'+stringJS,
								css : cpCSS+cssContent
							});
						}).catch(function(data){
							// TODO: log error
							console.log(data);
							resolve([]);
						});
					} else {
						callback({
							restriction : restriction,
							bundleHeader : bundleHeader,
							locale : locale,
							bundleHTML:bundleHTML,
							bundleAssign:bundleAssign,
							localeBdl : localeBdl,
							js : stringJS,
							css : cssContent
						});
					}
				}).catch(function(data){
					console.log('------------ ERROR -----------');
					console.log(data);
					// log error
					// callback(null)
				});
			}
		);
	} else {
		callback({
			restriction : bundleObjRoot.restriction
		});
	}
};
