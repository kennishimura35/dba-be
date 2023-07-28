const { Connection } = require("../helper/DBUtil");

class System {
  #connection = null;
  constructor() {
    this.#setConnetion();
  }

  async #setConnetion() {
    // this.#connection = await Connection.getConnection();
  }

  async getSystemMasterValue(param, result) {
    const queryParams = [];
    let query =
      "SELECT sys_cat, sys_sub_cat, sys_code, value, remark, status " +
      "FROM tb_system " +
      "WHERE 1=1 ";

    // dynamic filter
    if (param.sys_cat && param.sys_cat !== "") {
      queryParams.push(param.sys_cat);
      query += `AND LOWER(sys_cat) LIKE LOWER(?)`;
    }

    if (param.sys_sub_cat && param.sys_sub_cat !== "") {
      queryParams.push(param.sys_sub_cat);
      query += `AND LOWER(sys_sub_cat) LIKE LOWER(?)`;
    }

    if (param.sys_code && param.sys_code !== "") {
      queryParams.push(param.sys_code);
      query += `AND sys_code LIKE ?`;
    }

    this.#connection.query(query, queryParams, (err, res) => {
      if (err) {
        return result(err, null);
      }
      return result(null, res);
    });
  }

  /* search sistem */
  async searchSystem(param, result) {
    const queryParams = [];
    // query
    let query =
      "SELECT sys_cat, sys_sub_cat, sys_code, value, remark, status FROM `tb_system` WHERE 1=1 ";

    // dynamic filter
    if (param.sys_cat && param.sys_cat !== "") {
      queryParams.push(param.sys_cat);
      query += `AND LOWER(sys_cat) LIKE LOWER(?)`;
    }

    if (param.sys_sub_cat && param.sys_sub_cat !== "") {
      queryParams.push(param.sys_sub_cat);
      query += `AND LOWER(sys_sub_cat) LIKE LOWER(?)`;
    }

    if (param.sys_code && param.sys_code !== "") {
      queryParams.push(param.sys_code);
      query += `AND sys_code LIKE ?`;
    }

    // dynamic order
    if (param.orderBy && param.orderBy !== "" && param.orderBy !== undefined) {
      let dir = "asc";
      if (param.dir && (param.dir === "asc" || param.dir === "desc")) {
        dir = param.dir;
      }

      query += ` ORDER BY \`${param.orderBy}\` ${dir} `;
    } else {
      query += " ORDER BY sys_cat ASC ";
    }

    await this.#connection.query(query, queryParams, (err, res) => {
      if (err) {
        return result(err, null);
      }

      // Jika data tidak ada
      if (!res.length) {
        return result({ kind: "NOT_FOUND" }, null);
      }

      const totalRows = res.length;

      // limit and paging and such
      if (!param.perPage || param.perPage === "") {
        param.perPage = parseInt(process.env.ROW_PAGE);
      }

      const limit = param.perPage;

      let offset = 0;
      if (param.page && param.page !== "") {
        offset = limit * (param.page - 1);
      }

      query += ` LIMIT ${limit} OFFSET ${offset} `;

      this.#connection.query(query, queryParams, (e, data) => {
        const totalPages = Math.ceil(totalRows / param.perPage);
        return result(e, {
          page: param.page,
          perPage: param.perPage,
          totalRows,
          totalPages,
          data,
        });
      });
    });
  }

  /* insert */
  async insertManySystem(param, result) {
    const query =
      " INSERT INTO tb_system " +
      " (sys_cat, sys_sub_cat, sys_code, value, remark, status, created_dt, created_by, updated_dt, updated_by) " +
      " VALUES " +
      " ? ";

    this.#connection.query(query, [param], (err, res) => {
      if (err) {
        return result(err, null);
      }
      return result(null, res);
    });
  }

  async insertSystem(param, createdBy, result) {
    const query =
      "INSERT INTO tb_system " +
      "(sys_cat, sys_sub_cat, sys_code, value, remark, status, created_dt, created_by, updated_dt, updated_by) " +
      "VALUES " +
      "(?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ";

    const dt = new Date();
    this.#connection.query(
      query,
      [
        param.sys_cat,
        param.sys_sub_cat,
        param.sys_code,
        param.value,
        param.remark,
        param.status,
        dt,
        createdBy,
        dt,
        createdBy,
      ],
      (err, res) => {
        if (err) {
          return result(err, null);
        }
        return result(null, { id: res.insertId, ...param });
      }
    );
  }

  async updateSystem(param, updatedBy, result) {
    const query =
      " UPDATE tb_system SET " +
      " value = ?, " +
      " remark = ?, " +
      " status = ?, " +
      " updated_dt = ?, " +
      " updated_by = ? " +
      " WHERE " +
      " sys_cat = ? and " +
      " sys_sub_cat = ? and " +
      " sys_code = ? ";

    const dt = new Date();
    this.#connection.query(
      query,
      [
        param.value,
        param.remark,
        param.status,
        dt,
        updatedBy,
        param.sys_cat,
        param.sys_sub_cat,
        param.sys_code,
      ],
      (err, res) => {
        if (err) {
          return result(err, null);
        }
        return result(null, { id: res.insertId, ...param });
      }
    );
  }

  /* delete */
  async deleteSystem(params, result) {
    this.#connection.beginTransaction();
    const query =
      " DELETE FROM tb_system " +
      " WHERE " +
      " (sys_cat, sys_sub_cat, sys_code) IN (?)  ";
    this.#connection.query(query, [params], (err, res) => {
      if (err) {
        this.#connection.rollback();
        return result(err, null);
      }
      // Jika datanya engga ada berdasarkan id, maka tidak ada yang dihapus
      if (res.affectedRows != params.length) {
        this.#connection.rollback();
        return result({ kind: "NOT_FOUND" }, null);
      }
      this.#connection.commit();
      return result(null, res);
    });
  }
}

module.exports = { System };
