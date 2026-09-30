const employeeRepository = require("../repositories/employeeRepository");
const { toPublicEmployee } = require("../models/Employee");
const HttpError = require("../utils/httpError");
const { HTTP_STATUS } = require("../utils/httpStatus");

function listEmployees() {
  return employeeRepository.findAll().map(toPublicEmployee);
}

function ensureEmployeeExists(id) {
  const employee = employeeRepository.findById(id);

  if (!employee) {
    throw new HttpError(HTTP_STATUS.NOT_FOUND, "Empleado no encontrado.");
  }

  return employee;
}

function createEmployee(data) {
  return toPublicEmployee(employeeRepository.create(data));
}

function updateEmployee(id, data) {
  ensureEmployeeExists(id);
  return toPublicEmployee(employeeRepository.update(id, data));
}

function deleteEmployee(id) {
  ensureEmployeeExists(id);
  employeeRepository.remove(id);
}

module.exports = { listEmployees, createEmployee, updateEmployee, deleteEmployee };
