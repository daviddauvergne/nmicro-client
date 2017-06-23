// all compil
const path = require('path');
const fs = require('fs-extra');
const CleanCSS = require('clean-css');
const bundleCompil = require('./bundle-compil');
const libCompil = require('./lib-compil');
const template = require('./template');
const tpl = require('./tpl');
const style = require('./style');
const loc = require('./locale');
const compilLibDefault = require('./lib-default-compil');
const reload = require('require-reload')(require);
const UglifyJS = require('uglify-js');
const logger = require('./logger');

var finishLangue = function(config,fnc){
	var count = 0;
	var languesLength = config.langues.length;
	return function(whois){
		count++;
		if(count==languesLength && fnc!==undefined)
			fnc(whois);
	};
};

module.exports = {

	bundle : function(config,mode,model,bundleName,emitMessage,finish){
		bundleCompil({
			name : bundleName,
			folder : path.join(config.sourcesBdl,bundleName),
			scssMainFile : path.join(config.sourcesModels,model,config.varsSCSS),
			dev : config.dev,
			config:config,
			mode:mode
		},function(data){

			if(data.restriction===null || data.restriction==mode.type){

				if(mode.type=='app' ){
					if(!config.dev)
						data.css = new CleanCSS().minify(data.css).styles;

					fs.outputFile(config.goodUrl.url(mode.type,path.join(config.out,mode.type,model,'css',bundleName+'.css')),
						config.goodUrl.css(mode.type,data.css), function (err) {
						if (err) return console.error(err);
					});

					fs.outputFile(config.goodUrl.url(mode.type,path.join(config.out,mode.type,model,'js',bundleName+'.js')), config.goodUrl.js(mode.type,data.js), function (err) {
						if (err) return console.error(err);
					});
				}

				var urlBdlCSS = config.goodUrl.url(mode.type,mode.relUrl+'css/'+bundleName+'.css');
				var urlBdlJS = config.goodUrl.url(mode.type,mode.relUrl+'js/'+bundleName+'.js');
				var urlMainCSS = config.goodUrl.url(mode.type,mode.relUrl+'css/'+config.mainFileCSS);
				var urlMainJS = config.goodUrl.url(mode.type,mode.relUrl+'js/'+config.mainFileJS);

				var _finish = finishLangue(config,finish);

				config.langues.forEach(function(lang){

					if(mode.type=='web'){
						if(!config.dev)
							data.css = new CleanCSS().minify(data.css).styles;

						fs.outputFile(config.goodUrl.url(mode.type,path.join(config.out,mode.type,model,lang,'css',bundleName+'.css')),
						 config.goodUrl.css(mode.type,data.css), function (err) {
							if (err) return console.error(err);
						});

						fs.outputFile(config.goodUrl.url(mode.type,path.join(config.out,mode.type,model,lang,'js',bundleName+'.js')),
						config.goodUrl.js(mode.type,data.js), function (err) {
							if (err) return console.error(err);
						});
					}

					var bundleHTML = data.bundleHTML;
					var bundleHeader = data.bundleHeader;
					if(data.localeBdl!==undefined && data.localeBdl[lang]!==undefined){
						bundleHTML = tpl(data.bundleHTML,data.localeBdl[lang]);
						bundleHeader = tpl(data.bundleHeader,data.localeBdl[lang]);
					 }

					 bundleHTML = config.goodUrl.html(mode.type,bundleHTML);
					 bundleHeader = config.goodUrl.html(mode.type,bundleHeader);


					var locale = {
						bdl : {},
						api : {},
						cp : {},
						md : {}
					};

					for (var m in data.locale) {
						for (var n in data.locale[m]) {
							locale[m][n] = data.locale[m][n][lang];
						}
					}
					var localeBdl = data.localeBdl[lang];
					locale.bdl = localeBdl;

					var socketIoJS = '';
					if(config.dev){
						locale = JSON.stringify(locale, null, 2);
						if(mode.type=='web')
							socketIoJS = socketIoJS = compilLibDefault.getSocketDEvString();
					} else {
						locale = JSON.stringify(locale);
					}
					var appcache = '';
					if(config.appcache && mode.type=='web')
						appcache = ' manifest="'+config.appcache+'"'

					var html = `<!DOCTYPE html>
<html lang="${lang}"${appcache}>
<head>
<meta charset="UTF-8" />
<meta http-equiv="Content-type" content="text/html;charset=UTF-8" />${socketIoJS}
${bundleHeader}
<link rel="stylesheet" href="${urlMainCSS}"/>
<link rel="stylesheet" href="${urlBdlCSS}"/>
<script type="text/javascript">
COMPONENTS = {};
LC = ${locale};
</script>
<script type="text/javascript" src="${urlMainJS}"></script>
<script type="text/javascript" src="${urlBdlJS}"></script>
</head>
<body>
${bundleHTML}
</body>
</html>`;

					if(mode.type=='app'){
						fs.outputFile(path.join(config.out,mode.type,model,'html',lang,bundleName+'.html'), html, function (err) {
							if (err) return console.error(err);
							finish('bundle: '+bundleName);
						});
					} else {
						fs.outputFile(path.join(config.out,mode.type,model,lang,bundleName+'.html'), html, function (err) {
							if (err) return console.error(err);
							_finish('bundle: '+bundleName);
						});
						if(lang==config.defaultLangue)
							emitMessage(bundleName);

					}
				});
			} else {
				finish('bundle: '+bundleName);
			}
		});
	},

	lib : function(config,mode,model,emitMessage,finish){
		libCompil(config,function(data){
			var setting = reload(config.settingFile);
			var settingValue = '';
			if(setting && setting[model]){
				if(setting[model][mode.type]){
					if(setting[model][mode.type][config.devString]){
						settingValue = setting[model][mode.type][config.devString];
					} else {
						logger.msg([{b_red:'Error setting model ['+model+'], out ['+mode.type+'], mode: '+config.devString+' undefined (setting.js)'}]);
					}
				} else {
					logger.msg([{b_red:'Error setting model ['+model+'], out: '+mode.type+' undefined (setting.js)'}]);
				}
			} else {
				logger.msg([{b_red:'Error setting model: '+model+' undefined (setting.js)'}]);
			}

			var modeModelData = `
window.MODE = "${mode.type}";
window.MODEL = "${model}";
${settingValue}
${data}
`;

			if(!config.dev){
				var result = UglifyJS.minify(modeModelData, {fromString:true});
				modeModelData = result.code;
			}
			if(mode.type=='app'){
				fs.outputFile(config.goodUrl.url(mode.type,path.join(config.out,mode.type,model,'js',config.mainFileJS)), modeModelData, function (err) {
					if (err) return console.error(err);
					finish('lib');
				});
			} else {
				var _finish = finishLangue(config,finish);
				config.langues.forEach(function(lang){
					fs.outputFile(config.goodUrl.url(mode.type,path.join(config.out,mode.type,model,lang,'js',config.mainFileJS)), modeModelData, function (err) {
						if (err) return console.error(err);
						_finish('lib');
					});
					if(lang==config.defaultLangue)
						emitMessage('_all_');

				});
			}
		});
	},

	medias : function(config,mode,model,medias,emitMessage,finish) {

		var finishMedias = function(nb){
			var count = 0;
			return function(whois){
				count++;
				if(count==nb && finish!==undefined)
					finish(whois);
			}
		};
		var sourcesMedias = path.join(config.sourcesModels,model,'medias');
		var _finish;
		if(mode.type=='app'){
			_finish = finishMedias(medias.length);
			var outMedias = path.join(config.out,mode.type,model,'medias');
			fs.mkdirs(outMedias, function (err) {
				medias.forEach(function(media) {
					var sourceFile = path.join(sourcesMedias,media);
					var outFile = config.goodUrl.url(mode.type,path.join(outMedias,media));
					fs.copy(sourceFile, outFile, function (err) {
						if (err) return console.error(err);
						_finish('medias');
					});
				});
			});
		} else {
			_finish = finishMedias(medias.length*config.langues.length);
			config.langues.forEach(function(lang){
				var outMedias = path.join(config.out,mode.type,model,lang,'medias');
				fs.mkdirs(outMedias, function (err) {
					medias.forEach(function(media) {
						var sourceFile = path.join(sourcesMedias,media);
						var outFile = config.goodUrl.url(mode.type,path.join(outMedias,media));
						fs.copy(sourceFile, outFile, function (err) {
							if (err) return console.error(err);
							_finish('medias');
						});
					});
				});
				if(lang==config.defaultLangue)
					emitMessage('_all_');
			});
		}
	},

	pages : function(config,mode,model,page,emitMessage){
		var pageFolder = path.join(config.sourcesPages,page);
		var tplPageFile = path.join(pageFolder,page+'.tpl');
		var scssMainFile = path.join(config.sourcesModels,model,config.varsSCSS);
		var urlMainCSS = mode.relUrl+'css/'+config.mainFileCSS;

		// page css
		var scssPageFile = path.join(pageFolder,page+'.scss');
		var urlPageCSS = '';
		var cssExist = false;
		try {
			cssExist = fs.statSync(scssPageFile);
		} catch (e) {
			cssExist = false;
		}

		if(cssExist){
			urlPageCSS = '<link rel="stylesheet" href="'+mode.relUrl+'css/'+page+'.css"/>';

			style(scssMainFile,config.sources,[pageFolder],[page],function(cssPage) {
				if(!config.dev)
					cssPage = new CleanCSS().minify(cssPage).styles;
				if(mode.type=='web'){
					config.langues.forEach(function(lang){

						fs.outputFile(config.goodUrl.url(mode.type,path.join(config.out,mode.type,model,lang,'css',page+'.css')), config.goodUrl.css(mode.type,cssPage), function (err) {
							if (err) return console.error(err);
						});
					});
				} else if(mode.type=='app') {
					fs.outputFile(config.goodUrl.url(mode.type,path.join(config.out,mode.type,model,'css',page+'.css')), config.goodUrl.css(mode.type,cssPage), function (err) {
						if (err) return console.error(err);
					});
				}
			});
		}

		// page html
		template(config.sources,tplPageFile,function(tpls){
			config.langues.forEach(function(lang){
				var localePageFile = path.join(config.sourcesPages,page,'locale',lang+'.json');
				loc(localePageFile,config.sources,function(result) {
					var pageHeader = '';
					if(tpls.pageHeader){
						pageHeader = tpl(tpls.pageHeader.content,result);
					}
					var socketIoJS = '';
					var pageHTML = '';
					if(tpls[page]){
						pageHTML = tpl(tpls[page].content,result);
						if(mode.type=='web'){
							if(config.dev)
								socketIoJS = compilLibDefault.getSocketDEvString();
						}
					}
					pageHTML = config.goodUrl.html(mode.type,pageHTML);
					pageHeader = config.goodUrl.html(mode.type,pageHeader);


					var html = `<!DOCTYPE html>
<html lang="${lang}">
<head>
<meta charset="UTF-8" />
<meta http-equiv="Content-type" content="text/html;charset=UTF-8" />
<link rel="stylesheet" href="${urlMainCSS}"/>${socketIoJS}
${urlPageCSS}
${pageHeader}
</head>
<body>
<div class="nm-pages-${page}">${pageHTML}</div>
</body>
</html>`;
					if(mode.type=='app'){
						fs.outputFile(path.join(config.out,mode.type,model,'html',lang,page+'.html'), html, function (err) {
							if (err) return console.error(err);
						});
					} else {
						fs.outputFile(path.join(config.out,mode.type,model,lang,page+'.html'), html, function (err) {
							if (err) return console.error(err);
						});

						if(lang==config.defaultLangue)
							emitMessage(page);

					}
				});
			});
		},true,false);
	},

	mainCss : function(config,mode,model,emitMessage,finish){
		var mainFile = path.join(config.sourcesModels,model,config.varsSCSS);
		var includePaths = [path.join(config.sourcesModels,model)];
		var includeFile = ['main'];
		style(mainFile,config.sources,includePaths,includeFile,function(result) {

			if(!config.dev)
				result = new CleanCSS().minify(result).styles;

			if(mode.type=='app'){

				fs.outputFile(config.goodUrl.url(mode.type,path.join(config.out,mode.type,model,'css',config.mainFileCSS)), config.goodUrl.css(mode.type,result), function (err) {
					if (err) return console.error(err);
					finish('mainCss');
				});
			} else {
				var _finish = finishLangue(config,finish);

				config.langues.forEach(function(lang){
					fs.outputFile(config.goodUrl.url(mode.type,path.join(config.out,mode.type,model,lang,'css',config.mainFileCSS)), config.goodUrl.css(mode.type,result), function (err) {
						if (err) return console.error(err);
						_finish('mainCss');
					});
					if(lang==config.defaultLangue)
						emitMessage('_all_');
				});
			}
		});
	}
};
