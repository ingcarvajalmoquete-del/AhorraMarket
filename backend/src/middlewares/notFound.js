const HttpError = require("../utils/httpError");
const { HTTP_STATUS } = require("../utils/httpStatus");

function notFound(req, res, next) {
  next(new HttpError(HTTP_STATUS.NOT_FOUND, `Ruta no encontrada: ${req.originalUrl}`));
}

module.exports = notFound;
