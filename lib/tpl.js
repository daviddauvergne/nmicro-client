
module.exports = function (template, data) {
	return template.trim().replace(/\{\$\s*([\w\.]*)\s*\}/g, function (str, key) {
		var keys = key.split("."), value = data[keys.shift()];
		keys.forEach( function (val) {value = value[val]; });
			return (value === null || value === undefined) ? "" : value;
	});
};
