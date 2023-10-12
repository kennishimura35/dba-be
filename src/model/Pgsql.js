const { Connection } = require("../helper/DBUtil");
const localStorage = require("localStorage");
const { Client } = require('pg');
const { BadRequest } = require("../helper/ResponseUtil");

class Pgsql {
  #connection = null;
  
  async getUsers(req, result) {
    try {
   
     const query = `select * from pg_catalog.pg_user catalog order by usename asc`
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
       
    } catch (error) {
        console.log(error)
    }
   };

   async getDatabases(result) {
    try {
    const query = `select t1.datname AS db_name,  
    pg_size_pretty(pg_database_size(t1.datname)) as db_size,
    pg_database_size(t1.datname)
    from pg_database t1
    order by 3 desc
    `
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
     
    } catch (error) {
      console.log(error)
    }
   
  };

  async getDatabaseSize(req, result) {
    try {
     
    const query = `select t1.datname AS db_name,  
    pg_size_pretty(pg_database_size(t1.datname)) as db_size,
    pg_database_size(t1.datname)
    from pg_database t1
    where t1.datname = '${req.app.locals.PG_DATABASE}'
    order by 3 desc`
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
     
    } catch (error) {
      console.log(error)
      
    }
   
  };

  async getTotalDatabaseSize(req, result) {
    try {
    const query = `SELECT pg_size_pretty(sum(pg_database_size(datname))::bigint) AS total_database_size
    FROM pg_database;`
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
    
      
    } catch (error) {
      console.log(error)
    }
   
  };

  async getSchemas(result) {
    try {
    const query = `SELECT schema_name FROM information_schema.schemata order by schema_name asc`
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
   
    } catch (error) {
      console.log(error)
    }
    
  };

  async getTables(schema, result) {
    try {
    const query = `SELECT * FROM information_schema.tables WHERE table_schema = '${schema}' order by table_name asc `
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
  } catch (error) {
    console.log(error)
  }
    
  };

