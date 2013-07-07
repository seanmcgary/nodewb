/**
 * Created by JetBrains PhpStorm.
 * User: seanmcgary
 * Date: 7/27/12
 * Time: 8:53 PM
 * To change this template use File | Settings | File Templates.
 */
var routes  = require('./config/routes.js'),
    async   = require('async'),
    _       = require('underscore'),
    colors  = require('colors'),
    main    = require.main.exports;

var router = function(express){
    var self = this;

    var app = main.create_app();

    self.express = express;
    self.app = app;
    self.config = main.config;
    self.parse_routes();
};

router.prototype.parse_routes = function(){
    var self = this;
    var route_queue = [];

    for(var i in routes.routes){
        var route_process = (function(route){
            return function(cb){
                var action = route.action.split("#");
                var controller = action[0];
                action = action[1] || null;

                if(controller in routes.controllers){
                    // inject stuff here I

                    controller = new routes.controllers[controller](main.models, self.config);

                    if(!(action in controller)){
                        console.log('ERR: action "%s" doesnt exist', action);
                    } else {

                        var middleware = routes.middleware;

                        if('middleware' in route && route.middleware.length){
                            middleware = middleware.concat(route.middleware);
                        }
                        
                        self.app[route.via](route.route, middleware, function(req, res){
                            console.log('[ %s ]'.cyan + '\t\t %s', route.via, (route.via == 'get' ? " " : "") + req.url);
                            controller[action](req, res);
                        });
                    }

                } else {
                    console.log('ERR: Controller "%s" doesnt exist in routes.controllers', controller);
                }

                cb(null);
            };

        })(routes.routes[i]);

        route_queue.push(route_process);
    }

    async.parallel(route_queue, function(err, res){
        self.app.listen(self.config.express_port);

    });
};

exports.router = router;