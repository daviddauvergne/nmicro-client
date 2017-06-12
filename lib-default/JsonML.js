
/* Convert JsonML to DOM */
Array.prototype.toDomNodes = function(element,refel,locale){
	if (typeof this[0] === 'string'){

		if(this.locale)
			locale = this.locale;

		var el = document.createElement(this[0]);

		var loc = function(n){
			return n.replace(/\{\$([\w\.]*)\}/g, function (str, key) {
				var keys = key.split(".");
				var value = locale[keys.shift()];
				try {
					keys.forEach( function (val) {value = value[val]; });
						return (value === null || value === undefined) ? "" : value;
				} catch(err) {
					return "";
				}
			});
		};

		element = (typeof element === 'string') ? document.getElementById(element) : element;

		// add attributes
		if (this[1] && this[1].constructor == Object){
			var n = this[1];
			for (var a in this[1]){
					if (a === "style"){
						el.style = n[a];
					} else {
						if(a=='el' && refel){
							refel.els[n[a]] = el;
						}
						if(a=='evt' && refel){
							if(refel.events && refel.events[n[a]]){
								for (var e in refel.events[n[a]])
									el.addEventListener(e, refel.events[n[a]][e].bind(refel), false);
							}
						}

						if(COMPONENTS[this[0].toUpperCase()])
							el.attrs.push(a);

						el.setAttribute(a, loc(n[a]));
					}
			}
		}

		if (element){
			if(this.position){

				var elContent = element;
				if(element.els && element.els.content)
					elContent = element.els.content;

				if(this.position=='replace'){
					if (elContent.hasChildNodes()) {
						while (elContent.childNodes.length >= 1)
							elContent.removeChild(elContent.firstChild);
					}
					elContent.appendChild(el);
				} else {
					elContent.insertAdjacentElement(this.position,el);
				}

				if(element.contentInsert)
					element.contentInsert();
			} else {
				if(COMPONENTS[element.nodeName] && refel instanceof HTMLElement===false && element.els.content){
					element.els.content.appendChild(el);
					if(element.contentInsert)
						element.contentInsert();
				} else {
					element.appendChild(el);
					if(element.contentInsert)
						element.contentInsert();
				}
			}
		}

		for (var i=1,l=this.length;i<l;i++) {
			var n = this[i], c = n.constructor;
			if (c === String){
				el.appendChild(document.createTextNode(loc(n)));
			} else if (c === Array){
				n.toDomNodes(el, refel, locale);
			}
		}
		if(el.domInsert)
			el.domInsert();
		return el;
	}
	return null;
};
