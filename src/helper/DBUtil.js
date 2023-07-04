const db = require('mysql-promise')()
const mysql = require('mysql');
const { Client } = require('pg');
require('dotenv').config();

const opt = {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASS
}

db.configure(opt)

class Connection {
  static #instance = null;

  static async getConnection() {
    if (!Connection.#instance) {
      try {

        Connection.#instance = new Client({
          user: process.env.PG_USER,
          host: process.env.PG_HOST,
          database: process.env.PG_DATABASE,
          password: process.env.PG_PASS,
          port: process.env.PG_PORT
        });

      await Connection.#instance.connect()
      return Connection.#instance;

      } catch (err) {
        console.log(err)
      }
      
    } else {
      return Connection.#instance;
    }

  }
}

module.exports = { db, Connection }