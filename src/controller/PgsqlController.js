const { Pgsql } = require("../model/Pgsql");
const moment = require('moment');
const uuid = require("uuid").v4;
const localStorage = require("localStorage");
const { Ok, BadRequest, InternalServerErr, DataUpdated, DataDeleted, SearchOk, NotFound, DataCreated } = require("../helper/ResponseUtil");
require('dotenv').config();

class PgsqlController {
  #pgsql;

  constructor() {
    this.#pgsql = new Pgsql();
  }


  convertInputFilter(req) {
    let pgsql_name = !req.query.pgsql_name ? "" : req.query.pgsql_name.toLowerCase();
    
    
    return { pgsql_name };
  }

  isNumber(val) {
    return !isNaN(val);
  }

  validateInputPagination(req) {
    const messages = [];

    let page = !req.query.page ? 1 : req.query.page;
    let perPage = !req.query.perPage ? 10 : req.query.perPage;
    let orderBy = !req.query.orderBy ? "pgsql_name" : req.query.orderBy.toString();
    let orderValue = !req.query.orderValue
      ? "ASC"
      : req.query.orderValue.toString().toUpperCase();
     
      

    if (!this.isNumber(page)) {
      messages.push(
        "Nilai field 'page' tidak sesuai ketentuan, contoh: 1, 2, ..."
      );
    }
    
    if (page <= 0) {
      messages.push("Nilai field 'page' harus lebih besar dari nol");
    }
    


    if (!this.isNumber(perPage)) {
      messages.push(
        "Nilai field 'perPage' tidak sesuai ketentuan, contoh: 5, 10, ..."
      );
    } else if (perPage <= 0) {
      messages.push("Nilai field 'perPage' harus lebih besar dari nol");
    }

    
    if (
      !["created_at", "pgsql_name"].includes(orderBy)
    ) {
      messages.push(
        "Nilai field 'orderBy' harus diantara created_at, pgsql_name"
      );
    } else {
      orderBy = orderBy === "created_at" ? "created_at" : orderBy;
      orderBy = orderBy === "pgsql_name" ? "pgsql_name" : orderBy;
    }

    if (!["ASC", "DESC"].includes(orderValue)) {
      messages.push(
        "Nilai field 'orderValue' harus diantara 'ASC' atau 'DESC'"
      );
    }

    return {
      messages,
      page: parseInt(page),
      perPage: parseInt(perPage),
      orderBy,
      orderValue,
    };
  }

 

