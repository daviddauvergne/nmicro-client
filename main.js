
const pjson = require('./package.json');
const logger = require('./lib/logger');
const path = require('path');
const fs = require('fs-extra');

logger.msg([{b_blue:pjson.name}],true);
logger.msg([{b_blue:'VERSION: '+pjson.version}]);
console.log('');

// -------------------------------------------------------------------

const argv = require('yargs')
	.usage('Usage: $0 /path/to/directory [options]')
	.example(`# Development mode
		$0 /path/to/directory

		# Production mode
		$0 /path/to/directory -p
		`)
	.command( "DIR", pjson.name+" project directory", { alias: "dir" } )
	.required( 1, logger.msg([{b_red:"DIR is required\n"}],false,true))

	.alias('p', 'prod')
	.describe('p', 'Production mode')
	.default('p',false)

	.alias('t', 'test')
	.describe('t', 'Test mode')
	.default('t',false)

	.check(function (argv) {
		var dir = path.join(path.resolve(argv._[0]));
		if (fs.existsSync(dir)) {
			return true;
		} else {
			throw(new Error(logger.msg([{b_red:"Invalid DIR, path: "+dir+" does not exist\n"}],false,true)));
		}
	})

	.alias('h', 'help')
	.help('help')
	.locale('en')
	.argv;

// -------------------------------------------------------------------
// start server

var dev = true;
var devString = 'dev';
process.env.TESTMODE = 'false';

if(argv.prod){
	dev = false;
	devString = 'prod';
	logger.msg([{b_red:'Production mode !!'}]);
} else {
	if(argv.test){
		process.env.TESTMODE = 'true';
		logger.msg([{yellow:'Test mode !!'}]);
	} else {
		logger.msg([{b_blue:'Devellopement mode'}]);
	}
}

var dir = path.resolve(argv._[0]);
var _conf = {
	name : path.basename(dir),
	langues : ['en'],
	defaultModel : 'default',
	modes : ['app','web'],
	defaultMode : 'web',
	serverPort : 8080,
	serverIP : '127.0.0.1',
	dir : dir,
	logFolder : path.join(__dirname,'log'),
	sources : path.join(dir,'sources'),
	sourcesLib : path.join(dir,'sources','lib'),
	sourcesBdl : path.join(dir,'sources','bundles'),
	sourcesApis : path.join(dir,'sources','apis'),
	sourcesCp : path.join(dir,'sources','components'),
	sourcesModules : path.join(dir,'sources','modules'),
	sourcesModels : path.join(dir,'sources','models'),
	sourcesPages : path.join(dir,'sources','pages'),
	sourcesRest : path.join(dir,'sources','rest'),
	dataFolder : path.join(__dirname,'data'),
	setting : '',
	dev : dev,
	devString : devString,
	out : path.join(dir,'out','/'),
	outCss : path.join(dir,'out','css'),
	outJs : path.join(dir,'out','js'),
	indexFileHTML : 'index.html',
	mainFileJS : 'main.js',
	mainFileCSS : 'main.css',
	varsSCSS : 'vars.scss'
};


var nmicroClientFile = path.join(dir,'nmicro-client.js');
if(fs.existsSync(nmicroClientFile)){
	var _locConf = require(nmicroClientFile);
	for (var key in _locConf) {
		_conf[key] = _locConf[key];
	}
}

process.env.SERVERPORT = _conf.serverPort;
process.env.LOG_FOLDER = _conf.logFolder;

logger.msg([{b_black:'Initialization project: '+dir}]);

fs.ensureDirSync(_conf.sourcesLib);
fs.ensureDirSync(_conf.sourcesBdl);
fs.ensureDirSync(_conf.sourcesApis);
fs.ensureDirSync(_conf.sourcesModules);
fs.ensureDirSync(_conf.sourcesModels);
fs.ensureDirSync(_conf.sourcesCp);
fs.ensureDirSync(_conf.sourcesRest);
fs.ensureDirSync(_conf.sourcesPages);

const webConfig = require('./lib/webConfig')(pjson,_conf);

if(!fs.existsSync(path.join(_conf.sourcesModels,'default'))){
	webConfig.createModelDefault(_conf);
}

_conf.settingFile = path.join(_conf.sources,'setting.js');

if(!fs.existsSync(_conf.settingFile)){
	fs.copySync(path.join(_conf.dataFolder,'setting.js'), _conf.settingFile);
}
if(!fs.existsSync(nmicroClientFile)){
	fs.copySync(path.join(_conf.dataFolder,'nmicro-client.js'), nmicroClientFile);
}

setTimeout(function () {
	_conf.models = fs.readdirSync(_conf.sourcesModels);
	_conf.bundles = fs.readdirSync(_conf.sourcesBdl);
	_conf.pages = fs.readdirSync(_conf.sourcesPages);

	const compilModels = require('./lib/all-compil-models');
	const toWatch = require('./lib/watch');
	const restify = require('restify');
	const server = restify.createServer();
	server.use(restify.CORS());
	server.use(restify.bodyParser());
	server.get('/', webConfig.home);
	server.post('/nmicro/create', webConfig.create);
	server.post('/nmicro/del', webConfig.del);

	_conf.defaultLangue = _conf.langues[0];

	var staticDir = path.join(_conf.out,_conf.defaultMode,_conf.defaultModel,_conf.defaultLangue,'/');
	if(_conf.defaultMode=='web'){
		server.get(/\/?\.*/, restify.serveStatic({
			directory: staticDir,
			default: 'index.html'
		}));
	}

	const io = require('socket.io')(server.server);

	server.listen(_conf.serverPort, _conf.serverIP, function() {
		logger.msg([{b_black:'Listening at '+server.url}]);
		if(_conf.defaultMode=='web')
			logger.msg([{b_black:'Static server: '+staticDir}]);
	});

	const getMode = require('./lib/mode');
	var modeDefault = getMode(_conf.defaultMode);

	const compilLibDefault = require('./lib/lib-default-compil');
	compilLibDefault.getLibString(_conf,path.join(__dirname,'lib-default'),function(jsSetting){
		_conf.setting = jsSetting;

		server.post('/nmicro/compilall', function(req, res, next) {
			_conf.models = fs.readdirSync(_conf.sourcesModels);
			_conf.bundles = fs.readdirSync(_conf.sourcesBdl);
			_conf.pages = fs.readdirSync(_conf.sourcesPages);
			compilModels(_conf,emitMessage);
			res.send('ok');
			return next();
		});
		var emitMessage = function(name){
			if(socket)
				socket.emit('message', { content: name, importance: '1' });
		};
		compilModels(_conf,emitMessage);
		var socket = null;
		toWatch(_conf,modeDefault,logger,server,emitMessage);

		io.sockets.on('connection', function (__socket) {
			socket = __socket;
			socket.on('console', function (data) {
				if(data.type=='onerror'){
					var url = data.arguments[1];
					var jsFile = path.join(staticDir,url.substring(server.url.length+1));
					var content = fs.readFileSync(jsFile,'utf8');
					content = content.split('\n');
					var line = (data.arguments[2]*1)-1;
					var tab = content[line].match(/\[(\d+)\|(.*)\.js\]/);
					if(tab){
						logger.onerror(data.arguments[0],tab[2]+'.js',tab[1]);
					} else {
						logger.onerror(data.arguments[0],data.arguments[1],data.arguments[2]);
					}
				} else {
					logger[data.type](Object.values(data.arguments));
				}
			});
		});
		logger.init();
	});
}, 200);
