/**
 * Created by JetBrains PhpStorm.
 * User: seanmcgary
 * Date: 7/27/12
 * Time: 8:54 PM
 * To change this template use File | Settings | File Templates.
 */

function controller_path(controller){
    return '../controllers/' + controller + '.js';
};


var middleware_objects = {
    "default"           : require('../middleware/default'),
    auth                : require('../middleware/auth')
};

// default middleware
var middleware = [middleware_objects['default']];

var routes = [

    { route:"/",                                                    via:'get',  action:"home#index" },
    { route:"/404",                                                 via:'get',  action:"home#not_found" },
    { route:"/sitemap.xml",                                         via:'get',  action:"home#sitemap" },
    { route:"/robots.txt",                                          via:'get',  action:"home#robots" },
    { route:"/view_templates.js",                                   via:'get',  action:"home#view_templates" },
];

var controllers = {
    noop                : function(req, res){ console.log('noop'); res.send(req.url) },
    home                : require(controller_path('home')),
};

exports.controllers = controllers;
exports.routes = routes;
exports.middleware = middleware;

