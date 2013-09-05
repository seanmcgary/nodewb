var fs 			= require('fs'),
	_ 			= require('underscore'),
	path 		= require('path'),
	main		= require.main.exports;

var viewCompiler = function(views){

	var viewFileList = {};
	var viewFiles = {};

	var LINE_END = "\n",
		viewString = 'var __views = {}' + LINE_END;

	var parseDir = function(dir){
		var base = "/" + dir.replace(views, "");

		var dirFiles = fs.readdirSync(dir);


		for(var i in dirFiles){
			var fileStat = fs.statSync(dir + '/' + dirFiles[i]);

			if(fileStat.isDirectory()){
				parseDir(dir + '/' + dirFiles[i]);
			} else {
				var file =  dirFiles[i].replace(/^\/+/, "");
				var _base = ((base == '/') ? file : base + '/' + file).replace(/(\.(html|ejs|js))+$/, '');

				_base = _base.replace(/^\/+/, '');

				viewFileList[_base] = dir + '/' + dirFiles[i];
			}
		}
	};

	var compileViews = function(){

		_.each(viewFileList, function(val, index, list){
			var file = fs.readFileSync(val);

			parsePartials(file.toString(), index);
		});
	};

	var parsePartials = function(file, fileIndex){
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
			viewFiles[partialName] = _.template(currentTemplate);

			viewString += '__views["' + partialName + '"] = ' + (viewFiles[partialName].source + LINE_END);

		});
	};

	return {
		compile: function(){
			var self = this;

			parseDir(views);

			compileViews();

			var payload = {
				views: viewFiles,
				compiledViews: viewString
			};

			return payload;

		},
		generateClientJsFiles: function(){		

			var views = [];
			var models = [];

			var parseDir = function(path, listRef){

				var dir = fs.readdirSync(path);
				_.each(dir, function(item){
					var itemPath = path + '/' + item;

					var stat = fs.statSync(itemPath);

					if(stat.isDirectory()){
						parseDir(itemPath, listRef);
					} else {
						listRef.push(itemPath.replace(main.config.static, ''));
					}
				});

			};

			var viewPath = path.normalize(config.static + '/js/views');
			parseDir(viewPath, views);
			views = _.sortBy(views, function(view){ return view; });


			var modelPath = path.normalize(config.static + '/js/models');
			parseDir(modelPath, models);
			models = _.sortBy(models, function(model){ return model; });


			return models.concat(views);

		}
	}
};

module.exports = viewCompiler