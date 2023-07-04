const jwt = require('jsonwebtoken')
const secret = process.env.JWT_SECRET

const verifyJwt = (req, token) => {
    try {
        var decoded = jwt.verify(token, secret);
        //console.log(decoded.permission)
        // set userId into request
        req.app.locals.id_user = decoded.id_user
        req.app.locals.username = decoded.username

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

module.exports = { verifyJwt, createJwtToken }