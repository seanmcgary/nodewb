
var auth_middleware = function(req, res, next){
    if(!('user' in req.session) || req.session.user === null){
        return res.redirect('/login');
    }

    next();
};

module.exports = auth_middleware;
