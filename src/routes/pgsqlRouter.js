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
router.route('/getTables')
  .get(pgsqlController.getTables)
router.route('/getPermissions')
  .get(pgsqlController.getPermissions)
router.route('/getTableSize')
  .get(pgsqlController.getTableSize)

router.route('/loginDatabase')
  .post(pgsqlController.loginDatabase)

router.route('/grantAllToAllSchemas')
  .post(pgsqlController.grantAllToAllSchemas)
  
router.route('/grantAllTablesToAllSchemas')
.post(pgsqlController.grantAllTablesToAllSchemas)

router.route('/grantAllToSchema')
  .post(pgsqlController.grantAllToSchema)
  
router.route('/grantAllTablesToSchema')
.post(pgsqlController.grantAllTablesToSchema)

router.route('/grantAllToDatabase')
  .post(pgsqlController.grantAllToDatabase)
  
router.route('/createSchema')
.post(pgsqlController.createSchema)
  
router.route('/createDatabase')
.post(pgsqlController.createDatabase)

router.route('/createUser')
.post(pgsqlController.createUser)

module.exports = router;