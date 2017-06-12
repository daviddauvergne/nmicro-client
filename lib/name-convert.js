module.exports = {
	kebabTocamel : function(str){
		return str.replace(/-(\w)/gi,function(x){
			return x[1].toUpperCase();
		});
	}
};
