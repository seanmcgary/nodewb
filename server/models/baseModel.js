
var _ = require("underscore"),
    main = require.main.exports,
    mongo = require('mongodb-wrapper'),
    eventEmitter = require('events').EventEmitter,
    async = require('async');


var formatter = (function(){
    var self = this;

    self = Object.create(eventEmitter.prototype);

    self.trigger = function(event, err, data, callback){
        if(!err && events[event]){
            return self.emit(event, err, data, callback);
        } else {
            return callback(err, data);
        }
    };

    // put events here
    var events = {
        
    };

    // register events
    _.each(events, function(eventFunc, event){
        self.on(event, function(err, data, callback){
            if(data){
                return events[event](err, data, callback);
            } else {
                return callback(err, data);
            }
        });
    });

    return self;
})();

var baseModel = function(){
    var self = this;

    var db = mongo.db(main.config.mongodb_hostname, main.config.mongodb_port, main.config.mongodb_database);

    return {
        config: main.config,
        db: db,
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
        /* 
            options: {
                query: <object>
                options: <object>
                collection: <string>
                callback: <function>,
                event: <string>
            }
        */
        _findAll: function(params, callback){
            var self = this;

            if(!callback){
                callback = noop;
            }

            var options = _.extend({
                query: {},
                options: {}
            }, params);

            if(!options.collection){
                return options.callback(true, 'No collection selected');
            }

            self.findAll(options.query, options.collection, options.options, function(err, data){
                if(err === null){
                    return formatter.trigger(options.event, err, data, callback);
                    
                } else {
                    return options.callback(true, data);
                }
            });
        },
        /* 
            options: {
                query: <object>
                options: <object>
                collection: <string>
                event: <string>
            },
            callback
        */
        _findOne: function(params, callback){
            var self = this;

            if(!callback){
                callback = noop;
            }

            var options = _.extend({
                query: {},
                options: {}
            }, params);

            self.findOne(options.query, options.collection, function(err, data){
                if(err === null){
                    return formatter.trigger(options.event, err, data, callback);
                } else {
                    return callback(true, null);
                }
            });
        },
        // takes the data and the field to save on (usually some kind of ID)
        /* 
            options: {
                query: <object>
                options: <object>
                collection: <string>
                event: <string>
            },
            callback
        */
        update: function(params, callback){
            var self = this;

            if(!params.collection){
                return callback(true, 'No collection provided');
            }

            if(!params.data){
                return callback(true, 'No data provided');
            }

            var options = _.extend({
                query: {},
                options: {},
            }, params);

            db.collection(options.collection);

            db[options.collection].findAndModify({
                query: options.query,
                update: options.data,
                new: true
            }, function(err, data){
                if(!err){
                    return formatter.trigger(options.event, null, data, callback);
                } else {
                    return callback(true, data);
                }
            });

        },
        updateAll: function(params, callback){
            var self = this;

            if(!params.collection){
                return callback(true, 'No collection provided');
            }

            if(!params.data){
                return callback(true, 'No data provided');
            }

            var options = _.extend({
                query: {},
                options: {},
            }, params);

            db.collection(options.collection);
            db[options.collection].update(options.query, options.data, false, true, function(err, data){
                if(!err){
                    return formatter.trigger(options.event, null, data, callback);
                } else {
                    return callback(true, data);
                }
            });
        },
        createNew: function(params, callback){
            var self = this;

            if(!params.collection){
                return callback(true, 'No collection provided');
            }

            if(!params.data){
                return callback(true, 'No data provided');
            }

            var options = _.extend({
                options: {},
                upsert: false
            }, params);

            db.collection(options.collection);
            db[options.collection].save(options.data, function(err, doc){
                if(!err){
                    if(options.upsert && options.data._id){
                        return self._findOne({
                            query: { _id: self.ObjectId(options.data._id) },
                            collection: options.collection,
                            event: options.event
                        }, function(err, data){
                            if(!err){
                                return formatter.trigger(options.event, null, data, callback);
                            } else {
                                return callback(true, data);
                            }
                        });
                    } else {
                        return callback(null, doc);
                    }
                } else {
                    return callback(true, doc);
                }
            });
        },
        findAll: function(query, collection, options, callback){
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
            

            if(options.orderBy){
                query.sort(options.orderBy);
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
        findOne: function(query, collection, callback){
            db.collection(collection);
            db[collection].findOne(query, function(err, res){
                if(!err){
                    callback(null, res);
                } else {
                    callback(true, res);
                }
            });
        },
        distinct: function(params, callback){
            var self = this;

            if(!params.collection){
                return callback(true, 'No collection provided');
            }

            var options = _.extend({
                query: {},
                key: ''
            }, params);

            db.collection(options.collection);
            db[options.collection].distinct(options.key, options.query, function(err, res){
                if(!err){
                    callback(null, res);
                } else {
                    callback(true, res);
                }
            });
        },
        remove: function(params, callback){
            var self = this;

            if(!params.collection){
                return callback(true, 'No collection provided');
            }

            var options = _.extend({
                query: {},
                options: {},
            }, params);

            db.collection(options.collection);
            db[options.collection].remove(options.query, function(err, res){
                if(!err){
                    callback(null, res);
                } else {
                    callback(true, res);
                }
            });
        }
    };
};

module.exports = baseModel;
