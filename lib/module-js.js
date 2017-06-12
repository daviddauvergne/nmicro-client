const toSourceFnc = require('tosource');
const nConvert = require('./name-convert');
const	getJS = require('./getjs');
module.exports = function(jsName,jsFile,config){
	var js = getJS(jsFile,config);

	var jspublic = '';
	var match = {};
	var events = {};
	if(js.public){
		jspublic = 'public.'+nConvert.kebabTocamel(jsName)+' = '+toSourceFnc(js.public)+';';
	}
	if(js.private && js.private.match){
		match = js.private.match;
		delete js.private.match;
	}
	if(js.private && js.private.events){
		events = js.private.events;
		delete js.private.events;
	}

	return {
		public : jspublic,
		private : js.private,
		match:match,
		events:events
	}
};
