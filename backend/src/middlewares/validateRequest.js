const { validationResult } = require("express-validator");
const { HTTP_STATUS } = require("../utils/httpStatus");

function validateRequest(req, res, next) {
  const errors = validationResult(req);

  if (errors.isEmpty()) {
    return next();
  }

  const message = errors.array().map((item) => item.msg).join(" ");

  return res.status(HTTP_STATUS.BAD_REQUEST).json({
    success: false,
    data: null,
    message
  });
}

module.exports = validateRequest;
