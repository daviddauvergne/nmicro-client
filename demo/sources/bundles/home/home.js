module.exports = {

	// le bundle est l'élément de base
	// il va donné lieu à création d'une page html du même nom
	// home.js -> home.html

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
	modules : ['module-simple','module-dialog'],

	// liste des composants dont depend le bundle
	components : [],

	// liste des API dont depend le bundle
	apis : [],

	// ------------------------------------------------------------------
	// données/fonctions publiques
	public : {
		functionYY : function(){
			console.log('--------------------------------------------');
			console.log('Value from bundle "home" public !!!');
			//	acces a la partie privé du bundle
			console.log(this.private.valueXX);
		}
	},

	// ------------------------------------------------------------------
	// données/fonctions privées
	private : {

		// valeur privée
		valueXX : 'Value from bundle "home" private !!!',

		// match for multi-templates
		match : {
			'home-multiTemplates' : {
				link: {el:'img',attribute:'src',replace:'medias/{{value}}.png'}
			}
		},

		// Évènements assigné au éléments
		// pour un template (ici: home), nous avons des groupes d'évènements (ici; test-private, test-public...)
		// chaque groupe contient sa liste d'évènements à assigner.
		// L'assignation s'effectue depuis le template quand un élément comporte l'attibut evt="nom du groupe d'évènements" (ex: evt="test-private")
		events : {
			home : {
				'test-private' : {
					click : function(e){
						console.log(this.valueXX);
					}
				},
				'test-public' : {
					click : function(e){
						// accès à une donnée/fonction publique
						public.home.functionYY();
					}
				},
				'test-multiTemplates' : {
					click : function(e){
						this.rend('home-multiTemplates',[
							{title:'- Z -',link:'z'},
							{title:'- Y -',link:'y'}
						]);
					}
				},
				'test-dialog' : {
					click : function(e){
						// affichage du dialogue 'module-dialog'

						// Object de rendu
						// la clé sans passer par match correspond à la
						// valeur de l'attribut 'el' d'un élément : <h1 el="title"></h1>
						// la valeur est assigné comme contenu de l'élément : <h1 el="title">value</h1>

						var dataRend = {
							'title':   this.locale.dtitle,// this.locale renvoie les locales du bundle
							'message': this.locale.dmessage
						};

						// données envoyées à la fonction d'initialisation du dialogue
						var data = 'data to dialog from bundle home';

						this.rend('module-dialog',dataRend,data);
					}
				},
				'test-module-simple' : {
					click : function(e){
						// rendu du module-simple sans object de rendu ni data
						this.rend('module-simple');
					}
				}
			}
		},

		init : function(){// Initialisation du bundle


		},
		// scenaridev est un tableau permettant de chainer différentes actions
		// pour accélérer le dévellopement

		// la première fonction est lancée après le init du bundle
		// les autres fonction sont lancées après le "rend" puis le init d'un module

		// scenaridev : [
		// 	function(){
		// 		console.log('__________________ scenaridev ____________________');
		// 		console.log('_________________ module-simple __________________');
		//
		// 		this.rend('module-simple');
		// 	},
		// 	function(){
		// 		console.log('____________________ api.web _____________________');
		// 		var me = this;
		// 		var dataPost = {'txt':'scenaridev'};
		//
		// 		// match to DOM
		// 		$util.match(this.els.form,{match:{
		// 			txt : {selector:'input[name="txt"]',propertie:'value'}
		// 		}},'scenari',dataPost);
		//
		// 		api.web.testRoute({
		// 			data : dataPost,
		// 			res : {
		// 				http_200 : function(data){
		// 					console.log('Response server',data);
		// 					me.rend('module-simple-line',data);
		// 				}
		// 			}
		// 		});;
		// 	},
		// 	function(){
		// 		console.log('___________________ click line ___________________');
		// 		document.querySelector('line').dispatchEvent(new Event('click'));
		// 		console.log('_________________ module-dialog __________________');
		// 		var dataRend = {
		// 			'title':LC.bdl.dtitle,
		// 			'message':LC.bdl.dmessage
		// 		};
		// 		var data = 'data to dialog from scenaridev';
		// 		this.rend('module-dialog',dataRend,data);
		// 	}
		// ]
	}
};
