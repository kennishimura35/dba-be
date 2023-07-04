const { Ok, BadRequest, Unauthorized, InternalServerErr, NotFound } = require('../helper/ResponseUtil')
const { getUserByUsername} = require('../model/User')
const { createJwtToken } = require('../helper/JwtUtil')
const moment = require('moment');

const md5 = require('md5')

class AuthController {

    async login(req, res) {
        const param = req.body
        const validUsernameRegexp = /^[a-zA-Z0-9_]+$/; // a-z U 0-9 U _
        
        try {
            const user = await getUserByUsername(param.username)
            let role = ''
            let expired;
            let data = ''
            let nDate = new Date()
            
            if(user != undefined){
                expired = user.expired
            }
        
              //console.log(permissions)
            if(param.username.search(validUsernameRegexp)){
                return Unauthorized(res, ['Field username tidak boleh berisikan karakter selain huruf, angka, atau undescore'])
            }
          
            if(user == null) {
                Unauthorized(res, ['Login gagal, masukkan username dan password yang benar!'])
            }
            
            else if(user.expired < nDate){
                Unauthorized(res, ['Login gagal, akun tidak aktif(expired)'])
            }
            else {
                if(md5(param.password) == user.password) {

                    let data = {
                        id_user: user.id_user, 
                        expired: moment.utc(user.expired).format('YYYY-MM-DD HH:mm:ss'),
                        username: user.username,
                        email: user.email
                    }
                    
                    data.token = createJwtToken(data)
                    Ok(res, ['Proses Login Berhasil'], data)
                } else {
                    Unauthorized(res, ['Login gagal, masukkan username dan password yang benar!'])
                }
            }
        } catch(err) {
            console.log("login", err)
            InternalServerErr(res, ["Error during authentication"])
        }
    }

    async registration(req, res) {
        return Ok(res, ['Dummy Registrasi Sukses!'])
    }

    

    
}

module.exports = AuthController