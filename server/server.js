
var express         = require('express'),
    _               = require('underscore'),
    redis_store     = require('connect-redis')(express),
    redis           = require('redis'),
    _config         = require('./config/config.js'),
    _viewRender    = require('./modules/viewRender.js'),
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
module.exports.config = config;

var viewCompiler = new require('./modules/viewCompiler')(config.views);
var viewRender = new _viewRender();

var views = exports.views = viewCompiler.compile();
var clientJsFileList = viewCompiler.generateClientJsFiles();

viewRender.setData({
    views: views.views,
    clientJsFiles: clientJsFileList
});

module.exports.viewRender = viewRender;

module.exports.models = require('./modules/models');
module.exports.cache  = cache;

var server = express();

var app = server.configure(function(){

    server.use(connect.compress());
    server.use(express.cookieParser());

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

    server.use(express.session(session_options));

    // make sure to serve static files before hitting the router
    server.use(express.bodyParser());

    // views dir
    server.set('views', config.views);

    server.use(express.static(config.static));

    server.response.viewPath = __dirname + config.views;
    server.response.viewRender = viewRender;
    server.request.config = config;
});

var cache;

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
        app.listen(config.express_port);
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

// ----------------------------------------------------------------------------
// MIDDLEWARE
// ----------------------------------------------------------------------------
server.use(function(req, res, next){
    res.view_render.set_server_data(req, res);
    if(!req.session){
        req.session = {};
    }

    res.header('Cache-Control',' no-cache');
    console.log((logger.padMessage(req.method)).cyan + req.url);

    return next();
});

// ----------------------------------------------------------------------------
// ROUTES
// ----------------------------------------------------------------------------
server.get('/viewTemplates.js', function(req, res){
    res.set('Content-Type', 'text/javascript');
    res.send(views.compiled_views);
});

