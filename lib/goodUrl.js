
var shortid = require('shortid');
var regCSS = /url\(\s*['"]*medias\/(.*?)['"]*\s*\)/g;
var regHTML = / (src|href)="medias\/(.*?)"/g;
var regJS = /(src|href):\s*"medias\/(.*?)"/g;

module.exports = function(prod){
	var version = '';
	if(prod=='prod')
		version = '-'+shortid.generate();
	return {
		_versionUrl : function(modeType,url){
			if(modeType=='web'){
				var v = url.split('.');
				v[v.length-2] = v[v.length-2]+version;
				return v.join('.');
			}
			return url;
		},
		css : function(modeType,content){
			var vurl = this._versionUrl;
			return content.replace(regCSS,function(capture,file){
				return "url('../medias/"+vurl(modeType,file)+"')";
			});
		},
		url : function(modeType,url){
			return this._versionUrl(modeType,url);
		},
		html : function(modeType,content){
			var vurl = this._versionUrl;
			return content.replace(regHTML,function(capture,attr,file){
				if(modeType=='app')
					return ' '+attr+'="../../medias/'+file+'"';
				return ' '+attr+'="medias/'+vurl(modeType,file)+'"';
			});
		},
		js : function(modeType,content){
			var vurl = this._versionUrl;
			return content.replace(regJS,function(capture,attr,file){
				console.log(capture,attr,file);
				if(modeType=='app')
					return ' '+attr+'="../../medias/'+file+'"';
				return ' '+attr+'="medias/'+vurl(modeType,file)+'"';
			});
		}
	}
};
