const dir = require('node-dir');
var er_dev = /\t*\/\/\s*<DEV>[\s\S]*?\s*<\/DEV>/gm;
var er_prod = /\t*\/\/\s*<PROD>[\s\S]*?\s*<\/PROD>/gm;

var socketDEvString = `
<script src="/socket.io/socket.io.js"></script>
<script>
var socket = io();
socket.on('message', function(message) {
	var basename = window.location.pathname.substring(1).split('.');
	if(basename[0]==message.content || message.content=='_all_')
	location.reload();
});

var consoleHolder = console;
console = {
	log : function(){
		consoleHolder.log.apply(consoleHolder,arguments);
		socket.emit('console', { type: 'log', arguments: arguments});
	},
	info : function(){
		consoleHolder.info.apply(consoleHolder,arguments);
		socket.emit('console', { type: 'log', arguments: arguments});
	},
	debug : function(){
		consoleHolder.debug.apply(consoleHolder,arguments);
		socket.emit('console', { type: 'log', arguments: arguments});
	},
	warn : function(){
		consoleHolder.warn.apply(consoleHolder,arguments);
		socket.emit('console', { type: 'log', arguments: arguments});
	},
	error : function(){
		consoleHolder.error.apply(consoleHolder,arguments);
		socket.emit('console', { type: 'log', arguments: arguments});
	}
};

window.onerror = function (errorMsg, url, lineNumber, column, errorObj) {
	socket.emit('console', { type: 'onerror', arguments: [errorMsg, url, lineNumber, column, errorObj]});
}
window.addEventListener('error', function(e) {
	if(e.constructor.name!="ErrorEvent"){
		if(e.srcElement && e.srcElement.src){
			socket.emit('console', { type: 'error', arguments: [e.srcElement.src,'404 No found']});
		}
		if(e.srcElement && e.srcElement.href){
			socket.emit('console', { type: 'error', arguments: [e.srcElement.href,'404 No found']});
		}
	}
}, true);
</script>
`;

module.exports = {
	getSocketDEvString : function(){
		return socketDEvString;
	},
	getLibString : function(config,folder,callback){
		var libString = '';
		var erg;
		if(config.dev){
			erg = er_prod;
		} else {
			erg = er_dev;
		}
		dir.readFiles(folder,
			function(err, content, filename, next) {
					var fileExtention = filename.substring(filename.lastIndexOf('.')+1);
					if(fileExtention=='js'){
						if(config.dev){
							var nameFile = filename.substring(config.sources.length);
							var cl = 0;
							content = content.replace(/(\n)/gm,function(){
								cl++;
								return `//[${cl}|${nameFile}]\n`;
							});
						}

						libString += content.replace(erg,"");
					}
					next();
			},
			function(err, files){
				if (err) {
					console.log(err);
					return callback(null);
				}
				return callback(libString);
			}
		);
	}
};
