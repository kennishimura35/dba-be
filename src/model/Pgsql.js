const { Connection } = require("../helper/DBUtil");
const localStorage = require("localStorage");
const { Client } = require('pg');

class Pgsql {
  #connection = null;
  
  async getUsers(req, result) {
     const query = `select * from pg_catalog.pg_user catalog`
     if (this.#connection !== null && this.#connection !== undefined){
      // console.log(this.#connection)
      this.#connection.query(query,(err, res) => {
       if (err) {
         return result(err, null);
       }

        // this.#connection.end()
       return result(null, res.rows);
     })
    } else{
      return result("err", null);
    }
   };

   async getDatabases(result) {
    const query = `select * from pg_catalog.pg_database`
    if (this.#connection !== null && this.#connection !== undefined){
      this.#connection.query(query,(err, res) => {

        if (err) {
          return result(err, null);
        }
  
        return result(null, res.rows);
      });
    } else{
      return result("err", null);
    }
   
  };

  async getSchemas(result) {
    const query = `SELECT schema_name FROM information_schema.schemata`
    if (this.#connection !== null && this.#connection !== undefined){
      this.#connection.query(query,(err, res) => {

        if (err) {
          return result(err, null);
        }
  
        return result(null, res.rows);
      });
    } else{
      return result("err", null);
    }
    
  };

  async getTables(schema, result) {
    const query = `SELECT * FROM information_schema.tables WHERE table_schema = '${schema}' `
    if (this.#connection !== null && this.#connection !== undefined){
      this.#connection.query(query, (err, res) => {

        if (err) {
          return result(err, null);
        }
  
        return result(null, res.rows);
      });
    } else{
      return result("err", null);
    }
    
  };
  async getPermissions(schema, result) {
    const query = `SELECT * FROM information_schema.table_privileges 
    where table_schema like '%${schema.table_schema}%' 
    and grantee like '%${schema.grantee}%' and table_name like '%${schema.table_name}%'`

    if (this.#connection !== null && this.#connection !== undefined){
      this.#connection.query(query, (err, res) => {

        if (err) {
          return result(err, null);
        }
  
        return result(null, res.rows);
      });
    } else{
      return result("err", null);
    }
    
  };

  async getTableSize(schema, result) {
    const query = `select table_schema, table_name, pg_relation_size('"'||table_schema||'"."'||table_name||'"')
    from information_schema.tables where table_schema = '${schema}'
    order by 3`

    if (this.#connection !== null && this.#connection !== undefined){
      this.#connection.query(query, (err, res) => {

        if (err) {
          return result(err, null);
        }
  
        return result(null, res.rows);
      });
    } else{
      return result("err", null);
    }
    
  };

  async loginDatabase(req, result) {
    let errs = null
    this.#connection = new Client({
      user: req.app.locals.PG_USER,
      host:  req.app.locals.PG_HOST,
      database: req.app.locals.PG_DATABASE,
      password: req.app.locals.PG_PASS,
      port: req.app.locals.PG_PORT
    });
    this.#connection.connect((err, res) => {

      if (err) {
        this.#connection.end()
        return result(err, null);
      }
      // this.#connection.end()
      return result(null, [1]);
      
    })
  
  };

  async grantAllToAllSchemas(schemas, user, result) {
    // console.log(schemas)
    // console.log(user)
    let query = ``
    schemas?.map((item) => {
      if(item.schema_name !== 'pg_toast' && item.schema_name !== 'pg_temp_1' && 
      item.schema_name !== 'pg_toast_temp_1' && item.schema_name !== 'pg_catalog' && 
      item.schema_name !== 'information_schema'){
        // console.log(item.schema_name)
        query += `
        GRANT USAGE on schema ${item.schema_name} to  ${user}; 
        GRANT ALL
        ON SCHEMA ${item.schema_name} 
        TO ${user}; 
        `
      }
      
    })

    // console.log(query)
  
    if (this.#connection !== null && this.#connection !== undefined){

      
      this.#connection.query(query,(err, res) => {

        if (err) {
          return result(err, null);
        }
        return result(null, res);
      });

    } else{
      return result("err", null);
    }
  };

  async grantAllTablesToAllSchemas(schemas, user, result) {
    // console.log(schemas)
    // console.log(user)
    let query = `
    `
    schemas?.map((item) => {
      if(item.schema_name !== 'pg_toast' && item.schema_name !== 'pg_temp_1' && 
      item.schema_name !== 'pg_toast_temp_1' && item.schema_name !== 'pg_catalog' && 
      item.schema_name !== 'information_schema'){
        // console.log(item.schema_name)
        query += `
        GRANT USAGE on schema ${item.schema_name} to  ${user}; 
        GRANT ALL
        ON ALL TABLES IN SCHEMA ${item.schema_name} 
        TO ${user}; 
        `
      }
      
    })

    // console.log(query)
  
    if (this.#connection !== null && this.#connection !== undefined){

      
      this.#connection.query(query,(err, res) => {

        if (err) {
          return result(err, null);
        }
        return result(null, res);
      });

    } else{
      return result("err", null);
    }
  };

  async grantAllToSchema(schemas, user, result) {
    // console.log(schemas)
    // console.log(user)
    let query = `
        GRANT USAGE on schema ${schemas} to ${user}; 
        GRANT ALL
        ON SCHEMA ${schemas} 
        TO ${user}; 
        `
    // console.log(query)
  
    if (this.#connection !== null && this.#connection !== undefined){
      this.#connection.query(query,(err, res) => {

        if (err) {
          return result(err, null);
        }
        return result(null, res);
      });

    } else{
      return result("err", null);
    }
  };

  async grantAllTablesToSchema(schemas, user, result) {
    // console.log(schemas)
    // console.log(user)
    let query = `
        GRANT USAGE on schema ${schemas} to  ${user}; 
        GRANT ALL ON ALL TABLES
        IN SCHEMA ${schemas} 
        TO ${user}; 
        `
    // console.log(query)
  
    if (this.#connection !== null && this.#connection !== undefined){
      this.#connection.query(query,(err, res) => {

        if (err) {
          return result(err, null);
        }
        return result(null, res);
      });

    } else{
      return result("err", null);
    }
  };

  async grantAllToDatabase(databases, user, result) {
    console.log(databases)
    console.log(user)
    let query = `
        GRANT ALL
        ON database ${databases} 
        TO ${user}; 
        `
    // console.log(query)
  
    if (this.#connection !== null && this.#connection !== undefined){
      this.#connection.query(query,(err, res) => {

        if (err) {
          return result(err, null);
        }
        return result(null, res);
      });

    } else{
      return result("err", null);
    }
  };

  async createSchema(schemas, user, result) {
    console.log(schemas)
    console.log(user)
    const query = `CREATE SCHEMA IF NOT EXISTS ${schemas} AUTHORIZATION ${user}`
    // console.log(query)
  
    if (this.#connection !== null && this.#connection !== undefined){
      this.#connection.query(query, (err, res) => {

        if (err) {
          return result(err, null);
        }
        return result(null, res);
      });

    } else{
      return result("err", null);
    }
  };

  async createDatabase(databases, user, result) {
    console.log(databases)
    console.log(user)
    const query = `CREATE DATABASE ${databases} WITH OWNER ${user}`
    // console.log(query)
  
    if (this.#connection !== null && this.#connection !== undefined){
      this.#connection.query(query, (err, res) => {

        if (err) {
          return result(err, null);
        }
        return result(null, res);
      });

    } else{
      return result("err", null);
    }
  };

  async createUser(user, password, result) {
    console.log(user)
    console.log(password)
    const query = `create user ${user} with encrypted password '${password}';`;
    console.log(query)
  
    if (this.#connection !== null && this.#connection !== undefined){
      this.#connection.query(query, (err, res) => {

        if (err) {
          return result(err, null);
        }
        return result(null, res);
      });

    } else{
      return result("err", null);
    }
  };


}



module.exports = { Pgsql };
