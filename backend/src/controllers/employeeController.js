const employeeService = require("../services/employeeService");
const asyncHandler = require("../utils/asyncHandler");
const { sendOk, sendCreated } = require("../utils/sendResponse");

const getEmployees = asyncHandler((req, res) => {
  sendOk(res, employeeService.listEmployees());
});

const createEmployee = asyncHandler((req, res) => {
  const employee = employeeService.createEmployee(req.body);
  sendCreated(res, employee, "Empleado creado correctamente.");
});

const updateEmployee = asyncHandler((req, res) => {
  const employee = employeeService.updateEmployee(Number(req.params.id), req.body);
  sendOk(res, employee, "Empleado actualizado correctamente.");
});

const deleteEmployee = asyncHandler((req, res) => {
  employeeService.deleteEmployee(Number(req.params.id));
  sendOk(res, null, "Empleado eliminado correctamente.");
});

module.exports = { getEmployees, createEmployee, updateEmployee, deleteEmployee };
