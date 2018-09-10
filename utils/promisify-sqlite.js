/**
 * It wraps some methods, in order
 * to make them Promisable
 * @param {Database} db an instance of sqlite3 connection
 * @returns {Database}
 */
module.exports = function (db) {
  db.runAsync = function (sql) {
    return new Promise((resolve, reject) => {
      db.run(sql, function (err) {
        if (err) reject(err);
        resolve(this);
      });
    });
  };

  db.allAsync = function (sql, params = []) {
    return new Promise((resolve, reject) => {
      db.all(sql, params, function (err, rows) {
        if (err) reject(err);
        resolve(rows);
      });
    });
  };

  db.getAsync = function (sql, params = []) {
    return new Promise((resolve, reject) => {
      db.get(sql, params, function (err, row) {
        if (err) reject(err);
        resolve(row);
      });
    });
  };

  return db;
}
