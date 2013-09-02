if(!window.console){
	window.console = {
		log: function(){}
	};
}

var init = function(application, $){

	_.extend(application, Backbone.Events);
	FB.init({appId: application.config.fb_app_id, status: true, cookie: true});

	application.helpers = {};

	application.userModel = {};

	application.helpers = {
		months: [ "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December" ],
        short_months: [ "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec" ],
		sanitizeFields: function(fields, non_required){
			var errors = false;

			if(typeof non_required === 'undefined'){
				non_required = [];
			}

			_.each(fields, function(field){
				var $this = $(field);

				var $form_row = $this.closest('.form-row');
				if(_.indexOf(non_required, $this.attr('id')) < 0 && $this.val().length == 0){
					errors = true;
					$form_row.addClass('error');
					$form_row.find('.sub-label').html('Field is required');
				}

				if($this.attr('name') == 'user[password]' && $this.val().length < 6){
					errors = true;
					$form_row.addClass('error');
					$form_row.find('.sub-label').html('Password must be at least 6 characters long.');
				}

				var full_name = $this.val();
				if($this.attr('name') == 'user[full_name]' &&  full_name.match(/[^a-zA-Z0-9_\s-]+/) !== null){
					errors = true;
					$form_row.addClass('error');
					$form_row.find('.sub-label').html('Only letters, numbers, underscores, spaces, and dashes are allowed.');
				}

				if($this.attr('name') == 'user[username]' && $this.val().match(/[^a-zA-Z0-9_]+/) !== null){
					errors = true;
					$form_row.addClass('error');
					$form_row.find('.sub-label').html('Only letters, numbers, and underscores are allowed.');
				}
			});

			return errors;
		},
		showLoading: function(ref){
			ref.find('.loading').css('display', 'block');
		},
		hideLoading: function(ref){
			ref.find('.loading').css('display', 'none');
		},
		formatDatetime: function(datetime){
            var self = this;

            var date = new Date(datetime);

            var hours = date.getHours();
            var minutes = date.getMinutes();

            var meridian = 'am';

            if(minutes < 10) {
                minutes = "0" + minutes;
            }

            if(hours > 12){
                meridian = 'pm';

                hours -= 12;
            }

            return application.helpers.short_months[date.getMonth()] + " " + date.getDate() + ", " + date.getFullYear() + " at " + hours + ":" + minutes + " " + meridian;
        }
	};

	application.view.render = function(view, data){
		if(!data){
			data = {};
		}

		if(view in __views){
			return __views[view].apply(_.extend(application.helpers, { render_sync: application.view.render }), [data]);
		} else {
			return '';
		}
	};

	var mainContentView = null;

	application.controller = Backbone.Router.extend({
		previousRoute: null,
		fullLoad: true,
		initialize: function(){
			//application.userModel = new application.model.userModel(application.user);

		},
		routes: {

		},
	});

	application.navigate = function(href){
		application.controller.prototype.navigate(href, { trigger: true });
	};

	application.replaceRoute = function(href){
		application.controller.prototype.navigate(href, { trigger: false, replace: true });
	};

	new application.controller();

	Backbone.history.start({ pushState: true });

	$('.tooltip').tipsy({ opacity: .8, offset: 0, live: true });

};

$(function(){
	init(application, $);
});
