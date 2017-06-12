const toSourceFnc = require('tosource');
const path = require('path');
const	getJS = require('./getjs');
const nConvert = require('./name-convert');
module.exports = function(jsName,jsFile,config){
	var js = getJS(jsFile,config);

	var jspublic = '';
	var components = [];
	var modules = [];
	var apis = [];
	var restriction = null;
	var match = {};
	var events = {};
	if(js.components){
		components = js.components;
	}
	if(js.apis){
		apis = js.apis;
	}
	if(js.modules){
		var getDep = function(module){
			if(modules.indexOf(module)==-1){
				modules.push(module);
				var moduleFile = path.join(config.sourcesModules,module,module+'.js');
				var _js = getJS(moduleFile,config);

				if(_js.components)
					components = Array.from(new Set(components.concat(_js.components)));

				if(_js.apis)
					apis = Array.from(new Set(apis.concat(_js.apis)));

				if(_js.modules){
					_js.modules.forEach(function(m){
						getDep(m);
					});
				}
			}
		};

		js.modules.forEach(function(module){
			getDep(module);
		});
	}

	var file = path.parse(jsFile);

	if(jsName!=file.name)
		jsName = file.name;

	if(js.public){
		jspublic = 'public.'+nConvert.kebabTocamel(jsName)+' = '+toSourceFnc(js.public)+';';
	}

	if(js.restriction && (js.restriction=='app' || js.restriction=='web'))
		restriction = js.restriction;

	if(js.private && js.private.match){
		match = js.private.match;
		delete js.private.match;
	}

	if(js.private && js.private.events){
		events = js.private.events;
		delete js.private.events;
	}

	return {
		restriction : restriction,
		components : components,
		modules: modules,
		apis:apis,
		public : jspublic,
		private : js.private,
		match:match,
		events:events
	}
};
