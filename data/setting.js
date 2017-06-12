module.exports = {
	// model
	default : {
		// out app
		app : {
			// mode dev
			dev : `
			// default app dev
			window.NMICRO_WEB_SERVER_URL = 'http://localhost:8080/';
			`,
			// mode prod
			prod : `
			// default app prod
			window.NMICRO_WEB_SERVER_URL = 'http://www.domain.com/';
							`
		},
		// out app
		web : {
			// mode dev
			dev : `
			// default web dev
			window.NMICRO_WEB_SERVER_URL = 'http://localhost:8080/';
			`,
			// mode prod
			prod : `
			// default web prod
			window.NMICRO_WEB_SERVER_URL = 'http://www.domain.com/';
			`
		}
	}
};
