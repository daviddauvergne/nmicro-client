// script de requête basé sur le package restify <http://restify.com/>
// pour créer simplement des réponses serveurs
module.exports = {
	"/test-route" : function(req, res, next, restify){

		var params = req.params;

		res.send({
			"the_response" : 42
		});

		return next();
		// Erreurs <http://restify.com/#error-handling>
		// tester une erreur 400
		// return next(new restify.BadRequestError('Bad Request'));
	}
};
