const { Joi } = require('celebrate')

const loginSchema = Joi.object().keys({
    username: Joi.string().max(24).required(),
    password: Joi.string().min(4).required()
}).unknown(true)



module.exports = { loginSchema }