const fs = require('fs-extra');
const winston = require('winston');
winston.emitErrs = true;

var chars = {

space : ['   ',
				 '   ',
				 '   '],

tiret : ['  ',
				 '─ ',
				 '  '],

a : ['┌─┐ ',
		 '├─┤ ',
		 '┴ ┴ '],

b : ['┌┐  ',
		 '├┴┐ ',
		 '└─┘ '],

c : ['┌─┐ ',
		 '│   ',
		 '└─┘ '],

d : ['┌┬┐ ',
		 ' ││ ',
		 '─┴┘ '],

e : ['┌─┐ ',
		 '├┤  ',
		 '└─┘ '],

f : ['┌─┐ ',
		 '├┤  ',
		 '└   '],

g : ['┌─┐ ',
		 '│ ┬ ',
		 '└─┘ '],

h : ['┬ ┬ ',
		 '├─┤ ',
		 '┴ ┴ '],

i : ['┬ ',
		 '│ ',
		 '┴ '],

j : [' ┬ ',
		 ' │ ',
		 '└┘ '],

k : ['┬┌─ ',
		 '├┴┐ ',
		 '┴ ┴ '],

l : ['┬   ',
		 '│   ',
		 '┴─┘ '],

m : ['┌┬┐ ',
		 '│││ ',
		 '┴ ┴ '],

n : ['┌┐┌ ',
		 '│││ ',
		 '┘└┘ '],

o : ['┌─┐ ',
		 '│ │ ',
		 '└─┘ '],

p : ['┌─┐ ',
		 '├─┘ ',
		 '┴   '],

q : ['┌─┐  ',
		 '│─┼┐ ',
		 '└─┘└ '],

r : ['┌┬─┐ ',
		 ' ├┬┘ ',
		 ' ┴└─ '],

s : ['┌─┐ ',
		 '└─┐ ',
		 '└─┘ '],

t : ['┌┬┐ ',
		 ' │  ',
		 ' ┴  '],

u : ['┬ ┬ ',
		 '│ │ ',
		 '└─┘ '],

v : ['┬  ┬ ',
		 '└┐┌┘ ',
		 ' └┘  '],

w : ['┬ ┬ ',
		 '│││ ',
		 '└┴┘ '],

x : ['─┐ ┬ ',
		 '┌┴┬┘ ',
		 '┴ └─ '],

y : ['┬ ┬ ',
		 '└┬┘ ',
		 ' ┴  '],

z : ['┌─┐ ',
		 '┌─┘ ',
		 '└─┘ ']
};

var fgColors = {
	b_ : "\x1b[1m",
	d_ : "\x1b[2m",
	black : "\x1b[30m",
	red : "\x1b[31m",
	green : "\x1b[32m",
	yellow : "\x1b[33m",
	blue : "\x1b[34m",
	magenta : "\x1b[35m",
	cyan : "\x1b[36m",
	white : "\x1b[37m"
};

var toTitle = function(text){
	text = text.split('');
	var line1 = [];
	var line2 = [];
	var line3 = [];

	text.forEach(function(c){
		switch (c) {
			case ' ': c = 'space';break;
			case '-': c = 'tiret';break;
		}
		if(chars[c]){
			line1.push(chars[c][0]);
			line2.push(chars[c][1]);
			line3.push(chars[c][2]);
		}
	});
	return line1.join('')+'\n'+line2.join('')+'\n'+line3.join('');
};

var getColor = function(key){
	var prefix = key.substring(0, 2);
	if(prefix=='b_' || prefix=='d_'){
		var color = key.substring(2, key.length);
		return fgColors[prefix]+fgColors[color];
	}
	return fgColors[key];
};

var logger = console;
var lg = function(type,args){
	if(process.env.TESTMODE=='true')
		args.unshift('C-'+process.env.SERVERPORT);
	args.unshift(type);
	logger.log.apply(logger, args);
};

module.exports = {
	init : function(){
		fs.ensureDir(process.env.LOG_FOLDER,function(err){
			if(err)
				throw err;
		});
		if(process.env.TESTMODE=='false'){
			logger = new winston.Logger({
					transports: [
							new winston.transports.Console({
									level: 'debug',
									prettyPrint: true,
									handleExceptions: false,
									json: false,
									colorize: true
							})
					],
					exitOnError: false
			});
		} else if(process.env.TESTMODE=='true'){
			var formatter = function(args){
				var date = new Date().toLocaleDateString(undefined,{
					day : 'numeric',
					month : 'numeric',
					year : 'numeric',
					hour: '2-digit',
					minute: '2-digit',
					second: '2-digit'
				});
				var msg = '';
				if(Object.keys(args.meta).length !== 0){
					msg += '\n'+JSON.stringify(args.meta,null,'\t')
				}
				return date+' - '+args.level.toUpperCase()+' - '+args.message+msg;
			};
			logger = new winston.Logger({
					transports: [
							new winston.transports.Console({
									level: 'debug',
									prettyPrint: true,
									handleExceptions: false,
									json: false,
									colorize: true
							}),
							new (winston.transports.File)({
								name: 'error-file',
								level: 'debug',
								filename: process.env.LOG_FOLDER+'/test.log',
								handleExceptions: true,
								json: false,
								maxsize: 5242880, //5MB
								maxFiles: 5,
								colorize: false,
								formatter : formatter
							})
					],
					exitOnError: false
			});
		}
	},
	msg : function(logs,title,toReturn){
		var str = '';
		logs.forEach(function(log){
			var key = Object.keys(log)[0];
			var color = getColor(key);
			var txt = log[key];
			if(title)
				txt = toTitle(txt);
			str += color+txt+'\x1b[0m';
		});
		if(toReturn)
			return str;
		else
			console.log(str);
	},
	log : function(args){
		lg('debug',args);
	},
	info : function(args){
		lg('info',args);
	},
	debug : function(args){
		lg('debug',args);
	},
	warn : function(args){
		lg('warn',args);
	},
	error : function(args){
		lg('error',args);
	},
	onerror : function(err,file,line){
		var txt = err+getColor('cyan')+' '+file+' \x1b[0m'+line;
		lg('error',[txt]);
	}
};
