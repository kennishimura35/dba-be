const { Connection, db } = require("../../src/helper/DBUtil");

/* get one user */
const getUserByUsername = async (username) => {
    let query = `SELECT id_user, password, expired, username, email `
    + `FROM user `
    + `WHERE LOWER(username) = LOWER(?) `
    let user = await db.query(query, [username])
    return user[0][0]
}

const findPermissionById = async(group_id) => {

  const query = "select a.permission_api_id, a.function_id,\
      (select function_name from tb_function where a.function_id = function_id) as function_name, a.action,\
      a.http_method, a.api_url_name,\
      case status\
      when a.permission_api_id =\
      (select permission_api_id \
      from tb_permission_api_group \
      where group_id = ? && permission_api_id = a.permission_api_id) \
      then a.status=true\
      \
      when a.permission_api_id != (select permission_api_id \
      from tb_permission_api_group \
      where group_id = ? && permission_api_id = a.permission_api_id) \
      then a.status='Y'\
      else a.status='N'\
      \
      end as status,\
      \
      case action\
      when a.permission_api_id != (select permission_api_id \
      from tb_permission_api_group \
      where group_id = ? && permission_api_id = a.permission_api_id)\
      \
      then (select id_api_group\
      from tb_permission_api_group \
      where group_id = ? && permission_api_id = a.permission_api_id)\
      else a.action='N'\
      \
      end as id_api_group\
      \
      FROM tb_permission_api a\
      order by function_id\
      \
      ;"
      let role = await db.query(query, [group_id, group_id, group_id, group_id])
      return role
}



class User {
  #connection = null;
  constructor() {
    this.#setConnetion();
  }

