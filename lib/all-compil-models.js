
//commpli all models
const compil = require('./all-compil');
const path = require('path');
const fs = require('fs-extra');
var getMode = require('./mode');
var dir = require('node-dir');

module.exports = function(config,emitMessage,final){

	var loopLength = config.models.length*config.modes.length;
	var pagesLength = loopLength*config.pages.length;
	var bundlesLength = loopLength*config.bundles.length;

	var puts = pagesLength+bundlesLength+(loopLength*3);
	putsCount = 0;
	var toPuts = function(whois){
		putsCount++;
		if(putsCount==puts && final!==undefined)
			final();
	};

	fs.emptyDir(config.out, function (err) {

		config.models.forEach(function(model){

			config.modes.forEach(function(_mode){
				var mode = getMode(_mode);

				// lib
				compil.lib(config,mode,model,emitMessage,toPuts);

				// mainCss
				compil.mainCss(config,mode,model,emitMessage,toPuts);

				// pages
				config.pages.forEach(function(page){
					compil.pages(config,mode,model,page,emitMessage,toPuts);
				});

				// bundles
				config.bundles.forEach(function(bundleName){
					compil.bundle(config,mode,model,bundleName,emitMessage,toPuts);
				});

				// medias
				var mediasDir = path.join(config.sourcesModels,model,'medias');
				dir.files(mediasDir, function(err, files) {
					if (err) throw err;
					var mediasFiles = [];
					files.forEach(function(file) {
						mediasFiles.push(file.substring(mediasDir.length+1));
					});
					if(mediasFiles.length>0)
						compil.medias(config,mode,model,mediasFiles,emitMessage,toPuts);
				});
			});
		});
	});
};
