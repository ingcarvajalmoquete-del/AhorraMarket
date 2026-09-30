const fs = require("fs");

function toNamedParams(source) {
  const prefixed = {};
  Object.keys(source).forEach((key) => {
    prefixed[`@${key}`] = source[key];
  });
  return prefixed;
}

function normalizeParams(params) {
  const isSingleObject = params.length === 1
    && params[0] !== null
    && typeof params[0] === "object"
    && !Array.isArray(params[0]);

  return isSingleObject ? toNamedParams(params[0]) : params;
}

function readRow(statement) {
  const hasRow = statement.step();
  const row = hasRow ? statement.getAsObject() : undefined;
  statement.free();
  return row;
}

function readAllRows(statement) {
  const rows = [];
  while (statement.step()) rows.push(statement.getAsObject());
  statement.free();
  return rows;
}

function getLastInsertRowid(rawDb) {
  const result = rawDb.exec("SELECT last_insert_rowid() AS id");
  return result.length ? result[0].values[0][0] : undefined;
}

function wrapDatabase(rawDb, dbPath) {
  const persist = () => {
    const data = rawDb.export();
    fs.writeFileSync(dbPath, Buffer.from(data));
  };

  return {
    exec(sql) {
      rawDb.exec(sql);
      persist();
    },
    prepare(sql) {
      return {
        get: (...params) => {
          const statement = rawDb.prepare(sql);
          statement.bind(normalizeParams(params));
          return readRow(statement);
        },
        all: (...params) => {
          const statement = rawDb.prepare(sql);
          statement.bind(normalizeParams(params));
          return readAllRows(statement);
        },
        run: (...params) => {
          const statement = rawDb.prepare(sql);
          statement.bind(normalizeParams(params));
          statement.step();
          statement.free();
          const lastInsertRowid = getLastInsertRowid(rawDb);
          persist();
          return { lastInsertRowid };
        }
      };
    },
    pragma(expression) {
      try {
        rawDb.run(`PRAGMA ${expression}`);
      } catch (error) {
        /* Algunos pragmas (p. ej. journal_mode) no aplican en memoria; se ignoran. */
      }
    },
    transaction(fn) {
      return (...args) => fn(...args);
    }
  };
}

module.exports = { wrapDatabase };
