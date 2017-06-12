module.exports = {

	// module xxx

	// ------------------------------------------------------------------
	// dépendances

	// liste des modules dont depend le module
	modules : [],

	// liste des composants dont depend le bundle
	components : [],

	// ------------------------------------------------------------------
	// données/fonctions publiques
	public : {

	},

	// ------------------------------------------------------------------
	// données/fonctions privées
	private : {
		// module is dialog
		// dialog : true,

		// dialog mode
		// mode :'alert'

		// match for this module and multi-templates
		// match : {},

		// Events
		events : {
			'xxx' : {

			}
		},

		// Initialisation du module
		init : function(){
			console.log('xxx');
		}
	}
};
