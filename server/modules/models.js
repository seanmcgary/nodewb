var main = require.main.exports;
var fs = require('fs');
var _ = require('underscore');

var models = (function(){
	var self = this;
		
	var config = main.config;

	var model_path = function(model_name){
		return config.models_dir + '/' + model_name + '.js';
	};

	var models_dir = fs.readdirSync(config.models_dir);

	var loaded_models = {};

	_.each(models_dir, function(model_name){
		model_name = model_name.replace('.js', '');

		if(model_name != 'base_model'){
			loaded_models[model_name] = require(model_path(model_name));
		}
	});

	return loaded_models;
})();

module.exports = models;