  async getSuperuser(req, result) {
    try {
    const query = `SELECT usename AS role_name,
                    CASE 
                        WHEN usesuper AND usecreatedb THEN 
                        CAST('superuser, create database' AS pg_catalog.text)
                        WHEN usesuper THEN 
                          CAST('superuser' AS pg_catalog.text)
                        WHEN usecreatedb THEN 
                          CAST('create database' AS pg_catalog.text)
                        ELSE 
                          CAST('' AS pg_catalog.text)
                      END role_attributes
                    FROM pg_catalog.pg_user where usesuper and usename = '${req.app.locals.PG_USER}'
                    ORDER BY role_name desc;
                    `
    if (this.#connection !== null && this.#connection !== undefined){
      this.#connection.query(query, (err, res) => {

        if (err) {
          return result(err, null);
        }

        if(res.rows.length.toString() == '0'){
          return result('Not Superuser', null)
        }
  
        return result(null, res.rows);
      });
    } else{
      return result("err", null);
    }
    
      
    } catch (error) {
        console.log(error)
    }
    
  };
  async getPermissions(schema, result) {
    try {
    // const query = `SELECT * FROM information_schema.table_privileges 
    // where table_schema like '%${schema.table_schema}%' 
    // and grantee like '%${schema.grantee}%' and table_name like '%${schema.table_name}%'`

    const query = `SELECT 
    n.nspname AS schema_name,
    c.relname AS object_name,
    CASE 
        WHEN c.relkind = 'r' THEN 'table'
        WHEN c.relkind = 'v' THEN 'view'
        WHEN c.relkind = 'S' THEN 'sequence'
        WHEN c.relkind = 'm' THEN 'materialized view'
        ELSE 'other'
    END AS object_type,
    grantee AS user,
    string_agg(privilege_type, ', ' ORDER BY privilege_type) AS permissions
    FROM 
        pg_class c
    JOIN 
        pg_namespace n ON n.oid = c.relnamespace
    JOIN 
        (
            SELECT 
                table_name,
                grantee,
                privilege_type
            FROM 
                information_schema.table_privileges
            WHERE 
                grantee like '%${schema.grantee}%'
                and table_name like '%${schema.table_name}%'
        ) p ON p.table_name = c.relname 
    where n.nspname = '${schema.table_schema}'
    GROUP BY 
        n.nspname, c.relname, object_type, grantee
    ORDER BY 
        n.nspname, c.relname, grantee;`

    const query2 = `SELECT 
        n.nspname AS schema_name,
        c.relname AS object_name,
        CASE 
            WHEN c.relkind = 'r' THEN 'table'
            WHEN c.relkind = 'v' THEN 'view'
            WHEN c.relkind = 'S' THEN 'sequence'
            WHEN c.relkind = 'm' THEN 'materialized view'
            ELSE 'other'
        END AS object_type,
        grantee AS user,
        string_agg(privilege_type, ', ' ORDER BY privilege_type) AS permissions
        FROM 
            pg_class c
        JOIN 
            pg_namespace n ON n.oid = c.relnamespace
        JOIN 
            (
                SELECT 
                    table_name,
                    grantee,
                    privilege_type
                FROM 
                    information_schema.table_privileges
                WHERE 
                    grantee = '${schema.grantee}'
                    and table_name like '%${schema.table_name}%'
            ) p ON p.table_name = c.relname 
        where n.nspname = '${schema.table_schema}'
        GROUP BY 
            n.nspname, c.relname, object_type, grantee
        ORDER BY 
            n.nspname, c.relname, grantee;`

        const query3 = `SELECT 
            n.nspname AS schema_name,
            c.relname AS object_name,
            CASE 
                WHEN c.relkind = 'r' THEN 'table'
                WHEN c.relkind = 'v' THEN 'view'
                WHEN c.relkind = 'S' THEN 'sequence'
                WHEN c.relkind = 'm' THEN 'materialized view'
                ELSE 'other'
            END AS object_type,
            grantee AS user,
            string_agg(privilege_type, ', ' ORDER BY privilege_type) AS permissions
            FROM 
                pg_class c
            JOIN 
                pg_namespace n ON n.oid = c.relnamespace
            JOIN 
                (
                    SELECT 
                        table_name,
                        grantee,
                        privilege_type
                    FROM 
                        information_schema.table_privileges
                    WHERE 
                        grantee = '${schema.grantee}'
                        and table_name = '${schema.table_name}'
                ) p ON p.table_name = c.relname 
            where n.nspname = '${schema.table_schema}'
            GROUP BY 
                n.nspname, c.relname, object_type, grantee
            ORDER BY 
                n.nspname, c.relname, grantee;`
      
      
      const query4 = `SELECT 
                n.nspname AS schema_name,
                c.relname AS object_name,
                CASE 
                    WHEN c.relkind = 'r' THEN 'table'
                    WHEN c.relkind = 'v' THEN 'view'
                    WHEN c.relkind = 'S' THEN 'sequence'
                    WHEN c.relkind = 'm' THEN 'materialized view'
                    ELSE 'other'
                END AS object_type,
                grantee AS user,
                string_agg(privilege_type, ', ' ORDER BY privilege_type) AS permissions
                FROM 
                    pg_class c
                JOIN 
                    pg_namespace n ON n.oid = c.relnamespace
                JOIN 
                    (
                        SELECT 
                            table_name,
                            grantee,
                            privilege_type
                        FROM 
                            information_schema.table_privileges
                        WHERE 
                            grantee like '%${schema.grantee}%'
                            and table_name like '%${schema.table_name}%'
                    ) p ON p.table_name = c.relname 
                where n.nspname like '%${schema.table_schema}%'
                GROUP BY 
                    n.nspname, c.relname, object_type, grantee
                ORDER BY 
                    n.nspname, c.relname, grantee;`

       const query5 = `SELECT 
                n.nspname AS schema_name,
                c.relname AS object_name,
                CASE 
                    WHEN c.relkind = 'r' THEN 'table'
                    WHEN c.relkind = 'v' THEN 'view'
                    WHEN c.relkind = 'S' THEN 'sequence'
                    WHEN c.relkind = 'm' THEN 'materialized view'
                    ELSE 'other'
                END AS object_type,
                grantee AS user,
                string_agg(privilege_type, ', ' ORDER BY privilege_type) AS permissions
                FROM 
                    pg_class c
                JOIN 
                    pg_namespace n ON n.oid = c.relnamespace
                JOIN 
                    (
                        SELECT 
                            table_name,
                            grantee,
                            privilege_type
                        FROM 
                            information_schema.table_privileges
                        WHERE 
                            grantee like '%${schema.grantee}%'
                            and table_name = '${schema.table_name}'
                    ) p ON p.table_name = c.relname 
                where n.nspname = '${schema.table_schema}'
                GROUP BY 
                    n.nspname, c.relname, object_type, grantee
                ORDER BY 
                    n.nspname, c.relname, grantee;`

              const query6 = `SELECT 
                n.nspname AS schema_name,
                c.relname AS object_name,
                CASE 
                    WHEN c.relkind = 'r' THEN 'table'
                    WHEN c.relkind = 'v' THEN 'view'
                    WHEN c.relkind = 'S' THEN 'sequence'
                    WHEN c.relkind = 'm' THEN 'materialized view'
                    ELSE 'other'
                END AS object_type,
                grantee AS user,
                string_agg(privilege_type, ', ' ORDER BY privilege_type) AS permissions
                FROM 
                    pg_class c
                JOIN 
                    pg_namespace n ON n.oid = c.relnamespace
                JOIN 
                    (
                        SELECT 
                            table_name,
                            grantee,
                            privilege_type
                        FROM 
                            information_schema.table_privileges
                        WHERE 
                            grantee = '${schema.grantee}'
                            and table_name like '%${schema.table_name}%'
                    ) p ON p.table_name = c.relname 
                where n.nspname like '%${schema.table_schema}%'
                GROUP BY 
                    n.nspname, c.relname, object_type, grantee
                ORDER BY 
                    n.nspname, c.relname, grantee;`

    if (this.#connection !== null && this.#connection !== undefined){
      if(schema.table_schema !== '' && schema.grantee == '' && schema.table_name == ''){
        this.#connection.query(query, (err, res) => {

          if (err) {
            return result(err, null);
          }
    
          return result(null, res.rows);
        });
      } else if(schema.table_schema !== '' && schema.grantee !== '' && schema.table_name == ''){
        this.#connection.query(query2, (err, res) => {

          if (err) {
            return result(err, null);
          }
    
          return result(null, res.rows);
        });
      } else if(schema.table_schema !== '' && schema.grantee !== '' && schema.table_name !== ''){
        this.#connection.query(query3, (err, res) => {

          if (err) {
            return result(err, null);
          }
    
          return result(null, res.rows);
        });
      } else if(schema.table_schema !== '' && schema.grantee === '' && schema.table_name !== ''){
        this.#connection.query(query5, (err, res) => {

          if (err) {
            return result(err, null);
          }
    
          return result(null, res.rows);
        });
      } else if(schema.table_schema === '' && schema.grantee !== '' && schema.table_name === ''){
        this.#connection.query(query6, (err, res) => {

          if (err) {
            return result(err, null);
          }
    
          return result(null, res.rows);
        });
      }else {
        this.#connection.query(query4, (err, res) => {

          if (err) {
            return result(err, null);
          }
    
          return result(null, res.rows);
        });
      }
    } else{
      return result("err", null);
    }
    
      
    } catch (error) {
      console.log(error)
    }
  };

  async getTableSize(schema, table_name, result) {
    try {
    const query = `select table_schema, table_name, pg_relation_size('"'||table_schema||'"."'||table_name||'"'),
    pg_size_pretty(pg_relation_size('"'||table_schema||'"."'||table_name||'"'))
    from information_schema.tables where table_schema = '${schema}' and table_name like '%${table_name}%' 
    order by 3 desc`

    const query2 = `select table_schema, table_name, pg_relation_size('"'||table_schema||'"."'||table_name||'"'),
    pg_size_pretty(pg_relation_size('"'||table_schema||'"."'||table_name||'"'))
    from information_schema.tables where table_schema like '%${schema}%' and table_name like '%${table_name}%' 
    order by 3 desc`

    if (this.#connection !== null && this.#connection !== undefined){

      if(schema === ''){
        this.#connection.query(query2, (err, res) => {

          if (err) {
            return result(err, null);
          }
    
          return result(null, res.rows);
        });
      }
      
      else{
      this.#connection.query(query, (err, res) => {

        if (err) {
          return result(err, null);
        }
  
        return result(null, res.rows);
      });
      }
    } else{
      return result("err", null);
    }
  } catch (error) {
    console.log(error)
  }
  };

  async loginDatabase(req, result) {
    try {
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
    
      
    } catch (error) {
        console.log(error)
    }
  
  };

  async grantAllToAllSchemas(schemas, user, result) {
    try {
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
    
      
    } catch (error) {
      console.log(error)
    }
  };

  async grantAllTablesToAllSchemas(schemas, user, result) {
    try {
    let query = `
    `
    schemas?.map((item) => {
      if(item.schema_name !== 'pg_toast' && item.schema_name !== 'pg_temp_1' && 
      item.schema_name !== 'pg_toast_temp_1' && item.schema_name !== 'pg_catalog' && 
      item.schema_name !== 'information_schema'){
        // console.log(item.schema_name)
        query += `
        GRANT USAGE on schema ${item.schema_name} to ${user}; 
        GRANT ALL
        ON ALL TABLES IN SCHEMA ${item.schema_name} 
        TO ${user}; 
        GRANT ALL ON ALL SEQUENCES IN SCHEMA ${item.schema_name} TO ${user};
        GRANT ALL ON ALL FUNCTIONS IN SCHEMA ${item.schema_name} TO ${user};
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
    
      
    } catch (error) {
      console.log(error)
    }
  };

  async grantAllToSchema(schemas, user, result) {
    try {
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
      
    } catch (error) {
      console.log(error)
    }
  };

  async grantAllTablesToSchema(schemas, user, result) {
    try {
    let query = `
        GRANT USAGE on schema ${schemas} to  ${user}; 
        GRANT ALL ON ALL TABLES
        IN SCHEMA ${schemas} 
        TO ${user}; 
        GRANT ALL ON ALL SEQUENCES IN SCHEMA ${schemas} TO ${user};
        GRANT ALL ON ALL FUNCTIONS IN SCHEMA ${schemas} TO ${user};
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
    
      
    } catch (error) {
      console.log(error)
    }
  };

  async grantAllToDatabase(databases, user, result) {
    try {
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
    
      
    } catch (error) {
      console.log(error)
    }
  };

  async createSchema(schemas, user, result) {
    try {
    const query = `CREATE SCHEMA ${schemas} AUTHORIZATION ${user}`
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
    
      
    } catch (error) {
      console.log(error)
    }
  };

  async createDatabase(databases, user, result) {
    try {
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
    
      
    } catch (error) {
      console.log(error)
    }
  };

  async createUser(user, password, result) {
    try {
    const query = `create user ${user} with encrypted password '${password}';`;
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
    
      
    } catch (error) {
      console.log(error)
    }
  };
}



module.exports = { Pgsql };
