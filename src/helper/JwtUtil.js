const jwt = require('jsonwebtoken')
const secret = process.env.JWT_SECRET

const verifyJwt = (req, token) => {
    try {
        var decoded = jwt.verify(token, secret);
        // console.log(decoded)
        //console.log(decoded.permission)
        // set userId into request
        req.app.locals.PG_DATABASE = decoded.database
        req.app.locals.PG_HOST = decoded.host
        req.app.locals.PG_PASS = decoded.password
        req.app.locals.PG_PORT = decoded.port
        req.app.locals.PG_USER = decoded.user

        return true
    } catch(err) {
        return false
    }
    
}

const addConnection = (req, token) => {
    console.log(req)
    try {
    
        req.app.locals.PG_DATABASE = req?.PG_DATABASE
        req.app.locals.PG_HOST = req?.PG_HOST
        req.app.locals.PG_PORT = req?.PG_PORT
        req.app.locals.PG_USER = req?.PG_USER
        req.app.locals.PG_PASS = req?.PG_PASS

        return true
    } catch(err) {
        return false
    }
    
}


const createJwtToken = (data) => {
    let expires = process.env.JWT_EXPIRED
    return jwt.sign(data, process.env.JWT_SECRET, {
        expiresIn: expires
    });
}

module.exports = { verifyJwt, createJwtToken, addConnection }