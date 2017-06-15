module.exports = {

	// url pour window.NMICRO_WEB_SERVER_URL = 'http://...'; défini dans setting.js
	url : 'NMICRO_WEB_SERVER_URL',

	// shéma des différentes routes
	schema : {
		// nom de route
		testRoute : {
			// requête
			req :{
				// method get,post,put,del
				method : 'post',
				// url de la route ex: /foo/bar
				url : '/foo/bar',

				// responseType
				// responseType : 'blob',

				// headers
				// headers : [{name:'accept-version',value:"~2"}],

				// ajout automatique du JSON Web Token (header Authorization)
				// setJWT : true

				// Sauvegarde automatique du JWT envoyé, le nom de la clé retourné à la valeur de getJWT (ici : JWT)
				// getJWT : 'JWT'

			},
			// traitement des réponses pour cette route
			// res : {
			// 	http_200 : function(data){
			// 		console.log(data);
			// 	},
			// 	http_500 : function(data){
			// 		console.log(data);
			// 	}
			// }
		}
	},

	// réponses par défault assignées à toutes les routes
	res : {
		http_error : function(code,data){
			console.log(code,data);
		},
		http_400 : function(code,data){
			console.log(code,data,LC.api.web.BadRequestError);
		},
		http_404 : function(code,data){
			console.log(code,data,LC.api.web.NotFoundError);
		}
	}
};
