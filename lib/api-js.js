const toSourceFnc = require('tosource');
const nConvert = require('./name-convert');
const	getJS = require('./getjs');
module.exports = function(jsName,jsFile,config){
	var js = getJS(jsFile,config);
	var jspublic;
	var newObj = {n:''};
	for (var key in js) {
		switch (key) {
			case 'url':
			break;
			case 'res':
				newObj.__res = toSourceFnc(js.res);
			break;
			case 'schema':
				newObj.__schema = toSourceFnc(js.schema);
			break;
			default:
				newObj.n = `${key} : ${toSourceFnc(js[key])},`;
			break;
		}
	}

	jspublic = `${jsName} : {
		__url: window.${js.url},
		__res: ${newObj.__res},
		__schema: ${newObj.__schema},
		${newObj.n}
	},
	`;

	return {
		public : jspublic
	}
};
