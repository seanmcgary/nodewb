/**
 * Created by JetBrains PhpStorm.
 * User: seanmcgary
 * Date: 7/29/12
 * Time: 11:14 PM
 * To change this template use File | Settings | File Templates.
 */

var path    = require('path'),
    _       = require('underscore');

var base = {
    models_dir              : path.normalize(__dirname + '/../models'),
    // -- mongodb configuration
    //mongodb_hostname        :'localhost',
    mongodb_hostname        :'localhost',
    mongodb_port            : 27017,
    mongodb_database        : '',
    session_secret          : 'somesecretkey',
    session_key             : 'somesessionkey',

    // -- redis configuration
    redis_db                : 5,
    redis_pass              : '',
    redis_host              : '',
    redis_prefix            : '',
    redis_port              : 6379,
    cookie_domain           : 'localhost',

    // -- express configuration
    views                   : path.normalize(__dirname + '/../views'),
    static                  : path.normalize(__dirname + '/../../client'),
    express_port            : 9000,

    google_analytics        : '',
    // routes where subdomains are not allowed
    restricted_routes       : ['404'],
    // mail stuff
    mail_host               : '',
    mail_port               : 465,
    mail_secure_connection  : true,
    mail_accounts           : {
        support: {
            user: '',
            pass: ''
        }
    },
    base_url                : 'http://localhost',

    numCPUs                 : require('os').cpus().length,
    typekit_token           : '',
    typekit_kit_id          : '',

    //elastic search
    es_host                 : '',
    es_port                 : 9200,
    es_cluster_name         : '',

    // beanstalk config
    beanstalk_server        : '127.0.0.1',
    beanstalk_port          : 11300,
    beanstalk_tubes         : {
    },
    // rabbitmq config
	queue_server            : 'localhost',
    queue_port              : '5672',
    queue_exchange          : '',
    queues                  : {
    },
    site_title              : "",
    site_description        : "",
    site_keywords           : ""
};

var development = {
    // -- mongodb configuration
    mongodb_database        : 'dev_',

    // -- redis configuration
    redis_db                : 5,
    redis_pass              : '',
    redis_host              : '127.0.0.1',
    redis_prefix            : 'something',
    redis_port              : 6379,
    google_analytics        : '',
    cookie_domain           : 'localhost',
    base_url                : 'http://localhost:9000',
    numCPUs                 : 1,
};

var production = {
    // -- mongodb configuration
    mongodb_database        : '',
 
    // -- redis configuration
    redis_pass              : '',
    redis_host              : '127.0.0.1',
    redis_db                : 3,
    redis_prefix            : '',

    // -- express configuration
    express_port            : 9003,
    google_analytics        : '',
    cookie_domain           : '',
    base_url                : '',
    es_cluster_name         : '',
};

exports.base            = base;
exports.development     = _.extend(_.clone(base), development);
exports.production      = _.extend(_.clone(base), production);

