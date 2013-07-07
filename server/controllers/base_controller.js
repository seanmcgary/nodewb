var _ = require('underscore'),
main    = require.main.exports;

var base_controller = function(models){
	var self = this;

	return _.extend(self, {
		show_four_oh_four: function(req, res){
			var self = this;

			res.view_render.render_app('partials/404', {}, function(err, view){
				res.send(404, view);
			});
		}
	});
};

module.exports = base_controller;