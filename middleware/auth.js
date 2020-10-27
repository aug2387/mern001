const jwt = require('jsonwebtoken');
const config = require('config');

// middleware function taked 3 things, next is callback for move to next piece of middleware
// req and res cycle of object
module.exports = function(req, res, next) {
    // get token from header (object req have header properties)
    const token = req.header('x-auth-token');

    // check if no token
    if (!token) {
        return res.status(401).json({ msg: 'No token, authorization denied' });
    }

    // verify token
    try {
        const decoded = jwt.verify(token, config.get('jwtSecret'));
        req.user = decoded.user;
        next();
    } catch (error) {
        res.status(401).json({ msg: 'Token is not valid' });
    }
}