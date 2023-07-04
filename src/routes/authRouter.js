const express = require('express')
const AuthController = require('../controller/AuthController')
const { JwtFilter } = require('../middleware/RequestFilter')
const { celebrate } = require('celebrate')
const { loginSchema } = require('../schema/AuthSchema')

const ctrl = new AuthController()
const authRouter = express.Router()

// base route /auth
authRouter.post('/login', celebrate({ body: loginSchema}), ctrl.login)
authRouter.post('/registration', JwtFilter, ctrl.registration)



module.exports = authRouter