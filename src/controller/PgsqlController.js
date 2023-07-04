const { Pgsql } = require("../model/Pgsql");
const moment = require('moment');
const uuid = require("uuid").v4;
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

    this.#pgsql.getUsers((err, data) => {
      if (err) {
        messages.push('Internal error // Find by id error');
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
        messages.push('Internal error // Find by id error');
        messages.push(err.message);
        return InternalServerErr(res, messages);
      }

      messages.push(`Databases berhasil ditemukan`);
      const databases  = [];

      data.forEach(database => {
        databases.push({
          datname : database.datname
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
        messages.push('Internal error // Find by id error');
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

  

}
  module.exports = { PgsqlController }
