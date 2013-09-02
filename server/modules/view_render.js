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

var view_render = function(){

    var view_path = '';
    var application_template = 'application.ejs';
    var req = null;

    var months = [ "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December" ];
    var short_months = [ "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec" ];

    return {
        months: [ "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December" ],
        short_months: [ "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec" ],
        config: main.config,
        is_logged_in: function(){
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
        format_blog_link: function(blog, user){
            if((user.plan == 'professional' || user.plan == 'plus') && blog.cname !== null && blog.cname.length){
                return 'http://' + blog.cname + '/';
            } else {
                return 'http://' + blog.url + '.scribbbl.es';
            }
        },
        format_post_link: function(blog, post){
            if(blog.cname !== null && blog.cname.length){
                return 'http://' + blog.cname + '/' + post.url;
            }

            return 'http://' + blog.url + '.scribbbl.es/' + post.url; 
        },
        format_unix_date: function(date){
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

            return short_months[date.getMonth()] + " " + date.getDate() + ", " + date.getFullYear() + " at " + hours + ":" + minutes + " " + meridian;
        },
        format_datetime: function(datetime){
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

            return short_months[date.getMonth()] + " " + date.getDate() + ", " + date.getFullYear() + " at " + hours + ":" + minutes + " " + meridian;
        },
        format_short_date: function(datetime){
            var self = this;

            var date = new Date(datetime);

            return short_months[date.getMonth()] + " " + date.getDate() + ", " + date.getFullYear();

        },
        content_preview: function(content){
            
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
        render_sync: function(view, data){
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
        render_app: function(view, data, callback){
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
        render_app_only: function(data, callback){
            var self = this;

            if(typeof data === 'function'){
                callback = data;
                data = {};
            }

            var application = 'application/layout';

            var public_user_fields = ['username', 'full_name', 'user_id', 'headline_display', 'account_type'];

            var user_data = {};
            if(self.req.session && self.req.session.user){
                _.each(public_user_fields, function(field){
                    user_data[field] = self.req.session.user[field];
                });
            }

            var cfg = {
                fb_app_id: self.req.config.facebook.app_id,
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
        set_viewpath: function(path){
            view_path = path + '/';
        },
        set_app_template: function(tmpl_name){
            application_template = tmpl_name;
        },
        set_server_data: function(req, res){
            var self = this;

            self.req = req;
            self.res = res;
        },
        set_views: function(views){
            var self = this;

            self.views = views;
        },
        setJsFilePaths: function(files){
            this.clientJsFiles = files;
        }
    };
};

module.exports = view_render;