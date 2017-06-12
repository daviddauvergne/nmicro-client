
module.exports = {
	default : {
		app : {
			dev : `
			// default app dev
			window.NMICRO_WEB_SERVER_URL = 'http://localhost:8080/';
			`,

			prod : `
			// default app prod
			window.NMICRO_WEB_SERVER_URL = 'http://www.domain.com/';
							`
		},
		web : {
			dev : `
			// default web dev
			window.NMICRO_WEB_SERVER_URL = 'http://localhost:8080/';
			`,

			prod : `
			// default web prod
			window.NMICRO_WEB_SERVER_URL = 'http://www.domain.com/';
			`
		}
	}
};
