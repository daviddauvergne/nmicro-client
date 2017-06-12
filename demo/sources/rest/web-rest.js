
// script de requête basé sur le package restify <http://restify.com/>
// pour créer simplement des réponses serveurs
module.exports = {
	"/test/route" : function(req, res, next, restify){

		res.send({
			"key" : req.params.txt
		});

		return next();
		// Erreurs <http://restify.com/#error-handling>
		// tester une erreur 400
		// return next(new restify.BadRequestError('Bad Request'));
	}
};
