var fs 			= require('fs'),
	_ 			= require('underscore'),
	path 		= require('path'),
	main		= require.main.exports;

var view_compiler = function(views){

	var view_file_list = {};
	var view_files = {};

	var LINE_END = "\n",
		view_string = 'var __views = {}' + LINE_END;

	var parse_dir = function(dir){
		var base = "/" + dir.replace(views, "");

		var dir_files = fs.readdirSync(dir);


		for(var i in dir_files){
			var file_stat = fs.statSync(dir + '/' + dir_files[i]);

			if(file_stat.isDirectory()){
				parse_dir(dir + '/' + dir_files[i]);
			} else {
				var file =  dir_files[i].replace(/^\/+/, "");
				var _base = ((base == '/') ? file : base + '/' + file).replace(/(\.(html|ejs|js))+$/, '');

				_base = _base.replace(/^\/+/, '');

				view_file_list[_base] = dir + '/' + dir_files[i];
			}
		}
	};

	var compile_views = function(){

		_.each(view_file_list, function(val, index, list){
			var file = fs.readFileSync(val);

			parse_partials(file.toString(), index);
		});
	};

	var parse_partials = function(file, fileIndex){
		var fileByLines = file.split('\n');

		var partials = file.match(/^##\s*(.*)$/mg);

		var filePosition = 0;

		_.each(partials, function(partial, index){
			var next;
			
			if(index < partials.length - 1){
				next = partials[index + 1];
			}

			var currentTemplate = '';
			
			if(fileByLines[filePosition] == partial){
				filePosition++;
			}

			while(filePosition < fileByLines.length){
				if(fileByLines[filePosition] == next){
					break;
				} else {
					currentTemplate += fileByLines[filePosition];
				}

				filePosition++;
			}

			var partialName = fileIndex + '/' + partial.replace('## ', '');
			view_files[partialName] = _.template(currentTemplate);

			view_string += '__views["' + partialName + '"] = ' + (view_files[partialName].source + LINE_END);

		});
	};

	return {
		compile: function(){
			var self = this;

			parse_dir(views);

			compile_views();

			var payload = {
				views: view_files,
				compiled_views: view_string
			};

			return payload;

		}
	}
};

exports.view_compiler = view_compiler;