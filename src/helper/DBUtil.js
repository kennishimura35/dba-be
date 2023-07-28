const db = require('mysql-promise')()
const mysql = require('mysql');
const { Client } = require('pg');
const localStorage = require("localStorage");
require('dotenv').config();


class Connection {
  static #instance = null;

  static async getConnection(req) {
    console.log("asdasdadas")
    if (!Connection.#instance) {
      try {

        console.log("ascd", req)
        Connection.#instance = new Client({
          user: localStorage.getItem('PG_USER'),
          host: localStorage.getItem("PG_HOST"),
          database: localStorage.getItem("PG_DATABASE"),
          password: localStorage.getItem("PG_PASS"),
          port: localStorage.getItem("PG_PORT")
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