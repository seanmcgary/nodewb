var q = require('q'),
	http = require('http'),
	https = require('https'),
	_ = require('underscore'),
	qs = require('querystring');

var createQueryString = function(url, data){
	
	data = data || {};

	_.each(data, function(v, k){
		if(typeof v === 'undefined'){
			delete data[k];
		}
	});

	return (url + '?' + qs.stringify(data));

};


module.exports = function(params){

	var dfaults = {
		secure: false,
		host: null,
		port: 80,
	};

	var options = _.extend(dfaults, params);

	var makeRequest = function(url, method, data){
		var deferred = q.defer();

		data = data || {};
		_.each(data, function(v, k){
			if(typeof v === 'undefined'){
				delete data[k];
			}
		});

		var opts = _.extend({
			url: url,
			method: method
		}, options);

		var req = (options.secure ? https : http).request(opts, function(res){
			
			var data = '';
			req.on('data', function(d){
				data += d.toString();
			});

			req.on('end', function(){
				var json;

				try {
					json = JSON.parse(data);
				} catch(e){};

				if(!json){
					deferred.reject(new Error('Invalid payload'));
				}

				deferred.resolve(data);
			});
		});
	
		req.on('error', function(err){
			deferred.reject(new Error(err));
		});


		if(method != 'GET' && data){
			req.write(JSON.stringify(data));
		}

		req.end();

		return deferred.promise();
	};

	return _.extend(this, {
		get: function(options){
			var url = options.url || '';

			url = createQueryString(url, options.data);
			
			return makeRequest(url, 'GET');
		},
		post: function(options){
			var url = options.url || '';

			return makeRequest(url, 'POST', options.data);
		},
		put: function(options){
			var url = options.url || '';

			return makeRequest(url, 'PUT', options.data);
		},
		del: function(options){
			var url = options.url || '';

			return makeRequest(url, 'DEL', options.data);
		}
	});

};

