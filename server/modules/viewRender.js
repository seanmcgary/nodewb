/**
 * Created by JetBrains PhpStorm.
 * User: seanmcgary
 * Date: 8/9/12
 * Time: 9:53 PM
 * To change this template use File | Settings | File Templates.
 */

var _       = require('underscore'),
    fs      = require('fs'),
    async   = require('async'),
    main    = require.main.exports;

var viewRender = function(){

    var applicationTemplate = 'application.ejs';
    var req = null;

    var months = [ "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December" ];
    var shortMonths = [ "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec" ];

    return {
        months: [ "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December" ],
        shortMonths: [ "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec" ],
        config: main.config,
        isLoggedIn: function(){
            var self = this;

            if(typeof self.req.session.user !== 'undefined' && self.req.session.user !== null){
                return true;
            } else {
                return false;
            }
        },
        gravatar: function(user, size){
            if(typeof size === 'undefined'){
                size = "42";
            }

            return 'http://gravatar.com/avatar/' + user.gravatar + '?s=' + size + '&d=mm';
        },
        formatUnixDate: function(date){
            var self = this;

            date = new Date(date * 1000);

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

            return shortMonths[date.getMonth()] + " " + date.getDate() + ", " + date.getFullYear() + " at " + hours + ":" + minutes + " " + meridian;
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

            return shortMonths[date.getMonth()] + " " + date.getDate() + ", " + date.getFullYear() + " at " + hours + ":" + minutes + " " + meridian;
        },
        formatShortDate: function(datetime){
            var self = this;

            var date = new Date(datetime);

            return shortMonths[date.getMonth()] + " " + date.getDate() + ", " + date.getFullYear();

        },
        render: function(view, data, callback){
            var self = this,
                scope = _.extend(self, data);

            if(view in self.views){
                var rendered_view = self.views[view].apply(self, [data]);
                return callback(null, rendered_view);
            } else {
                console.log('View ' + view + ' not found');
                return callback(true, 'View ' + view + ' not found');
            }

        },
        renderSync: function(view, data){
            var self = this,
                scope = _.extend(self, data);

            if(view in self.views){
                var rendered_view = self.views[view].apply(scope, [data]);
                return rendered_view;
            } else {
                console.log('View ' + view + ' not found');
                return false;
            }

        },
        renderApp: function(view, data, callback){
            var self = this;

            if(typeof data === 'function'){
                callback = data;
                data = {};
            }

            var application = 'application/layout',
                scope = _.extend(self, data);
            var rendered_view = self.render_sync(view, data);

            scope = {};

            var new_data = {
                content: rendered_view,
                google_analytics: self.req.config.google_analytics,
                view_data: data
            };

            var get_data = {};
            
            // get any data necessary

            async.parallel(get_data, function(err, result){

                new_data = _.extend(new_data, result);
                var app_container = self.views[application].apply(self, [new_data]);

                return callback(null, app_container);
            });
        },
        renderAppOnly: function(data, callback){
            var self = this;

            if(typeof data === 'function'){
                callback = data;
                data = {};
            }

            var application = 'application/layout';

            var cfg = {
                base_url: self.req.config.base_url,
                site_title: self.req.config.site_title,
                site_description: self.req.config.site_description
            };

            var new_data = {
                content: '',
                google_analytics: self.req.config.google_analytics,
                view_data: data,
                user: user_data,
                is_logged_in: self.is_logged_in(),
                config: cfg
            };

            var get_data = {};

            async.parallel(get_data, function(err, result){

                new_data = _.extend(new_data, result);
                var app_container = self.views[application].apply(self, [new_data]);
                
                return callback(null, app_container);
            });
        },
        setData: function(data){
            var self = this;

            _.each(data, function(val, key){
                self[key] = val;
            });
        },
        setJsFilePaths: function(files){
            this.clientJsFiles = files;
        }
    };
};

module.exports = viewRender;