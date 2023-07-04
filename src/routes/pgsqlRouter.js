const express = require("express");
const { PgsqlController } = require('../controller/PgsqlController');
 const { JwtFilter } = require('../middleware/RequestFilter');

const pgsqlController = new PgsqlController();

const router = express.Router();

const multer = require("multer");
const path = require("path");


// router.post("/createOne", JwtFilter)

router.route('/getUsers')
  .get(pgsqlController.getUsers)
router.route('/getDatabases')
  .get(pgsqlController.getDatabases)
router.route('/getSchemas')
  .get(pgsqlController.getSchemas)

module.exports = router;