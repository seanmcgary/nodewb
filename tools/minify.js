var fs = require('fs'),
	path = require('path'),
	_ = require('underscore');
var js_client_path = path.normalize(__dirname + '/../client/js');
var third_party_path = path.normalize(__dirname + '/../client/js/vendor/');
var exec = require('child_process').exec,
    child;

var third_party_libs = [
	third_party_path + 'jquery-1.8.0.min.js',
	third_party_path + 'underscore-1.3.3.min.js',
	third_party_path + 'async.js',
	third_party_path + 'tipsy.js',
	third_party_path + 'markdown.js',
	third_party_path + 'backbone-min.js',
];

var all_files = [];

var javascript_string = '';

var parse = function(base_path){
	var files = fs.readdirSync(base_path);

	files = _.sortBy(files, function(filename){ return (filename.match(/\.js$/) >= 0) });
	_.each(files, function(file, index){

		var path = base_path + '/' + file;
		var stat = fs.statSync(path);

		if(stat.isFile() && file.match(/\.js$/) && file != 'minified_app.js'){
			all_files.unshift(path);
		} else if(stat.isDirectory() && file != 'vendor'){
			parse(path);
		}
	});
};

parse(js_client_path);

all_files = third_party_libs.concat(all_files);

_.each(all_files, function(file){
	javascript_string += fs.readFileSync(file).toString();
});

console.log(all_files);

fs.writeFileSync(js_client_path + '/minified_app.js', javascript_string);

var minified_file = js_client_path + '/minified_app.js';

console.log('writing file to ' + minified_file);

var cmd = 'uglifyjs -o ' + minified_file + ' ' + minified_file;	
console.log(cmd);
child = exec(cmd, function (error, stdout, stderr) {
	console.log(arguments);
});