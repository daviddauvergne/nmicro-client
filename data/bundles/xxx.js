module.exports = {

	// Bundle xxx
	// xxx.html

	// ------------------------------------------------------------------
	// Restriction

	// Restriction imposée, afin que le bundle soit présent dans un seul
	// mode de sortie 'app' or 'web'. Par défault le bundle na aucune
	// restriction et donc est présent dans les deux modes de sortie.
	// Le mode est accesible en JS via : window.MODE

	// restriction : 'web',

	// ------------------------------------------------------------------
	// dépendances

	// liste des modules dont depend le bundle
	modules : [],

	// liste des composants dont depend le bundle
	components : [],

	// liste des API dont depend le bundle
	apis : [],

	// ------------------------------------------------------------------
	// public object
	public : {

	},

	// ------------------------------------------------------------------
	// private object
	private : {
		// match for multi-templates
		match : {},

		// Events
		events : {
			'xxx' : {

			}
		},

		// bundle initialisation
		init : function(){
			console.log('xxx');
		},
		// scenaridev est un tableau permettant de chainer différentes actions
		// pour accélérer le dévellopement

		// la première fonction est lancée après le init du bundle
		// les autres fonction sont lancées après le "rend" puis le init d'un module
		// scenaridev : [
		// 	function(){
		// 		console.log('__________________ scenaridev ____________________');
		// 	},
		// 	function(){
		//
		// 	}
		// ]
	}
};