  getUsers = (req, res) => {
    const messages = [];

    this.#pgsql.getUsers(req, (err, data) => {
      if (err) {
        messages.push('Internal error');
        messages.push(err.message);
        return InternalServerErr(res, messages);
      }

      messages.push(`Users berhasil ditemukan`);
      const users  = [];

      data.forEach(user => {
        users.push({
          user : user.usename
        });
      });

      return Ok(
        res,
        messages,
        users
      );
 
    });
  }

  getDatabases = (req, res) => {
    const messages = [];

    this.#pgsql.getDatabases((err, data) => {
      if (err) {
        messages.push('Internal error');
        messages.push(err.message);
        return InternalServerErr(res, messages);
      }

      messages.push(`Databases berhasil ditemukan`);
      const databases  = [];

      data.forEach(database => {
        databases.push({
          datname : database.db_name,
          db_size: database.db_size
        });
      });

      return Ok(
        res,
        messages,
        databases
      );
 
    });
  }

  getDatabaseSize = (req, res) => {
    const messages = [];

    this.#pgsql.getDatabaseSize(req, (err, data) => {
      if (err) {
        messages.push('Internal error');
        messages.push(err.message);
        return InternalServerErr(res, messages);
      }

      messages.push(`Databases berhasil ditemukan`);
      const databases  = [];
      data.forEach(database => {
        databases.push({
          database_name : database.db_name,
          pg_size_pretty : database.db_size,
        });
      });

      return Ok(
        res,
        messages,
        databases
      );
 
    });
  }

  getSchemas = (req, res) => {
    const messages = [];
   
    this.#pgsql.getSchemas((err, data) => {
      if (err) {
        messages.push('Internal error');
        messages.push(err.message);
        return InternalServerErr(res, messages);
      }

      messages.push(`Schemas berhasil ditemukan`);
      const schemas  = [];

      data.forEach(schema => {
        schemas.push({
          schema_name : schema.schema_name
        });
      });

      return Ok(
        res,
        messages,
        schemas
      );
 
    });
  }

  getTables = (req, res) => {
    const messages = [];
    const schema = req.query.schema
    this.#pgsql.getTables(schema, (err, data) => {
      if (err) {
        messages.push('Internal error');
        messages.push(err.message);
        return InternalServerErr(res, messages);
      }

      messages.push(`tables berhasil ditemukan`);
      const schemas  = [];

      data.forEach(schema => {
        schemas.push({
          table_name : schema.table_name
        });
      });

      return Ok(
        res,
        messages,
        schemas
      );
 
    });
  }

  getPermissions = (req, res) => {
    const messages = [];
    const schemata = {
      grantee: req.query.grantee,
      table_schema: req.query.table_schema,
      table_name: req.query.table_name
    }

    this.#pgsql.getPermissions(schemata, (err, data) => {
      if (err) {
        messages.push('Internal error');
        messages.push(err.message);
        return InternalServerErr(res, messages);
      }

      messages.push(`permissions berhasil ditemukan`);
      const schemas  = [];

      data.forEach(schema => {
        schemas.push({
          grantor : schema.grantor,
          grantee: schema.grantee,
          database: schema.table_catalog,
          table_schema: schema.table_schema,
          table_name: schema.table_name,
          privilege_type: schema.privilege_type
        });
      });

      return Ok(
        res,
        messages,
        schemas
      );
 
    });
  }

  getTableSize = (req, res) => {
    const messages = [];
    const schemata = req.query.schema
    const table_name = req.query.table_name
    this.#pgsql.getTableSize(schemata, table_name,(err, data) => {
      if (err) {
        messages.push('Internal error');
        messages.push(err.message);
        return InternalServerErr(res, messages);
      }

      messages.push(`Table berhasil ditemukan`);
      const schemas  = [];

      data.forEach(schema => {
        schemas.push({
          table_schema : schema.table_schema,
          table_name: schema.table_name,
          pg_relation_size: schema.pg_relation_size,
          pg_size_pretty: schema.pg_size_pretty
        });
      });

      return Ok(
        res,
        messages,
        schemas
      );
 
    });
  }

  loginDatabase = (req, res) => {
    const messages = [];

    req.app.locals.PG_DATABASE= req?.body?.PG_DATABASE
    req.app.locals.PG_HOST= req?.body?.PG_HOST
    req.app.locals.PG_PORT= req?.body?.PG_PORT
    req.app.locals.PG_USER= req?.body?.PG_USER
    req.app.locals.PG_PASS= req?.body?.PG_PASS

    this.#pgsql.loginDatabase(req, (err, data) => {
      if (err) {
        messages.push('Internal error');
        messages.push(err.message);
        return InternalServerErr(res, messages);
      }

      messages.push(`Berhasil melakukan Login!`);
      const schemas  = [];

      data.forEach(schema => {
        schemas.push({
          schema_name : schema.schema_name
        });
      });

      return Ok(
        res,
        messages,
        schemas
      );
 
    });
  }

  grantAllToAllSchemas = (req, res) => {
    const messages = [];
    const schemas = req.body.schemas;
    const user = req.body.user;

    if (schemas === null || user === null){
      return InternalServerErr(res, "Data not valid");
    }

    this.#pgsql.grantAllToAllSchemas(schemas, user, (err, data) => {
      if (err) {
        messages.push('Internal error');
        messages.push(err.message);
        return InternalServerErr(res, messages);
      }

      messages.push(`Granted user ${user}`);
      const datas  = [];

        data.forEach(dt => {
          datas.push({
            command : dt.command
          });
        });

        return DataCreated(
          res,
          messages,
        );
  
      });
    }

  grantAllTablesToAllSchemas = (req, res) => {
    const messages = [];
    const schemas = req.body.schemas;
    const user = req.body.user;

    if (schemas === null || user === null){
      return InternalServerErr(res, "Data not valid");
    }

    this.#pgsql.grantAllTablesToAllSchemas(schemas, user, (err, data) => {
      if (err) {
        messages.push('Internal error');
        messages.push(err.message);
        return InternalServerErr(res, messages);
      }

      messages.push(`Granted user ${user}`);
      const datas  = [];

        data.forEach(dt => {
          datas.push({
            command : dt.command
          });
        });

        return DataCreated(
          res,
          messages,
        );
  
      });
    }

  grantAllToSchema = (req, res) => {
    const messages = [];
    const schemas = req.body.schemas;
    const user = req.body.user;
    
    if (schemas === null || user === null){
      return InternalServerErr(res, "Data not valid");
    }

    this.#pgsql.grantAllToSchema(schemas, user, (err, data) => {
      if (err) {
        messages.push('Internal error');
        messages.push(err.message);
        return InternalServerErr(res, messages);
      }

      messages.push(`Granted user ${user}`);
      const datas  = [];

      console.log("data,", data.command)
        
        datas[0] = { command: data.command}

        return DataCreated(
          res,
          messages,
        );
  
      });
  }

  grantAllTablesToSchema = (req, res) => {
    const messages = [];
    const schemas = req.body.schemas;
    const user = req.body.user;
    
    if (schemas === null || user === null){
      return InternalServerErr(res, "Data not valid");
    }

    this.#pgsql.grantAllTablesToSchema(schemas, user, (err, data) => {
      if (err) {
        messages.push('Internal error');
        messages.push(err.message);
        return InternalServerErr(res, messages);
      }

      messages.push(`Granted user ${user}`);
      const datas  = [];

      console.log("data,", data.command)
        
        datas[0] = { command: data.command}

        return DataCreated(
          res,
          messages,
        );
  
      });
  }

  grantAllToDatabase = (req, res) => {
    const messages = [];
    const databases = req.body.databases;
    const user = req.body.user;
    
    if (databases === null || user === null){
      return InternalServerErr(res, "Data not valid");
    }

    this.#pgsql.grantAllToDatabase(databases, user, (err, data) => {
      if (err) {
        messages.push('Internal error');
        messages.push(err.message);
        return InternalServerErr(res, messages);
      }

      messages.push(`Granted user ${user}`);
      const datas  = [];

      console.log("data,", data.command)
        
        datas[0] = { command: data.command}

        return DataCreated(
          res,
          messages,
        );
  
      });
  }

  createSchema = (req, res) => {
    const messages = [];
    const schemas = req.body.schemas;
    const user = req.body.user;
    
    if (schemas === null || user === null){
      return InternalServerErr(res, "Data not valid");
    }

    this.#pgsql.createSchema(schemas, user, (err, data) => {
      if (err) {
        messages.push('Internal error');
        messages.push(err.message);
        return InternalServerErr(res, messages);
      }

      messages.push(`Schema berhasil dibuat`);
      const datas  = [];

      console.log("data,", data.command)
        
        datas[0] = { command: data.command}

        return DataCreated(
          res,
          messages,
        );
  
      });
  }

  createDatabase = (req, res) => {
    const messages = [];
    const databases = req.body.databases;
    const user = req.body.user;
    
    if (databases === null || user === null){
      return InternalServerErr(res, "Data not valid");
    }

    this.#pgsql.createDatabase(databases, user, (err, data) => {
      if (err) {
        console.log(err.code)
        if (err.code === `42P04`) {
          messages.push(`Database ${databases} already exists`);
          return BadRequest(res, messages);
        }
        messages.push('Internal error');
        messages.push(err.message);
        return InternalServerErr(res, messages);
      }

      messages.push(`Database berhasil dibuat`);
      const datas  = [];

      console.log("data,", data.command)
        
        datas[0] = { command: data.command}

        return DataCreated(
          res,
          messages,
        );
  
      });
  }

  createUser = (req, res) => {
    const messages = [];
    const password = req.body.password;
    const user = req.body.user;
    
    if (password === null || user === null){
      return InternalServerErr(res, "Data not valid");
    }

    this.#pgsql.createUser(user, password, (err, data) => {
      if (err) {
        // console.log(err.code)
        if (err.code === `42710`) {
          messages.push(`User ${user} already exists`);
          return BadRequest(res, messages);
        }
        messages.push('Internal error');
        messages.push(err.message);
        return InternalServerErr(res, messages);
      }

      messages.push(`User berhasil dibuat`);
      const datas  = [];

      console.log("data,", data.command)
        
        datas[0] = { command: data.command}

        return DataCreated(
          res,
          messages,
        );
  
      });
  }
  

}
  module.exports = { PgsqlController }
