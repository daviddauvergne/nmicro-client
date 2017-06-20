window.$dia = (function(undefined) {

	window.FINAL = false;

	var eventsScroll = ['DOMMouseScroll','mousewheel','touchmove'];

	var stopScroll = function(event){
		event.preventDefault();
		event.stopPropagation();
		event.returnValue = false;
		return false;
	};

	var diaModalScroll = function(diaModalEl){
		eventsScroll.forEach(function(ev){
			diaModalEl.addEventListener(ev, function (event) {
				return stopScroll(event);
			});
		})
	};
	var screenTouchOld = 0;
	var screenTouchD = 0;

	var modalScroll = function(diaEl){
		eventsScroll.forEach(function(ev){
			diaEl.addEventListener(ev, function (event) {
				if(event.type != 'touchmove' ){
					if (diaEl.scrollTop <= 0)
						diaEl.scrollTop = 1;
					else if (diaEl.offsetHeight + diaEl.scrollTop >= diaEl.scrollHeight)
						diaEl.scrollTop = diaEl.scrollTop-1;

					if ( (diaEl.offsetHeight + diaEl.scrollTop == diaEl.scrollHeight) || diaEl.scrollTop <= 0)
						return stopScroll(event);
				}
			},false);
		})
	};

	var topZIndex = function() {
		var num = [1];
		[].forEach.call(document.querySelectorAll('*'),function(el, i){
			var x = parseInt(window.getComputedStyle(el, null).getPropertyValue("z-index")) || null;
			if(x!=null)
				num.push(x);
		});
		return Math.max.apply(null, num);
	};

	var resize = function(diaEl) {
		var diaModalEl = diaEl.previousElementSibling;
		var top = ((window.innerHeight / 2) - (diaEl.offsetHeight / 2));
		var left = ((window.innerWidth / 2) - (diaEl.offsetWidth / 2));

		// reste dans la fenêtre
		if( top < 0 ) top = 0;
		if( left < 0 ) left = 0;

		diaEl.style.top = top + 'px';
		diaEl.style.left = left + 'px';
		diaEl.style.maxHeight = (window.innerHeight-top-30)  + 'px';
		diaEl.style.maxWidth = (window.innerWidth-left-20)  + 'px';
		diaModalEl.style.height = window.innerHeight + 'px';
	};

	window.addEventListener("resize", function(){
		[].forEach.call(document.querySelectorAll('.dialog'), function(element) {
			setTimeout(function () {
				resize(element);
			}, 200);
		});
	}, false);

	var _d = {};

	var constructor = function(name){
		var tpl = null;
		var mode = 'simple';
		var modalClose = false;
		var id = null;
		var idModal = null;
		var final = false;
		return {
			init : null,
			assignTPL : function(args){
				if(args.mode)
					mode = args.mode;

				if(args.final)
					final = args.final;

				if(args.modalclose)
					modalClose = true;
				id = '__dia_'+args.name;
				idModal = '__dia_'+args.name+'Modal';
				tpl = args;
			},
			show : function(data,values){
				if(tpl && !window.FINAL){
					if(final)
						window.FINAL = true;
					var _this = this;
					var zIndex = topZIndex();
					document.body.insertAdjacentHTML('beforeend',
						'<div id="'+idModal+'" class="dialogModal" data-mode="'+mode+'"></div><div id="'+id+'" class="dialog" data-mode="'+mode+'"></div>');

					var diaModalEl = document.getElementById(idModal);
					if(modalClose){
						diaModalEl.addEventListener("click", function(e) {
							e.stopPropagation();
							_this.hide();
						}, false);
					}

					var diaEl = document.getElementById(id);
					tpl.els = {};
					tpl.toDomNodes(diaEl,tpl);

					if(data)
						window.$util.match(diaEl,tpl,tpl.name,data);

					var body = document.body, html = document.documentElement;
					var height = Math.max( body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight );
					diaModalEl.style.height = height + 'px';
					diaModalEl.style.zIndex = zIndex+1;

					diaModalScroll(diaModalEl);
					modalScroll(diaEl);

					this.els = tpl.els;
					this.locale = tpl.locale;
					tpl.dialog = this;

					//<DEV>
					if(window.___dev && this.___init)
						this.___init(window.___dev);
					else if(this.init)
						this.init.apply(this, [values]);
					//</DEV>
					//<PROD>
					if(this.init)
						this.init.apply(this, [values]);
					//</PROD>
					setTimeout(function () {
						resize(diaEl);
						diaEl.style.zIndex = zIndex+2;
						diaEl.style.visibility = 'visible';
					}, 80);
				} else {
					if(!window.FINAL)
						console.log('dialog: '+name+' does not exist');
				}
			},
			hide : function(){
				var diaModalEl = document.getElementById(idModal);
				var diaEl = document.getElementById(id);
				setTimeout(function(){
					if(diaEl)
						diaEl.remove();
					if(diaModalEl)
						diaModalEl.remove();
					window.FINAL = false;
				},20);
			}
		};
	};
	var dialog = function(name){
		if(_d[name]===undefined)
			_d[name] = new constructor(name);
		return _d[name];
	};

	return dialog;
})();
