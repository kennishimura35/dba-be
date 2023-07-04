const { Router } = require("express");
const authRouter = require("./authRouter");
const pgsqlRouter = require("./pgsqlRouter");

const routes = Router();
routes.use("/auth", authRouter);
routes.use("/invitation", pgsqlRouter);

module.exports = routes;
