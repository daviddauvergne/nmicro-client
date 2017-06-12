module.exports = {
	//object publique pour le composant
	public : {

	},
	match : {
		line : {
			value:{el:'v'}
		},
		inside : {
			foo:{selector:"span[el='content'] > span:last-child",attribute:'bar'}
		}
	},
	// DOM actions
	dom : {
		insert : function(e){
			console.log('DOM insert component line');
		},
		create : function(e){
			console.log('DOM create component line');
		},
		remove : function(e){
			console.log('DOM before remove component line');
		},
		contentInsert : function(){
			console.log("DOM contentInsert component line");
		}
	},
	// méthodes
	methods : {
		insert : function(val){
			this.rend({'value':val});
		}
	},
	// Évènements
	events : {
		click : function(e){
			e.preventDefault();
			var time = new Date().getTime();
			this.rend('inside',{foo:time});
		}
	},
	// attributs
	attributes : {
		value : {
			set : function(val){
				this.insert(val);
			}
		}
	}
};
