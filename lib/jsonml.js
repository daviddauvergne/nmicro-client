var
	buffer = require('buffer'),
	Parser = require('node-expat').Parser;

const	logger = require('./logger');

function _isEmpty(obj) {
	for (var key in obj) {
		if (obj.hasOwnProperty(key)) return false;
	}

	return true;
}

function _parse(sourcesFolder,file,content,junk) {
	var
		enc = 'UTF-8',
		noStrip = false,

		nodeStack = [],
		root,
		node,
		partial = '',
		parser = new Parser(enc);

	parser.on('startElement', function _startElement(name, attrs) {
		var newNode = [ name ];

		if (partial) {
			node.push(partial);
			partial = '';
		}

		if (!_isEmpty(attrs)) newNode.push(attrs);

		if (node) {
			node.push(newNode);
			nodeStack.push(node);
		}

		node = newNode;
	});

	parser.on('endElement', function _endElement(name) {
		if (partial) {
			node.push(partial);
			partial = '';
		}

		if (nodeStack.length === 0) root = node;

		node = nodeStack.pop();
	});

	parser.on('text', function _text(text) {
		var textContent = (noStrip) ? text : text.replace(/[\r\n\t]*/, "");
		if (textContent.length > 0) {
			if (partial) {
				partial += textContent;
			} else {
				partial = textContent;
			}
		}
	});

	var getData = function(c){
		return (typeof c === 'buffer') ? c : new Buffer(c, enc);
	};


	var data = getData(content);

	var errorMsg = function(error,c){
		logger.msg([{b_red:'Error: '},{blue:file.substring(sourcesFolder.length+1)},{b_green:' '+error}]);
		return [
			"div",{"style": "border:1px solid black;"},
			[
				"h1",{"style": "color:red;background:pink;"},
				error
			],
			[
				"pre",{"style": "color:black;text-align: left;tab-size: 2;padding: 12px;margin:10px;"},
				c
			]
		];
	};

	if (!parser.parse(data, true)) {
		var error = parser.getError();

		if(error=='junk after document element' && junk===undefined){
			return _parse(sourcesFolder,file,'<div>'+content+'</div>');
		} else {
			return errorMsg(error,content);
		}
	}
	return root;
}

/**
 * JsonML parser.
 */
module.exports = _parse;
