module.exports = {
	// public : {},
	private : {
		dialog : true,
		mode :'alert',
		events : {
			'module-dialog' : {
				'ok' : {
					click : function(e){
						this.dialog.hide();
					}
				}
			}
		},
		init : function(data){
			console.log(data);
		}
	}
};
