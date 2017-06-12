window.$util = {
	cloneObject: function(obj) {
		if (obj === null || typeof obj !== 'object')
			return obj;
		var temp = obj.constructor();
		for (var key in obj)
			temp[key] = this.cloneObject(obj[key]);
		return temp;
	},
	// mustache style {{ key }}
	tpl: function (template, data) {
		return template.trim().replace(/\{\{\s*([\w\.]*)\s*\}\}/g, function (str, key) {
			var keys = key.split("."), value = data[keys.shift()];
			keys.forEach( function (val) {value = value[val]; });
				return (value === null || value === undefined) ? "" : value;
		});
	},
	match: function(overlayEl,tpl,tplName,data){

		var _insert = function(el,data,tpl){
			if(el.els && el.els.content){
				if(tpl.position){
					if(typeof data[k] =='string')
						el.els.content.insertAdjacentHTML(position,data);
					else
						el.els.content.insertAdjacentElement(position,data);
				} else {
					el.els.content.appendChild(data);
				}
				if(el.contentInsert)
					el.contentInsert();
			} else {
				el.innerHTML = data;
			}
		};

		for (var k in data) {
			var el;
			var all = false;
			var mk;

			if(tpl.match && tpl.match[k])
				mk = tpl.match[k];

			var dk = data[k];
			if(mk){
				if(mk.selector){
					el = overlayEl.querySelector(mk.selector);
				} else if(mk.selectorAll){
					el = overlayEl.querySelectorAll(mk.selector);
					all = true;
				} else if(mk.el && tpl.els && tpl.els[mk.el]) {
					el = tpl.els[mk.el];
				}
			} else {
				if(tpl.els && tpl.els[k]){
					el = tpl.els[k];
				}
			}
			if(el){
				if(mk && mk.replace)
					dk = this.tpl(mk.replace,{value:dk});

				var els;
				if(all)
					els = [].slice.call(el);
				else
					els = [el];

				els.forEach(function(_el){
					if(mk){
						if(mk.propertie){
							_el[mk.propertie] = dk;
						} else if(mk.attribute){
							_el.setAttribute(mk.attribute,dk);
						} else if(mk.function){
							mk.function(_el,dk);
						} else {
							_insert(_el,dk,mk);
						}
					} else {
						_insert(_el,dk,mk);
					}
				});

			} else {
				console.log('macth '+tplName+': '+k+' no element found');
			}
		}
	},
	toCamelCase: function(n){
		return n.replace(/-([a-zA-Z])/g, function (m, w) {
			return w.toUpperCase();
		});
	}
};