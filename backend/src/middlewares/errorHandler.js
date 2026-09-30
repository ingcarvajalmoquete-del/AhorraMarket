const { HTTP_STATUS } = require("../utils/httpStatus");

/* eslint-disable-next-line no-unused-vars */
function errorHandler(error, req, res, next) {
  const statusCode = error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR;
  const message = statusCode === HTTP_STATUS.INTERNAL_SERVER_ERROR
    ? "Ocurrio un error interno en el servidor."
    : error.message;

  if (statusCode === HTTP_STATUS.INTERNAL_SERVER_ERROR) {
    console.error("[ERROR]", error);
  }

  res.status(statusCode).json({ success: false, data: null, message });
}

module.exports = errorHandler;
