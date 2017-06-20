window.$load = (function() {

	var queryString  = function ( method, data ) {
		var result = [];
		for (var key in data) {
			result.push(encodeURIComponent(key) + '=' + encodeURIComponent(data[key]));
		}
		var txt = result.join( "&" ).replace( /%20/g, "+" );
		if(txt=='')
			return null;
		return '?' + txt;
	};

	return function (scope, properties) {
		var xhr = new XMLHttpRequest();

		xhr.onreadystatechange = function() {
			if ( xhr.readyState === 4 ) {
				var contType = xhr.getResponseHeader("Content-Type");
				var result;
				if(contType=='application/json' && !xhr.responseType){
					result = JSON.parse(xhr.responseText);
					if(properties.req.getJWT && result[properties.req.getJWT])
						sessionStorage.JWT = result[properties.req.getJWT];
				} else {
					result = xhr.response;
				}
				if ( ( xhr.status === 200 ) || ( ( xhr.status === 0 ) && xhr.response ) ) {
					if(properties.res.http_200){
						properties.res.http_200.apply(scope,[result]);
					} else if(properties.res.default.http_200){
						properties.res.default.http_200.apply(scope,[result]);
					}
				} else {
					//<DEV>
					if(window.MODE == 'web'){
						var tmp = {code:null,message:null};
						if(result)
							tmp = result;
						socket.emit('console', { type: 'error', arguments: [xhr.status, tmp.code, tmp.message]});
					}
					//</DEV>
					if(properties.res['http_'+xhr.status]){
						properties.res['http_'+xhr.status].apply(scope,[xhr.status,result]);
					} else if(properties.res.default['http_'+xhr.status]){
						properties.res.default['http_'+xhr.status].apply(scope,[xhr.status,result]);
					} else if (properties.res.http_error) {
						properties.res.http_error.apply(scope,[xhr.status,result])
					} else {
						properties.res.default.http_error.apply(scope,[xhr.status,result]);
					}
				}
			}
		};
		var auth = function(){
			if(properties.req.setJWT && sessionStorage.JWT)
				xhr.setRequestHeader("Authorization", sessionStorage.JWT);
		};

		if(properties.req.upload){
			var progress = document.querySelector(properties.req.upload);
			xhr.upload.addEventListener('progress', function(e) {
				if(progress){
					progress.value = e.loaded;
					progress.max = e.total;
				}
			});
		}
		if(properties.req.headers){
			propertiesreq.req.headers.forEach(function(head){
				xhr.setRequestHeader(head.name, head.value);
			});
		}
		if(properties.req.responseType){
			xhr.responseType = properties.req.responseType;
		}

		if(properties.req.method=='GET'){
			xhr.open("GET",properties.req.url + queryString('GET',properties.data));
			auth();
			xhr.send();
		} else {
			xhr.open(properties.req.method, properties.req.url , true);
			auth();
			if(properties.data && properties.data instanceof FormData===false && typeof properties.data == 'object')
				properties.data = $util.objToFormData(properties.data);

			xhr.send(properties.data);
		}
	};
})();
