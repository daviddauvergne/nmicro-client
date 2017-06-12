module.exports = {
	// public
	public : {},

	// DOM actions
	dom : {
		insert : function(e){
			console.log('DOM insert component xxx');
		},
		create : function(e){
			console.log('DOM create component xxx');
		},
		remove : function(e){
			console.log('DOM before remove component xxx');
		},
		contentInsert : function(){
			console.log("DOM contentInsert component xxx");
		},
	},
	// methods
	methods : {
		foo : function(){
			console.log('foo method xxx');
		}
	},
	// Events
	events : {
		click : function(e){
			e.preventDefault();
			console.log('Click xxx');
		}
	},
	// attributes
	attributes : {
		value : {
			set : function(val){
				this._value = val;
				console.log(val);
			},
			get :function(){
				return this._value;
			}
		}
	},
	// properties
	properties : {
		y : {
			set : function(val){
				console.log(val);
			},
			get :function(){
				return this.y;
			}
		}
	},
	// macth component rend
	match:{}
};
