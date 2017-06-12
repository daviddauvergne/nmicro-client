module.exports = {

	// ------------------------------------------------------------------
	// dépendances

	// liste des modules dont depend le module
	// modules : [],

	// liste des composants dont depend le module
	components : ['line'],

	// liste des API dont depend le module
	apis : ['web'],

	public : {
		functionYY : function(){
			console.log('--------------------------------------------');
			console.log('Value from module "module-simple" public !!!');
			//	acces a la partie privé du module
			console.log(this.private.valueXX);
		}
	},

	private : {

		valueXX : 'Value from module "module-simple" private !!!',

		events : {
			'module-simple' : {
				'form' : {
					submit : function(e){
						e.preventDefault();
						if(this.els.form.checkValidity()){
							var data = new FormData(this.els.form);
							// requête via la route testRoute
							this.api('web','testRoute',{
								data : data,
								res : {
									http_200 : function(data){
										// data {key : 'xxxxx'}
										console.log('Server response:',data);

										// data est matché pour le rendu (voir math['module-simple-line'])
										this.rend('module-simple-line',data);
									}
								}
							});
						}
					}
				}
			}
		},

		match : {
			// match template module-simple-line
			'module-simple-line' : {
				// pour assigner la clé 'key' de data

				// 1) recherche de l'élément
				//  - selector : CSS selector depuis l'overlay
				//  - selectorAll : CSS selector depuis l'overlay
				//  - el : sélection de l'élément avec l'attribut el="..."
				// 	- par default : si le template contient un élément avec el="key" (même clé que data)

				// 2) partie de l'élément à assigner
				// 	- attribute : nom de l'attribut (ex: name -> <x name="data[key]"></x>)
				// 	- propertie : nom de propriété : (ex: name -> x.name = data[key] )
				// 	- position : beforebegin -<p>- afterbegin - beforeend -</p>- afterend
				// 	- par default : <x>data[key</x>

				// 3) remplacement
				// templating pour remplacer la valeur dans un string 'xxx{{value}}yyyy'

				// 4) function
				// function:function(element,value){...}

				'key': {selector:'line:last-child',attribute:'value'}
			}
		},
		init : function(){
			// acces à la fonction public de home
			public.home.functionYY();
			// acces à la fonction public de module-simple
			public.moduleSimple.functionYY();
		}
	}
};
