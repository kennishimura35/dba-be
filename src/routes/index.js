const { Router } = require("express");
const authRouter = require("./authRouter");
const pgsqlRouter = require("./pgsqlRouter");

const routes = Router();
routes.use("/auth", authRouter);
routes.use("/pgsql", pgsqlRouter);

module.exports = routes;
