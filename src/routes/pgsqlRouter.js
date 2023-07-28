const express = require("express");
const { PgsqlController } = require('../controller/PgsqlController');
 const { JwtFilter, ConnFilter } = require('../middleware/RequestFilter');

const pgsqlController = new PgsqlController();

const router = express.Router();

const multer = require("multer");
const path = require("path");


router.post("/loginDatabase", ConnFilter)

router.route('/getUsers')
  .get(pgsqlController.getUsers)
router.route('/getDatabases')
  .get(pgsqlController.getDatabases)
router.route('/getSchemas')
  .get(pgsqlController.getSchemas)

router.route('/loginDatabase')
  .post(pgsqlController.loginDatabase)

router.route('/grantAllToAllSchemas')
  .post(pgsqlController.grantAllToAllSchemas)

module.exports = router;