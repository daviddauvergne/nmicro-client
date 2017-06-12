module.exports = function(type){
	if(type=='app'){
		return {
			type : 'app',
			relUrl : '../../'
		};
	}
	return {
			type : 'web',
			relUrl : ''
	};
};
