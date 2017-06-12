const dir = require('node-dir');
var er_dev = /\t*\/\/\s*<DEV>[\s\S]*?\s*<\/DEV>\n/gm;
var er_prod = /\t*\/\/\s*<PROD>[\s\S]*?\s*<\/PROD>\n/gm;

module.exports = function(config,callback){
	var libString = config.setting;
	var erg;
	if(config.dev){
		erg = er_prod;
	} else {
		erg = er_dev;
	}
	dir.readFiles(config.sourcesLib,
		function(err, content, filename, next) {
				var fileExtention = filename.substring(filename.lastIndexOf('.')+1);
				if(fileExtention=='js'){
					if(config.dev){
						var nameFile = filename.substring(config.sources.length);
						var cl = 0;
						content = content.replace(/(\n)/gm,function(){
							cl++;
							return `//[${cl}|${nameFile}]\n`;
						});
					}
					libString += content.replace(erg,"");
				}
				next();
		},
		function(err, files){
			if (err) {
				console.log(err);
				return callback(null);
			}
			return callback(libString);
		}
	);
};
