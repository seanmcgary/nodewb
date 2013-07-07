
// give an instance of req to the view renderer
var default_middleware = function(req, res, next){
    res.view_render.set_server_data(req, res);

    if(!req.session){
    	req.session = {};
    }

    res.header('Cache-Control',' no-cache');

    return next();
};

module.exports = default_middleware;