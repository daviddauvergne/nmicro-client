module.exports = {

	// url pour window.NMICRO_WEB_SERVER_URL = 'http://xxxxx'; défini dans setting.js
	url : 'NMICRO_WEB_SERVER_URL',

	// shéma des différentes routes
	schema : {
		// nom de route
		testRoute : {
			// requête
			req :{
				// method get,post,put,del
				method : 'post',
				// content-type
				// contentType : 'application/json',
				// url de la route ex: /foo/bar
				url : '/test/route',
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
			$dia('module-dialog').show({
				'title':'ERROR '+code,
				'message':code.message
			});
		},
		http_400 : function(code,data){
			$dia('module-dialog').show({
				'title':'ERROR 400',
				'message':LC.api.web.BadRequestError}
			);
		}
	}
};
