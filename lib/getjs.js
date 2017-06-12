
const Module = require('module');
const fs = require('fs');
const reload = require('require-reload')(require);
const	logger = require('./logger');

module.exports = function(file,config){
	var js = {};
	var nameFile = file.substring(config.sources.length+1);
	if(!config.dev){
		try {
			js = reload(file);
		} catch (err) {
			var x = err.stack.split('\n');
			logger.msg([{b_red:'Error: '},{blue:nameFile},{b_blue:' '+x[3]}]);
		}
		return js;
	} else {
		var content;
		try {
			content = fs.readFileSync(file,'utf8');
		} catch (err) {
			var x = err.stack.split('\n');
			logger.msg([{b_red:'Error: '},{blue:nameFile},{b_blue:' '+x[3]}]);
			return js;
		}

		var cl = 0;
		content = content.replace(/(\n)/gm,function(){
			cl++;
			return `//[${cl}|${nameFile}]\n`;
		});
		try {
			var Module = module.constructor;
			var m = new Module();
			m._compile(content, '');
			js = m.exports;
		} catch (err) {
			var x = err.stack.split('\n');
			logger.msg([{b_red:'Error: '},{blue:nameFile},{b_blue:' '+x[3]}]);
		}
		return js;
	}
};
