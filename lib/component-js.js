const toSourceFnc = require('tosource');
const nConvert = require('./name-convert');
const	getJS = require('./getjs');
module.exports = function(jsName,jsFile,config){
	var js = getJS(jsFile,config);
	var jspublic = '';
	var match = null;
	if(js.public){
		jspublic = 'var '+nConvert.kebabTocamel(jsName)+' = '+toSourceFnc(js.public)+';';
		delete js.public;
	}

	if(js.match){
		match = js.match;
		delete js.match;
	}

	return {
		public : jspublic,
		private : js,
		match:match
	}
};
