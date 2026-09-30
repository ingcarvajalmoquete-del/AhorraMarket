require("dotenv").config();

const DEFAULT_PORT = 3000;
const DEFAULT_TAX_RATE = 0.18;
const DEFAULT_CORS_ORIGINS = [
  "http://127.0.0.1:5500",
  "http://localhost:5500",
  "http://127.0.0.1:5501",
  "http://localhost:5501"
];

function parseCorsOrigins(value) {
  if (!value) return DEFAULT_CORS_ORIGINS;
  return value.split(",").map((origin) => origin.trim()).filter(Boolean);
}

const env = {
  port: Number(process.env.PORT) || DEFAULT_PORT,
  corsOrigins: parseCorsOrigins(process.env.CORS_ORIGIN),
  dbPath: process.env.DB_PATH || "./data/ecogestion.db",
  jwtSecret: process.env.JWT_SECRET || "dev-secret-do-not-use-in-production",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "8h",
  taxRate: Number(process.env.TAX_RATE) || DEFAULT_TAX_RATE
};

module.exports = env;

