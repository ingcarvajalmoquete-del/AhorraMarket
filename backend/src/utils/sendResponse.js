const { HTTP_STATUS } = require("./httpStatus");

function sendSuccess(res, statusCode, data, message = "") {
  return res.status(statusCode).json({ success: true, data, message });
}

function sendCreated(res, data, message = "Recurso creado correctamente.") {
  return sendSuccess(res, HTTP_STATUS.CREATED, data, message);
}

function sendOk(res, data, message = "") {
  return sendSuccess(res, HTTP_STATUS.OK, data, message);
}

module.exports = { sendSuccess, sendCreated, sendOk };
