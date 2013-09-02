/**
 * Created by JetBrains PhpStorm.
 * User: seanmcgary
 * Date: 7/27/12
 * Time: 8:50 PM
 * To change this template use File | Settings | File Templates.
 */
var express         = require('express'),
    _               = require('underscore'),
    router          = require('./router.js').router,
    redis_store     = require('connect-redis')(express),
    redis           = require('redis'),
    _config         = require('./config/config.js'),
    _view_render    = require('./modules/view_render.js'),
    async           = require('async'),
    optimist        = require('optimist').argv,
    fs              = require('fs'),
    colors          = require('colors'),
    cluster         = require('cluster'),
    connect         = require('connect'),
    mongo           = require('node_mongodb_wrapper'),
    logger          = require('./modules/logger');

var env;

switch(optimist.env){
    case 'production':
        env = 'production';
        break;
    case 'development':
        env = 'development';
        break;
    default:
        env = 'development';
        break;
}

config = _config[env];

config.env = env;

module.exports.logger = logger;

var cache;

var create_app = module.exports.create_app = function(){
    module.exports.config = config;
    
    var view_compiler = new require('./modules/view_compiler.js').view_compiler(config.views);
    var view_render = new _view_render();

    var views = exports.views = view_compiler.compile();
    var clientJsFileList = view_compiler.generateClientJsFiles();

    view_render.set_viewpath(config.views);
    view_render.set_views(views.views);
    view_render.setJsFilePaths(clientJsFileList);

    module.exports.view_render = view_render;

    module.exports.models = require('./modules/models');
    module.exports.cache  = cache;

    var app = new express();

    app.configure(function(){
        app.use(connect.compress());
        app.use(express.cookieParser());

        var session_options = {
            secret: config.session_secret,
            key: config.session_key,
            store: new redis_store({
                db: config.redis_db,
                host: config.redis_host,
                pass: config.redis_pass,
                prefix: config.redis_prefix
            })
        };

        if(env == 'production' || env == 'demo'){
            session_options.cookie = {
                domain: config.cookie_domain
            };
        }

        app.use(express.session(session_options));

        var upload_dir = config.upload_dir;
        var tmp_dir = upload_dir;

        // make sure to serve static files before hitting the router
        app.use(express.bodyParser());

        // views dir
        app.set('views', config.views);

        app.use(express.static(config.static));
        app.use(app.router);

        app.response.viewPath = __dirname + config.views;
        app.response.view_render = view_render;
        app.request.config = config;
    });

    return app;
};

var startServer = function(){
    if(cluster.isMaster){
        for(var i = 0; i < config.numCPUs; i++){
            console.log("starting working #" + (i + 1));
            cluster.fork();
        }

        cluster.on('death', function(worker){
            console.log("worker " + worker.pid + " died");
        });


    } else {
        console.log(("running in " + env + " mode on port " + config.express_port).green);
        new router(express);
    }
};

cache = redis.createClient(config.redis_port, config.redis_host);
cache.auth(config.redis_pass, function(){
    console.log((logger.pad_message('redis', 40) + 'Redis authenticated').green);        
});

cache.on('error', function(){
    console.log(arguments);
    console.log((logger.pad_message('redis', 40) + 'Redis error').red);
});

cache.on('connect', function(){
    console.log((logger.pad_message('redis', 40) + 'Redis connected').green);
});

cache.on('ready', function(){
    console.log((logger.pad_message('redis', 40) + 'Redis ready').green);
    startServer();
});

