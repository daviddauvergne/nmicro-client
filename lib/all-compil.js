

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

var regMedias = / (src|href)="medias\//g;
var regMediasJS = /(src|href):\s*"medias\//g;

module.exports = {
	bundle : function(config,mode,model,bundleName,emitMessage){
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
					fs.outputFile(path.join(config.out,mode.type,model,'css',bundleName+'.css'), data.css, function (err) {
						if (err) return console.error(err);
					});
					data.js = data.js.replace(regMediasJS,' $1:"'+mode.relUrl+'medias/');
					fs.outputFile(path.join(config.out,mode.type,model,'js',bundleName+'.js'), data.js, function (err) {
						if (err) return console.error(err);
					});
				}

				var urlBdlCSS = mode.relUrl+'css/'+bundleName+'.css';
				var urlBdlJS = mode.relUrl+'js/'+bundleName+'.js';
				var urlMainCSS = mode.relUrl+'css/'+config.mainFileCSS;
				var urlMainJS = mode.relUrl+'js/'+config.mainFileJS;

				config.langues.forEach(function(lang){

					if(mode.type=='web'){
						if(!config.dev)
							data.css = new CleanCSS().minify(data.css).styles;

						fs.outputFile(path.join(config.out,mode.type,model,lang,'css',bundleName+'.css'), data.css, function (err) {
							if (err) return console.error(err);
						});

						fs.outputFile(path.join(config.out,mode.type,model,lang,'js',bundleName+'.js'), data.js, function (err) {
							if (err) return console.error(err);
						});
					}

					var bundleHTML = data.bundleHTML;
					var bundleHeader = data.bundleHeader;
					if(data.localeBdl!==undefined && data.localeBdl[lang]!==undefined){
						bundleHTML = tpl(data.bundleHTML,data.localeBdl[lang]);
						bundleHeader = tpl(data.bundleHeader,data.localeBdl[lang]);
					 }
					 if(mode.type=='app'){
						 bundleHTML = bundleHTML.replace(regMedias,' $1="'+mode.relUrl+'medias/');
						 bundleHeader = bundleHeader.replace(regMedias,' $1="'+mode.relUrl+'medias/');
					 }

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

					var html = `<!DOCTYPE html>
<html lang="${lang}">
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
						});
					} else {
						fs.outputFile(path.join(config.out,mode.type,model,lang,bundleName+'.html'), html, function (err) {
							if (err) return console.error(err);
						});
						if(lang==config.defaultLangue)
							emitMessage(bundleName);
					}
				});
			}
		});
	},

	lib : function(config,mode,model,emitMessage){
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
				fs.outputFile(path.join(config.out,mode.type,model,'js',config.mainFileJS), modeModelData, function (err) {
					if (err) return console.error(err);
				});
			} else {
				config.langues.forEach(function(lang){
					fs.outputFile(path.join(config.out,mode.type,model,lang,'js',config.mainFileJS), modeModelData, function (err) {
						if (err) return console.error(err);
					});
					if(lang==config.defaultLangue)
						emitMessage('_all_');
				});
			}
		});
	},

	medias : function(config,mode,model,medias,emitMessage) {
		var sourcesMedias = path.join(config.sourcesModels,model,'medias');

		if(mode.type=='app'){
			var outMedias = path.join(config.out,mode.type,model,'medias');
			fs.mkdirs(outMedias, function (err) {
				medias.forEach(function(media) {
					var sourceFile = path.join(sourcesMedias,media);
					var outFile = path.join(outMedias,media);
					fs.copy(sourceFile, outFile, function (err) {
						if (err) return console.error(err);
					});
				});
			});
		} else {
			config.langues.forEach(function(lang){
				var outMedias = path.join(config.out,mode.type,model,lang,'medias');
				fs.mkdirs(outMedias, function (err) {
					medias.forEach(function(media) {
						var sourceFile = path.join(sourcesMedias,media);
						var outFile = path.join(outMedias,media);
						fs.copy(sourceFile, outFile, function (err) {
							if (err) return console.error(err);
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
						fs.outputFile(path.join(config.out,mode.type,model,lang,'css',page+'.css'), cssPage, function (err) {
							if (err) return console.error(err);
						});
					});
				} else if(mode.type=='app') {
					fs.outputFile(path.join(config.out,mode.type,model,'css',page+'.css'), cssPage, function (err) {
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
						if(mode.type=='app'){
							pageHTML = pageHTML.replace(regMedias,' $1="'+mode.relUrl+'medias/');
							pageHeader = pageHeader.replace(regMedias,' $1="'+mode.relUrl+'medias/');
						} else {
							if(config.dev)
								socketIoJS = compilLibDefault.getSocketDEvString();
						}
					}

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

	mainCss : function(config,mode,model,emitMessage){
		var mainFile = path.join(config.sourcesModels,model,config.varsSCSS);
		var includePaths = [path.join(config.sourcesModels,model)];
		var includeFile = ['main'];
		style(mainFile,config.sources,includePaths,includeFile,function(result) {

			if(!config.dev)
				result = new CleanCSS().minify(result).styles;

			if(mode.type=='app'){
				fs.outputFile(path.join(config.out,mode.type,model,'css',config.mainFileCSS), result, function (err) {
					if (err) return console.error(err);
				});
			} else {
				config.langues.forEach(function(lang){
					fs.outputFile(path.join(config.out,mode.type,model,lang,'css',config.mainFileCSS), result, function (err) {
						if (err) return console.error(err);
					});
					if(lang==config.defaultLangue)
						emitMessage('_all_');
				});
			}
		});
	}
};