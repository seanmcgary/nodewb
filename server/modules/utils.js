var path = require('path'),
	_ = require('underscore'),
	fs = require('fs');


var generateClientJsFiles = exports.generateClientJsFiles = function(clientJsPath){		

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

	var viewPath = path.normalize(clientJsPath + '/views');
	parseDir(viewPath, views);
	views = _.sortBy(views, function(view){ return view; });


	var modelPath = path.normalize(clientJsPath + '/models');
	parseDir(modelPath, models);
	models = _.sortBy(models, function(model){ return model; });


	return models.concat(views);

};