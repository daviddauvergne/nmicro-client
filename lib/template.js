const fs = require('fs');
const jsonml = require('./jsonml');
const toSourceFnc = require('tosource');
const path = require('path');
const marked = require('marked');
marked.setOptions({
	highlight: function (code) {
		return require('highlight.js').highlightAuto(code).value;
	}
});

var er_template_g = /<template([^>]*)>([\s\S]*?)<\/template>/g;
var er_template_s = /<template([^>]*)>([\s\S]*?)<\/template>/;

var _getTpl = function (sourcesFolder,file, script, nojsonml, toSource ) {

	var s = script.match(er_template_s);

	var attributes = (s[1].trim()).split(' ');

	var id = null;
	var tabTPL = {};

	var name = path.basename(file, '.tpl');

	attributes.forEach(function(attrs) {
		var vk = attrs.split('=');
		if(vk.length>1){
			if(vk[0]=='id'){
				id = vk[1].substr(1,vk[1].length-2);
			} else {
				tabTPL[vk[0]] = vk[1].substr(1,vk[1].length-2);
			}
		}
	});

	if(name!=id && id!='bundleHeader' && id!='pageHeader'){
		nojsonml = false;
	}

	if(nojsonml){
		tabTPL.content = s[2];
		if(tabTPL.type){
			if(tabTPL.type=='markdown'){
				tabTPL.content = marked(tabTPL.content);
			}
		}
	} else {
		tabTPL.content = jsonml(sourcesFolder,file, s[2]);
		if(toSource){
			tabTPL.content = JSON.stringify(tabTPL.content);
		}
	}

	return {id:id,content:tabTPL};
};

var loadTemplate = function (sourcesFolder, file, templates, nojsonml, toSource ) {
	var tpls = {};
	var tab = templates.match(er_template_g);
	if(tab){
		tab.forEach(function(_script,index) {
			var _tpl = _getTpl(sourcesFolder,file,_script,nojsonml,toSource);
			if(_tpl.id===undefined)
				_tpl.id = index;
			tpls[_tpl.id] = _tpl.content;
		});
		return tpls;
	}
	return null;
};

module.exports = function(sourcesFolder,file,callback,nojsonml,toSource){
	fs.readFile(file, 'utf8', function (err,data) {
		if (err) {
			// log error
			return callback(null);
		}
		callback(loadTemplate(sourcesFolder,file,data,nojsonml,toSource));
	});
};
