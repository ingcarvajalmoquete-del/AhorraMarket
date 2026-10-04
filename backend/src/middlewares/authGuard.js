const jwt = require("jsonwebtoken");
const env = require("../config/env");
const HttpError = require("../utils/httpError");
const { HTTP_STATUS } = require("../utils/httpStatus");

function getTokenFromHeader(req) {
  const header = req.headers.authorization || "";
  const [scheme, token] = header.split(" ");
  return scheme === "Bearer" ? token : null;
}

function requireAuth(req, res, next) {
  const token = getTokenFromHeader(req);

  if (!token) {
    return next(new HttpError(HTTP_STATUS.UNAUTHORIZED, "Debes iniciar sesion."));
  }

  try {
    req.user = jwt.verify(token, env.jwtSecret);
    return next();
  } catch (error) {
    return next(new HttpError(HTTP_STATUS.UNAUTHORIZED, "Sesion invalida o expirada."));
  }
}

function requireAdmin(req, res, next) {
  if (req.user?.role !== "admin") {
    return next(new HttpError(HTTP_STATUS.FORBIDDEN, "Requiere permisos de administrador."));
  }
  return next();
}

/** El cajero solo puede usar la caja (ventas) y consultar productos para vender. */
function blockCashier(req, res, next) {
  if (req.user?.role === "cashier") {
    return next(new HttpError(HTTP_STATUS.FORBIDDEN, "Tu rol de cajero solo tiene acceso a la caja."));
  }
  return next();
}

module.exports = { requireAuth, requireAdmin, blockCashier };
