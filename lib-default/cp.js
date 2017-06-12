window.$cp = (function(cpTmp) {
	var prepareElement = function(el,name,contentLoaded){
		if (COMPONENTS[name]) {

			var contentLoadedNodes = null;
			if(contentLoaded && el.innerHTML.trim()!=''){
				contentLoadedNodes = document.createElement('__');
				while (el.childNodes.length > 0) {
					contentLoadedNodes.appendChild(el.childNodes[0]);
				}
				el.innerHTML = '';
			}
			var nameLower = window.$util.toCamelCase(name.toLowerCase());
			el.cpname = name;
			el.els = {};
			el.attrs = [];
			el.locale = {};

			if(contentLoaded){
				[].forEach.call(el.attributes, function(att) {
					el.attrs.push(att.name);
				});
			}

			// setAttribute
			var elSetAttribute = el.setAttribute;
			el.setAttribute = function() {
				var attrs = COMPONENTS[name].attributes;
				if (attrs) {
					var attr = attrs[arguments[0]];
					if (attr && attr.set)
						attr.set.apply(this, [arguments[1]]);
				}
				elSetAttribute.apply(this, arguments);
			};

			// getAttribute
			var elGetAttribute = el.getAttribute;
			el.getAttribute = function() {
				var attrs = COMPONENTS[name].attributes;
				if (attrs) {
					var attr = attrs[arguments[0]];
					if (attr && attr.get)
						return attr.get.apply(this);
				}
				return elGetAttribute.apply(this, arguments);
			};

			if(LC.cp[nameLower])
				el.locale = LC.cp[nameLower];

			// methods
			for (var a in _methods)
				el[a] = _methods[a];

			for (a in COMPONENTS[name].methods)
				el[a] = COMPONENTS[name].methods[a];

			// properties
			for (a in COMPONENTS[name].properties)
				Object.defineProperty(el, a, COMPONENTS[name].properties[a]);

			// events
			for (a in COMPONENTS[name].events)
				el.addEventListener(a, COMPONENTS[name].events[a], false);

			if(COMPONENTS[name].dom ) {
				if(COMPONENTS[name].dom.remove){
					var elRemove = el.remove;
					el.remove = function() {
						COMPONENTS[name].dom.remove.apply(this);
						elRemove.apply(this);
					};
				}
				if(COMPONENTS[name].dom.contentInsert)
					el.contentInsert = COMPONENTS[name].dom.contentInsert;

				if(COMPONENTS[name].dom.create)
					COMPONENTS[name].dom.create.apply(el);
			}

			if(COMPONENTS[name].template){
				COMPONENTS[name].template.locale = el.locale;
				COMPONENTS[name].template.toDomNodes(el,el);
			}

			if(COMPONENTS[name].match)
				el.match = COMPONENTS[name].match;

			if(contentLoadedNodes){
				if(el.els.content){
					while (contentLoadedNodes.childNodes.length > 0) {
						el.els.content.appendChild(contentLoadedNodes.childNodes[0]);
					}
					if(el.contentInsert)
						el.contentInsert();
				} else {
					while (contentLoadedNodes.childNodes.length > 0) {
						el.appendChild(contentLoadedNodes.childNodes[0]);
					}
				}
			}

			// 	Synchronisation attributs
			if ( contentLoaded ) {
				for (a in COMPONENTS[name].attributes) {
					var attValue = elGetAttribute.apply(el, [a]);
					if (attValue!==null)
						el.setAttribute(a, attValue);
				}
			}

			// dom insert
			if(COMPONENTS[name].dom && COMPONENTS[name].dom.insert){
				el.domInsert = COMPONENTS[name].dom.insert;
				if ( contentLoaded )
					el.domInsert();
			}
		}
	};

	var createElement = document.createElement;
	document.createElement = function(tag) {
		var element = createElement.call(this, tag);
		prepareElement(element,element.nodeName,false);
		return element;
	};

	var _methods = {
		trigger : function(eventName, data){
			this.dispatchEvent(new CustomEvent(eventName, {"detail":data}));
		},
		rend : function(obj,data){
			if(typeof obj=='string'){
				var tpl = COMPONENTS[this.cpname].templates[obj];
				if(tpl){
					var overlayEl = this.els[tpl.overlay];
					if(!overlayEl)
						overlayEl = this.querySelector(tpl.overlay);
					if(overlayEl){
						tpl.content.toDomNodes(overlayEl);
						if(data)
							window.$util.match(overlayEl,tpl,obj,data);
					} else {
						console.log('component element: '+tpl.overlay+' does not exist');
					}
				} else {
					console.log('component template: '+obj+' does not exist');
				}
			} else {
				window.$util.match(this,this,this.cpname,obj);
			}
		}
	};

	var cp = {
		push: function( data ){
			COMPONENTS[data.name.toUpperCase()] = data;
		}
	};

	setTimeout( function(){
		cpTmp.map(cp.push);
		[].forEach.call(document.querySelectorAll('*'), function(element) {
			prepareElement(element, element.nodeName ,true);
		});
	}, 0 );
	window.prepareElement = prepareElement;
	return cp;
})(window.$cp||[]);
