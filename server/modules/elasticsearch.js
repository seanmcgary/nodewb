var _ 		= require('underscore'),
	http 	= require('http'),
	util 	= require('util');	 


var elasticsearch = function(config){
	var self = this;

	self.host = config.es_host;
	self.cluster_name = config.es_cluster_name;
	self.port = config.es_port;

	var post = function(path, data, callback){
		if(typeof data === 'function'){
			callback = data;
			data = undefined;
		}

		var options = {
			host: self.host,
			path: path,
			method: 'POST',
			port: self.port
		};

		make_request(options, JSON.stringify(data), callback);
	};

	var get = function(path, callback){
		var options = {
			host: self.host,
			path: path,
			method: 'GET',
			port: self.port
		};

		make_request(options, callback);
	};

	var put = function(path, data, callback){
		if(typeof data === 'function'){
			callback = data;
			data = undefined;
		}

		var options = {
			host: self.host,
			path: path,
			method: 'PUT',
			port: self.port
		};

		make_request(options, JSON.stringify(data), callback);
	};

	var del = function(path, data, callback){
		if(typeof data === 'function'){
			callback = data;
			data = undefined;
		}

		var options = {
			host: self.host,
			path: path,
			method: 'DELETE',
			port: self.port
		};

		make_request(options, JSON.stringify(data), callback);
	};

	var make_request = function(options, payload, callback){
		if(typeof payload === 'function'){
			callback = payload;
			payload = null;
		}

		var req = http.request(options, function(res){
			
			var data = '';
			res.on('data', function(chunk){
				data += chunk.toString();
			});

			res.on('end', function(){
				var json = null;

				try {
					json = JSON.parse(data);
				} catch(err){
					json = null;
				}

				if(json === null){
					return callback(true, { msg: 'BAD_RESPONSE', data: res.headers });
				}

				return callback(false, json);
			});
		});

		req.on('error', function(err){
			return callback(true, { msg: 'REQUEST_ERROR', data: err })
		});

		if(typeof payload === 'string'){
			req.write(payload);
		}

		req.end();
	}

	return _.extend(self, {
		search: function(index, query, callback){
			var self = this;

			if(typeof query === 'function'){
				callback = query;
				query = null;
			}

			var path = '/' + self.cluster_name + '/';

			if(index !== null){
				path += index + '/';
			}

			path += '_search';			
			post(path, query, function(err, data){
				if(err === false){
					return callback(false, data.hits);
				} else {
					return callback(true, data);
				}
			});
		},
		/**
		 * Update or insert a new record based on ID
		 * 
		 * Note: 	If updating, it will OVERWRITE all existing data for that id.
		 * 			Need to pass in entire object as it should be in elastic search
		 */
		upsert: function(index, data, id, callback){
			var self = this;

			var path = '/' + self.cluster_name + '/' + index + '/' + id;

			post(path, data, callback);
		},
		delete_index: function(index, callback){
			var self = this;

			var path = '/' + self.cluster_name + '/' + index;

			del(path, callback);
		},
		create_cluster: function(cluser_name, settings, callback){
			var self = this;

			var path = '/' + cluster_name;

			put(path, settings, callback);
		},
		delete_cluster: function(cluster_name, callback){
			var self = this;

			var path = '/' + cluster_name;

			del(path, callback);
		}

	});
};

module.exports = elasticsearch;