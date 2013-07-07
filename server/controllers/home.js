var _ 					= require('underscore'),
	base_controller 	= require('./base_controller'),
	main 				= require.main.exports;

var home = function(models){
	var self = this;

	var Home = new base_controller(models);

	return _.extend(Home, self, {
		index: function(req, res){
			res.view_render.render_app('home/index_unlogged', { suppress_header: true }, function(err, view){
				res.send(view);
			});
		},
		not_found: function(req, res){
			var self = this;

			Home.show_four_oh_four(req, res);
		},
		view_templates: function(req, res){
			var self = this;

			res.set('Content-Type', 'text/javascript');
			res.send(main.views.compiled_views);
		},
		robots: function(req, res){

		},
		sitemap: function(req, res){
			
		}
	});

};	

module.exports = home;
