const { Connection } = require("../helper/DBUtil");
class Pgsql {
  #connection = null;
  constructor() {
    this.#setConnetion();
  }

  async #setConnetion() {
    this.#connection = await Connection.getConnection();
    // console.log("this",await Connection.getConnection())
  }

  async getUsers(result) {
     const query = `select * from pg_catalog.pg_user catalog`
     this.#connection.query(query,(err, res) => {
 
       if (err) {
         return result(err, null);
       }

       return result(null, res.rows);
     });
   };

   async getDatabases(result) {
    const query = `select * from pg_catalog.pg_database`
    this.#connection.query(query,(err, res) => {

      if (err) {
        return result(err, null);
      }

      return result(null, res.rows);
    });
  };

  async getSchemas(result) {
    const query = `SELECT schema_name FROM information_schema.schemata`
    this.#connection.query(query,(err, res) => {

      if (err) {
        return result(err, null);
      }

      return result(null, res.rows);
    });
  };

}

module.exports = { Pgsql };
