/**
 * Created by JetBrains PhpStorm.
 * User: seanmcgary
 * Date: 7/28/12
 * Time: 11:01 AM
 * To change this template use File | Settings | File Templates.
 */
var _           = require("underscore"),
    hash        = require('hashlib2'),
    main        = require.main.exports,
    mongo       = require('node_mongodb_wrapper');

String.prototype._trim = function(){
    return this.replace(/^\s+|\s+$/g,"");
};

var base_model = function(){
    var self = this;

    var db = mongo.db(main.config.mongodb_hostname, main.config.mongodb_port, main.config.mongodb_database);

    return {
        config: main.config,
        db: db,
        hash: hash,
        ObjectId: function(id){
            if(typeof id === 'undefined'){
                return mongo.ObjectID();
            } else if(id === null){
                return null;
            } else {
                if(typeof id !== 'object'){
                    return mongo.ObjectID("" + id);    
                }

                return id;                
            }
        },
        unix_date_big: function(){
            return (new Date()).getTime();
        },
        unix_date: function(){
            var self = this;
            return Math.round(self.unix_date_big() / 1000);
        },
        date_components: function(date){
            if(typeof date === 'undefined'){
                date = new Date();
            } else {
                date = new Date(date);    
            }

            return {
                day: date.getUTCDate(),
                month: date.getUTCMonth() + 1,
                year: date.getUTCFullYear(),
                hours: date.getUTCHours(),
                minutes: date.getUTCMinutes(),
                seconds: date.getUTCSeconds(),
            }
            
        },
        // takes the data and the field to save on (usually some kind of ID)
        update: function(data, query, collection, callback){
            var self = this;
            db.collection(collection);

            db[collection].findAndModify({
                query: query,
                update: { $set: data },
                new: true
            }, function(err, res){
                if(typeof err !== 'undefined'){
                    err = null;
                } else {
                    err = true;
                }

                callback(err, res);
            });

        },
        update_raw: function(data, query, collection, callback){
            var self = this;

            db.collection(collection);

            db[collection].findAndModify({
                query: query,
                update: data
            }, function(err, res){
                if(typeof err !== 'undefined'){
                    err = null;
                } else {
                    err = true;
                }

                return callback(err, res);
            });
        },
        update_all: function(data, query, collection, callback){
            var self = this;

            db.collection(collection);
            db[collection].update(query, data, false, true, function(err, res){
                if(typeof err !== 'undefined'){
                    err = null;
                } else {
                    err = true;
                }

                return callback(err, res);
            });
        },
        create_new: function(data, collection, upsert, callback){
            var self = this;

            if(typeof upsert === 'function'){
                callback = upsert;
                upsert = false;
            }

            db.collection(collection);
            db[collection].save(data, function(err, doc){
                if(typeof err === 'undefined' || err === null){

                    if(upsert === true && '_id' in data){
                        return self.find_one({ _id: data._id }, collection, callback);
                    } else {
                        return callback(null, doc);
                    }
                } else {
                    return callback(true, doc);
                }
            });
        },
        insert: function(data, collection, callback){
            var self = this;
            db.collection(collection);
            db[collection].insert(data, function(err, doc){
                if(!err){
                    return callback(null, doc);
                } else {
                    return callback(true, data);
                }
            });
        },
        field_exists: function(query, collection, callback){
            var self = this;

            db.collection(collection);
            db[collection].findOne(query, function(err, res){
                if(!err){
                    if(typeof res !== 'undefined'){
                        return callback(null, true);
                    } else {
                        return callback(null, false);
                    }
                } else {
                    return callback(true, res);
                }
            });
        },
        find_all: function(query, collection, options, callback){
            if(typeof options === 'function'){
                callback = options;
                options = {};
            }

            db.collection(collection);

            var query;

            if(_.keys(query).length){
                query = db[collection].find(query);    
            } else {
                query = db[collection].find();    
            }
            

            if('order_by' in options){
                query.sort(options.order_by);
            }

            if('offset' in options){
                query.skip(options.offset);
            }

            if('limit' in options){
                query.limit(options.limit);
            }

            query.toArray(function(err, res){
                if(!err){
                    callback(null, res);
                } else {
                    callback(true, res);
                }
            });
        },
        find_one: function(query, collection, callback){
            db.collection(collection);
            db[collection].findOne(query, function(err, res){
                if(!err){
                    callback(null, res);
                } else {
                    callback(true, res);
                }
            });
        },
        count: function(query, collection, callback){
            var self = this;
            db.collection(collection);
            db[collection].find(query).count(function(err, c){
                if(!err){
                    return callback(null, c);
                } else {
                    return callback(true, err);
                }
            });
        },
        remove: function(query, collection, callback){
            var self = this;

            db.collection(collection);
            db[collection].remove(query, function(err, res){
                if(!err){
                    callback(null, res);
                } else {
                    callback(true, res);
                }
            });
        },
        increment: function(query, increment, collection, callback){
            var self = this;

            db.collection(collection);
            db[collection].update(query, increment, false, true, function(err, res){
                if(!err){
                    return callback(null, res);
                } else {
                    return callback(true, err);
                }
            });
        }
    };
};

module.exports = base_model;