  async #setConnetion() {
    // this.#connection = await Connection.getConnection();
  }

  /**
   * Create One
   */
  async createOne(user, result) {
    const query = 'INSERT INTO user \
                    (id_user, username, password, no_telp, expired, created_at, email) \
                    VALUES (?,?,?,?,?,?,?)'
    this.#connection.query(query,
                [user.id_user, user.username, user.password, user.no_telp, user.expired, user.created_at, user.email],
                (err, res) => {
      if (err) {
        if (err.code === 'ER_DUP_ENTRY' && err.sqlMessage.includes("for key 'user")) {
          return result({kind: 'DUPLICAT_USERNAME_VALUE'}, null);
        }

        if (err.code === 'ER_DUP_ENTRY' && err.sqlMessage.includes("for key 'email_UNIQUE'")) {
          return result({kind: 'DUPLICAT_EMAIL_VALUE'}, null);
        }

        if (err.code === 'ER_NO_REFERENCED_ROW_2') {
          return result({kind: 'UNKNOWN_GROUP_ID'}, null);
        }

        return result(err, null);
      }
      return result(null, {id: res.insertId, ...user});
    });
  };

  /**
   * Find by Name and Status
   */
    async findByNameAndStatusContains(name, status, result) {
      name = `%${name}%`;
      status = `%${status}%`;
      this.#connection.query("SELECT * FROM tb_user WHERE name LIKE ? AND status LIKE ? ORDER BY created_dt ASC", 
      [name, status], (err, res) => {
        if (err) {
          return result(err, null);
        }
  
        // Jika data tidak ada
        if (!res.length) {
          return result({kind: 'NOT_FOUND'}, null);
        }
  
        return result(null, res);
      });
    };

  /**
   * Find by ID
   */
  findById(userId, result) {
    this.#connection.query('SELECT * FROM tb_user WHERE user_id=?', userId, (err, res) => {
      if (err) {
        return result(err, null);
      }

      // Jika data tidak ada
      if (!res.length) {
        return result({kind: 'NOT_FOUND'}, null);
      }

      return result(null, res[0]);
    });
  };

  /**
   * Remove One
   */
  deleteById(userId, result) {
    this.#connection.query("DELETE FROM tb_user WHERE user_id=?", userId, (err, res) => {
      if (err) {
        return result(err, null);
      }

      // Jika datanya engga ada berdasarkan id, maka tidak ada yang dihapus
      if (!res.affectedRows) {
        return result({kind: 'NOT_FOUND'}, null);
      }

      return result(null, res);
    });
  };

  /**
   * Update by ID
   * Note: update dilakukan tanpa mengubah created date
   */
  updateById(user, result) {
    const query = 'UPDATE tb_user \
                    SET group_id=?, username=?, email=?, name=?, departemen=?, status=?, updated_dt=?, updated_by=? \
                    WHERE user_id=?';
    this.#connection.query(query, 
              [user.groupId, user.username, user.email, user.name, user.departemen, user.status, user.updatedDt, user.updatedBy, user.userId],
              (err, res) => {
      if (err) {
        // console.log(err);
        if (err.code === 'ER_DUP_ENTRY' && err.sqlMessage.includes("for key 'username'")) {
          return result({kind: 'DUPLICAT_USERNAME_VALUE'}, null);
        }

        if (err.code === 'ER_DUP_ENTRY' && err.sqlMessage.includes("for key 'email_UNIQUE'")) {
          return result({kind: 'DUPLICAT_EMAIL_VALUE'}, null);
        }

        if (err.code === 'ER_NO_REFERENCED_ROW_2') {
          return result({kind: 'UNKNOWN_GROUP_ID'}, null);
        }

        return result(err, null);
      }
      
      // Jika datanya engga ada berdasarkan id, maka tidak ada yang di update
      if (!res.affectedRows) {
        return result({kind: 'NOT_FOUND'}, null);
      }

      return result(null, user);
    });
  };

  /**
   * Create Many
   * Note: parameter users harus dalam bentuk array
   */
  createMany = (users, result) => {
    // console.log(users)
    const query = 'INSERT INTO tb_user \
                    (user_id, group_id, username, password, email, name, departemen, status, created_dt, created_by, updated_dt, updated_by) \
                    VALUES ?';
    this.#connection.query(query, [users], (err, res) => {
      if (err) {
        // console.log(err)
        if (err.code === 'ER_DUP_ENTRY' && err.sqlMessage.includes("for key 'username'")) {
          return result({kind: 'DUPLICAT_USERNAME_VALUE'}, null);
        }

        if (err.code === 'ER_DUP_ENTRY' && err.sqlMessage.includes("for key 'email_UNIQUE'")) {
          return result({kind: 'DUPLICAT_EMAIL_VALUE'}, null);
        }

        if (err.code === 'ER_NO_REFERENCED_ROW_2') {
          return result({kind: 'UNKNOWN_GROUP_ID'}, null);
        }

        return result(err, null);
      }
  
      return result(null, res);
    });
  }

  /**
   * Remove Many
   */
  deleteManyByIds(userIds, result) {
    this.#connection.beginTransaction();
    this.#connection.query("DELETE FROM tb_user WHERE user_id IN (?)", [userIds], (err, res) => {
      if (err) {
        this.#connection.rollback();
        return result(err, null);
      }

      // Jika datanya engga ada berdasarkan id, maka tidak ada yang dihapus
      if (res.affectedRows != userIds.length) {
        this.#connection.rollback();
        return result({kind: 'NOT_FOUND'}, null);
      }
      
      this.#connection.commit();
      return result(null, res);
    });
  };


  /**
   * Find by Name and Status
  */
  findByNameAndStatusContainsPagination = (filter, pagination, result) => {
    filter.name = `%${filter.name}%`;
    filter.status = `%${filter.status}%`;

    const offset = pagination.perPage * (pagination.page - 1);

    // Query untuk ORDER BY harus concat string atau subtitusi string dari javascript
    // karena apabila menggunakan subtitusi dari mysql ('?'), maka akan dianggap value ...
    // dan query ORDER BY tidak akan berfungsi
    const query = `SELECT * FROM tb_user \
                    WHERE name LIKE ? AND status LIKE ? \
                    ORDER BY ${pagination.orderBy} ${pagination.orderValue} \
                    LIMIT ? OFFSET ?`;
    this.#connection.query(query, [filter.name, filter.status, pagination.perPage, offset], (err, res) => {
      if (err) {
        return result(err, null);
      }

      // Jika data tidak ada
      if (!res.length) {
        return result({kind: 'NOT_FOUND'}, null);
      }

      this.#connection.query('SELECT user_id FROM tb_user WHERE name LIKE ? AND status LIKE ?', [filter.name, filter.status], (e, r) => {
        const totalRows = r.length;
        const totalPages = Math.ceil(totalRows / pagination.perPage);

        const data = {
          page: pagination.page,
          perPage: pagination.perPage,
          totalRows,
          totalPages,
          data: res
        } 

        return result(e, data);
      });

      
    });
  };


  /**
   * Find All (groupId, name)
   */
    async getComboUser(result) {
      this.#connection.query("SELECT username as label, user_id as value FROM tb_user", (err, res) => {
        if (err) {
          return result(err, null);
        }
  
        // Jika data tidak ada
        if (!res.length) {
          return result({kind: 'NOT_FOUND'}, null);
        }
  
        // console.log(res);
        return result(null, res);
      });
    };


  /**
   * Find All (groupId, name)
   */
    async findUserByUsername(username, result) {
      this.#connection.query("SELECT * FROM tb_user WHERE username=?", username, (err, res) => {
        if (err) {
          return result(err, null);
        }
  
        // Jika data tidak ada
        if (!res.length) {
          return result({kind: 'NOT_FOUND'}, null);
        }
  
        // console.log(res);
        return result(null, res);
      });
    };
  
}



module.exports = { getUserByUsername, findPermissionById, User }