// all remove
const path = require('path');
const fs = require('fs-extra');

module.exports = {
	medias : function(config,mode,model,medias,emitMessage) {
		if(mode.type=='app'){
			var outMedias = path.join(config.out,mode.type,model,'medias');
			medias.forEach(function(media) {
				var outFile = path.join(outMedias,media);
				fs.remove(outFile, function (err) {
					if (err) return console.error(err);
				});
			});
		} else {
			config.langues.forEach(function(lang){
				var outMedias = path.join(config.out,mode.type,model,lang,'medias');
				medias.forEach(function(media) {
					var outFile = path.join(outMedias,media);
					fs.remove(outFile, function (err) {
						if (err) return console.error(err);
					});
				});
				if(lang==config.defaultLangue)
					emitMessage('_all_');
			});
		}
	}
};
