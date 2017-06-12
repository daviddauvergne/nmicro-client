
const path = require('path');
const fs = require('fs-extra');
const dir = require('node-dir');
const	getJS = require('./getjs');
const extValid = ['js','tpl','json','html','md','scss','json'];

var createEl = function(sourceData,type,sources,name){
	sourceData = path.join(sourceData,type);
	dir.readFiles(sourceData,
		function(err, content, filename, next) {
				var fileExtention = filename.substring(filename.lastIndexOf('.')+1);

				var pathFile = filename.substring(sourceData.length+1).replace(/xxx/g,name);

				pathFile = path.join(sources,type,name,pathFile);
				if (extValid.indexOf(fileExtention) > -1) {
					content = content.replace(/xxx/g,name);
				}

				fs.outputFileSync(pathFile, content);
				next();
		},
		function(err, files){

		}
	);
};

var typeFolder = {
	bundle : 'bundles',
	api : 'apis',
	component : 'components',
	module : 'modules',
	model : 'models',
	page : 'pages'
};

module.exports = function(nmicro,config){
	var url = 'http://'+config.serverIP+':'+config.serverPort+'/';
	return {
		createModelDefault : function(config){
			createEl(config.dataFolder,typeFolder.model,config.sources,'default');
		},
		create : function(req, res, next) {
			if (typeFolder[req.params.type]){
				createEl(config.dataFolder,typeFolder[req.params.type],config.sources,req.params.name);
				if(req.params.type=='api'){
					fs.copySync(
						path.join(config.dataFolder,'rest.js'),
						path.join(config.sources,'rest',req.params.name+'-rest.js')
					);
				}
			}
			res.send('ok');
			return next();
		},
		del : function(req, res, next) {
			var pathFolder = path.join(config.sources,typeFolder[req.params.type],req.params.name);
			fs.removeSync(pathFolder);
			if(req.params.type=='api'){
				var restFile = path.join(config.sources,'server',req.params.name+'-rest.js');
				if(fs.existsSync(restFile)){
					fs.unlinkSync(restFile);
				}
			}
			res.send('ok');
			return next();
		},
		home : function(req, res, next) {

		var types = {
			model : fs.readdirSync(config.sourcesModels),
			bundle : fs.readdirSync(config.sourcesBdl),
			module : fs.readdirSync(config.sourcesModules),
			component : fs.readdirSync(config.sourcesCp),
			api : fs.readdirSync(config.sourcesApis),
			page : fs.readdirSync(config.sourcesPages)
		};

		var restriction = {};
		types.bundle.forEach(function(bdl) {
			var BundleFile = path.join(config.sourcesBdl,bdl,bdl+'.js');
			var js = getJS(BundleFile,config);
			restriction[bdl] = js.restriction;
		});

		var bundlesLink = Array.from(new Set(types.bundle.concat(types.page))).map(function(bdl) {
			var link = url+bdl+'.html';
			if(config.defaultMode=='app'){
				return '<p class="bdlLink"><span style="color:gray">'+link+'</span></p>';
			} else {
				if(restriction[bdl] && restriction[bdl]=='app')
					return '<p class="bdlLink"><span style="color:gray">'+link+' (restriction: "app")</span></p>';
				return '<p class="bdlLink"><a href="'+link+'">'+link+'</a></p>';
			}
		});

		var items = function(type){
			return types[type].map(function(name) {
				if(type=='model' && name=="default")
					return '<div class="modeldefault" data-name="'+name+'" data-type="'+type+'">'+name+'</div>';
				return '<div class="item" data-name="'+name+'" data-type="'+type+'">'+name+'</div>';
			}).join('');
		};

		res.end(`<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8" />
<meta http-equiv="Content-type" content="text/html;charset=UTF-8" />

<script>
var URL = '${url}';
var capitalizeFirstLetter = function(string) {
	return string.charAt(0).toUpperCase() + string.slice(1);
};

var postData = function(action,type,name){
	var xhr = new XMLHttpRequest();
	xhr.onreadystatechange = function() {
		if ( xhr.readyState === 4 ) {
			if ( xhr.status === 200  ) {
				setTimeout(function () {
					location.reload();
				}, 300);
			} else {
				alert(xhr.status+' '+xhr.responseText);
				document.body.classList.remove("action");
			}
		}
	};
	document.body.classList.add("action");
	xhr.open("POST", URL+"nmicro/"+action);
	xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
	xhr.send(JSON.stringify({ type: type, name: name }));
};

document.addEventListener( "DOMContentLoaded",function(){
	document.getElementById('compilall').addEventListener('click', function(event){
		postData('compilall','','');
	}, false);
	[].forEach.call(document.querySelectorAll('.item'), function(el) {
		el.addEventListener('click', function(event){
			if(!document.body.classList.contains("action")){
				var type = this.dataset.type;
				var name = this.dataset.name;
				if (confirm("Delete "+type+': '+name)) {
					postData('del',type,name);
				}
			}
		}, false);
	});
	[].forEach.call(document.querySelectorAll('.add'), function(el) {
		el.addEventListener('click', function(event){
			var type = this.dataset.type;
			var name = document.querySelector('input[data-input="'+type+'"]').value;
			if (name != null) {
					var res = /^([a-z|\\-|_]{2,})$/.test(name);
					if(res){
						postData('create',type,name);
					} else {
						alert('Invalid name !\\n\\n [a-z|\\-|_]{2,}');
					}
			}
		}, false);
	});
});
</script>
<style type="text/css">
body {
	font-size:15px;
	font-family: sans-serif;
}

body > h1 {
	text-transform: uppercase;
	text-align: center;
}

body > h2 {
	text-align: center;
}

body > div {
	display: flex;
	flex-wrap: wrap;
	justify-content: center;
	align-items: center;
}

body > div > div {
	width: 500px;
	margin: 10px;
	border: 1px solid #c3c3c3;
	padding: 10px;
}

a {
	color:blue ! important;
}

.bdlLink {
	margin:5px auto;
}

.item,
.modeldefault {
	cursor: default;
	padding: 3px;
	margin: 3px 0;
}

.adt {
	text-align: left;
	margin-right: 10px;
}

.item:after {
	position: absolute;
	cursor: pointer;
	display: none;
	content:"✖";
	margin-left: 5px;
	color: red;
	font-size: 1.2em;
}

.item:hover:after {
	display: inline-block;
}

.action {
	background:whitesmoke;
	color: gray !important;
}

.action button,
.action input,
.action .item:after {
	display:none;
}

.action .bdlLink a {
	pointer-events: none;
	cursor: default;
	text-decoration:none;
	color:gray !important;
}

</style>
</head>
<body>
	<h1>${nmicro.name}</h1>
	<h2>VERSION: ${nmicro.version}</h2>
	<div>
		<div>
			<h2>PROJECT: ${config.name}</h2>
			<pre>${config.dir}</pre>
			<div style="text-align:center;"><button id="compilall">Compil all</button></div>
		</div>
		<div>
			<h2>URLS <span style="font-size:0.7em;color:gray;font-weight:normal;">Default mode: ${config.defaultMode}</span></h2>
			<div>${bundlesLink.join('')}</div>
		</div>
		<div>
			<h2><span class="adt">Models</span><input data-input="model"/><button class="add" data-type="model">+</button></h2>
			<p style="color:gray;">After an operation on "models", it is necessary to restart nmicro</p>
			<div>${items('model')}</div>
		</div>
		<div>
			<h2><span class="adt">Bundles</span><input data-input="bundle"/><button class="add" data-type="bundle">+</button></h2>
			<div>${items('bundle')}</div>
		</div>
		<div>
			<h2><span class="adt">Modules</span><input data-input="module"/><button class="add" data-type="module">+</button></h2>
			<div>${items('module')}</div>
		</div>
		<div>
			<h2><span class="adt">Components</span><input data-input="component"/><button class="add" data-type="component">+</button></h2>
			<div>${items('component')}</div>
		</div>
		<div>
			<h2><span class="adt">Pages</span><input data-input="page"/><button class="add" data-type="page">+</button></h2>
			<div>${items('page')}</div>
		</div>
		<div>
			<h2><span class="adt">Apis</span><input data-input="api"/><button class="add" data-type="api">+</button></h2>
			<div>${items('api')}</div>
		</div>
	</div>
	<br/><br/>
</body>
</html>`);
			return next();
		}
	}
};
