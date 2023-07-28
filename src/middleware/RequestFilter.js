const { Unauthorized } = require('../helper/ResponseUtil')
const { verifyJwt, addConnection } = require('../helper/JwtUtil')


const getToken = (bearer) => {
    return bearer.slice(7, bearer.length)
}

const JwtFilter = (req, res, next) => {
    if(req.headers.authorization) {
        const token = getToken(req.headers.authorization)

        if(verifyJwt(req, token)) {
            next()
        } else {
            Unauthorized(res, 'Token is not valid')
        }
    } else {
        Unauthorized(res, 'Token is missing')
    }    
}

const ConnFilter = (req, res, next) => {
    if(req.body.PG_DATABASE) {
        req.app.locals.PG_DATABASE = req?.body?.PG_DATABASE
        req.app.locals.PG_HOST = req?.body?.PG_HOST
        req.app.locals.PG_PORT = req?.body?.PG_PORT
        req.app.locals.PG_USER = req?.body?.PG_USER
        req.app.locals.PG_PASS = req?.body?.PG_PASS
        next()
        
    } else {
        Unauthorized(res, 'Missing')
    }    
}

const PermissionFilter = (perm) => {
    
    
    return (req, res, next) => {
        
        const data = req.app.locals.permission
        let error
        const http_method = perm[0];
        const api_url_name = perm[1];
        data.forEach(permission => {  
            if(http_method == permission.http_method && api_url_name == permission.api_url_name){
                error = "No"
                return next()
            }
           
          });
        
          if(error != "No"){
            error = "Yes"
            return Unauthorized(res, 'No Permission Access')
            }
        
    }
    
}



module.exports = { JwtFilter, PermissionFilter, ConnFilter }