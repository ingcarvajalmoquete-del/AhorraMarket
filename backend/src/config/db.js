const fs = require("fs");
const path = require("path");
const initSqlJs = require("sql.js");
const bcrypt = require("bcryptjs");
const env = require("./env");
const { wrapDatabase } = require("./sqlJsAdapter");

const SALT_ROUNDS = 10;

function ensureDataFolder() {
  const folder = path.dirname(env.dbPath);
  if (!fs.existsSync(folder)) {
    fs.mkdirSync(folder, { recursive: true });
  }
}

function createSchema(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('admin','employee')),
      active INTEGER NOT NULL DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      price REAL NOT NULL,
      stock INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS clients (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      phone TEXT,
      email TEXT
    );

    CREATE TABLE IF NOT EXISTS employees (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      position TEXT,
      phone TEXT,
      active INTEGER NOT NULL DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS sales (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER REFERENCES users(id),
      subtotal REAL NOT NULL,
      tax REAL NOT NULL,
      total REAL NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS sale_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sale_id INTEGER NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
      product_id INTEGER NOT NULL REFERENCES products(id),
      product_name TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      unit_price REAL NOT NULL,
      line_total REAL NOT NULL
    );

    CREATE TABLE IF NOT EXISTS expenses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      description TEXT NOT NULL,
      category TEXT NOT NULL,
      amount REAL NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);
}

function seedUsers(db) {
  const count = db.prepare("SELECT COUNT(*) AS total FROM users").get().total;
  if (count > 0) return;

  const insert = db.prepare(`
    INSERT INTO users (username, name, password_hash, role, active)
    VALUES (@username, @name, @passwordHash, @role, 1)
  `);

  insert.run({
    username: "admin",
    name: "Administrador",
    passwordHash: bcrypt.hashSync("admin123", SALT_ROUNDS),
    role: "admin"
  });

  insert.run({
    username: "empleado",
    name: "Empleado General",
    passwordHash: bcrypt.hashSync("empleado123", SALT_ROUNDS),
    role: "employee"
  });
}

function seedProducts(db) {
  const count = db.prepare("SELECT COUNT(*) AS total FROM products").get().total;
  if (count > 0) return;

  const defaultProducts = [
    { name: "Arroz Premium 5 lb", category: "Alimentos", price: 280, stock: 25 },
    { name: "Aceite Vegetal 1L", category: "Alimentos", price: 145, stock: 18 },
    { name: "Leche Entera 1L", category: "Lacteos", price: 95, stock: 8 },
    { name: "Pan de Agua", category: "Panaderia", price: 15, stock: 50 },
    { name: "Azucar 2 lb", category: "Alimentos", price: 75, stock: 12 },
    { name: "Jabon de Bano", category: "Higiene", price: 65, stock: 5 },
    { name: "Pasta Espagueti", category: "Alimentos", price: 55, stock: 30 },
    { name: "Agua 1.5L", category: "Bebidas", price: 40, stock: 40 }
  ];

  const insert = db.prepare(`
    INSERT INTO products (name, category, price, stock)
    VALUES (@name, @category, @price, @stock)
  `);

  defaultProducts.forEach((product) => insert.run(product));
}

let wrappedDb = null;

async function initDb() {
  if (wrappedDb) return wrappedDb;

  ensureDataFolder();

  const SQL = await initSqlJs({
    locateFile: (file) => path.join(__dirname, "..", "..", "node_modules", "sql.js", "dist", file)
  });

  const existingFile = fs.existsSync(env.dbPath) ? fs.readFileSync(env.dbPath) : null;
  const rawDb = existingFile ? new SQL.Database(existingFile) : new SQL.Database();

  wrappedDb = wrapDatabase(rawDb, env.dbPath);
  wrappedDb.pragma("foreign_keys = ON");

  createSchema(wrappedDb);
  seedUsers(wrappedDb);
  seedProducts(wrappedDb);

  return wrappedDb;
}

function getDb() {
  if (!wrappedDb) {
    throw new Error("La base de datos no ha sido inicializada. Llama a initDb() antes de usar el servidor.");
  }

  return wrappedDb;
}

module.exports = { initDb, getDb };
