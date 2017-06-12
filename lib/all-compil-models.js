
//commpli all models
const compil = require('./all-compil');
const path = require('path');
const fs = require('fs-extra');
var getMode = require('./mode');
var dir = require('node-dir');

module.exports = function(config,emitMessage){
	fs.emptyDir(config.out, function (err) {

		config.models.forEach(function(model){

			config.modes.forEach(function(_mode){
				var mode = getMode(_mode);

				// lib
				compil.lib(config,mode,model,emitMessage);

				// mainCss
				compil.mainCss(config,mode,model,emitMessage);

				// pages
				config.pages.forEach(function(page){
					compil.pages(config,mode,model,page,emitMessage);
				});

				// bundles
				config.bundles.forEach(function(bundleName){
					compil.bundle(config,mode,model,bundleName,emitMessage);
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
						compil.medias(config,mode,model,mediasFiles,emitMessage);
				});
			});
		});
	});
};
