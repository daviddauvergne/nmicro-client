document.addEventListener( "DOMContentLoaded",function(){
	window.$bundles = (function(bundlesTmp) {

		var _load = function(data){

			var bdl = {};
			var api = function(name,route,data){
				APIS[name][route](this,data);
			};
			var rend = function(tplName,data,values){
				if(bdl[tplName]){
					if(bdl[tplName].dialog){
						$dia(tplName).show(data,values);
					} else {
						var overlayEl = document.querySelector(bdl[tplName].overlay);

						var nbData = 1;
						var isarray = false;
						if(data && Array.isArray(data)){
							isarray = true;
							nbData = data.length;
						}

						for (var i = 0; i < nbData; i++) {
							var nBdl = window.$util.cloneObject(bdl[tplName]);
							nBdl.els = {};
							nBdl.toDomNodes(overlayEl,nBdl);

							var d;
							if(isarray)
								d = data[i];
							else if(data)
								d = data;

							if(typeof d=='object')
								window.$util.match(overlayEl,nBdl,tplName,d);

							//<DEV>
							if(window.___dev && nBdl.___init && i==0)
								nBdl.___init(window.___dev);
							else if(nBdl.init)
								nBdl.init(values);
							//</DEV>
							//<PROD>
							if(nBdl.init)
								nBdl.init(values);
							//</PROD>
						}
					}
				} else {
					console.log('Rend error: '+tplName+' does not exist, check the name or dependencies');
				}
			};

			for (var n in data.templates){
				var nCamel = window.$util.toCamelCase(n);
				if(data.templates[n].content)
					bdl[n] = data.templates[n].content;
				else
					bdl[n] = [];

				bdl[n].name = n;
				bdl[n].locale = {};
				for(var k in data.templates[n]){
					if(k!='content'){
						bdl[n][k] = data.templates[n][k];
					}
				}
				if(bdl[n].dialog){
					$dia(n).assignTPL(bdl[n]);
					if(bdl[n].init)
						$dia(n).init = bdl[n].init;
				}

				if (LC.md[nCamel]) {
					bdl[n].locale = LC.md[nCamel];
				} else if (bdl[n].ref) {
					bdl[n].locale = LC[bdl[n].type][window.$util.toCamelCase(bdl[n].ref)];
				}

				bdl[n].rend = rend;
				bdl[n].api = api;

				if(bundlesTmp[nCamel]){
					bundlesTmp[nCamel].private = bdl[n];
				}
			}

			bdl[data.name].els = {};
			[].forEach.call(document.querySelectorAll('*[elbdl]'), function(el) {
				bdl[data.name].els[window.$util.toCamelCase(el.getAttribute('elbdl'))] = el;
			});
			[].forEach.call(document.querySelectorAll('*[evtbdl]'), function(el) {
				var evt = el.getAttribute('evtbdl');
				if(evt && bdl[data.name].events && bdl[data.name].events[evt]){
					for (var e in bdl[data.name].events[evt])
						el.addEventListener(e, bdl[data.name].events[evt][e].bind(bdl[data.name]), false);
				}
			});

			if(LC.bdl){
				bdl[data.name].locale = LC.bdl;
			}

			//<DEV>
			if(bdl[data.name].scenaridev && bdl[data.name].scenaridev.length>0){
				window.___dev = function(me){
					var fnc = bdl[data.name].scenaridev.shift();
					if(fnc)
						fnc.apply(me, arguments);
				};
				bdl[data.name].___init(window.___dev);
			} else if(bdl[data.name].init){
				bdl[data.name].init();
			}
			//</DEV>
			//<PROD>
			if(bdl[data.name].init)
				bdl[data.name].init();
			//</PROD>
		};

		var bundles = {
			push : function ( data ) {
				_load(data);
			}
		};

		setTimeout( function(){bundlesTmp.map(bundles.push);}, 0 );

		return bundles;
	})(window.$bundles||[]);
});
