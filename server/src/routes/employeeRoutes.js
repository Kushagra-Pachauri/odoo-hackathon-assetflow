import express from "express";

import {
  getEmployees,
  getEmployeeById,
  updateEmployee,
  deleteEmployee,
  promoteEmployee,
} from "../controllers/employeeController.js";

import {
  requireAuth,
  requireRole,
} from "../middleware/authMiddleware.js";

const router = express.Router();

/*
=========================================
GET ALL EMPLOYEES
Admin Only
=========================================
*/
router.get(
  "/",
  requireAuth,
  requireRole("admin"),
  getEmployees
);

/*
=========================================
GET EMPLOYEE BY ID
Logged-in Users
=========================================
*/
router.get(
  "/:id",
  requireAuth,
  getEmployeeById
);

/*
=========================================
UPDATE EMPLOYEE
Admin Only
=========================================
*/
router.put(
  "/:id",
  requireAuth,
  requireRole("admin"),
  updateEmployee
);

/*
=========================================
DELETE EMPLOYEE
Admin Only
=========================================
*/
router.delete(
  "/:id",
  requireAuth,
  requireRole("admin"),
  deleteEmployee
);

/*
=========================================
PROMOTE EMPLOYEE
Admin Only
=========================================
*/
router.patch(
  "/:id/role",
  requireAuth,
  requireRole("admin"),
  promoteEmployee
);

export default router;