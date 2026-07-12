import express from "express";

import {
  createDepartment,
  getDepartments,
  getDepartmentById,
  updateDepartment,
  deleteDepartment,
} from "../controllers/departmentController.js";

import {
  requireAuth,
  requireRole,
} from "../middleware/authMiddleware.js";

const router = express.Router();

/*
=========================================
CREATE DEPARTMENT
Admin Only
=========================================
*/
router.post(
  "/",
  requireAuth,
  requireRole("admin"),
  createDepartment
);

/*
=========================================
GET ALL DEPARTMENTS
Any Logged-in User
=========================================
*/
router.get(
  "/",
  requireAuth,
  getDepartments
);

/*
=========================================
GET SINGLE DEPARTMENT
Any Logged-in User
=========================================
*/
router.get(
  "/:id",
  requireAuth,
  getDepartmentById
);

/*
=========================================
UPDATE DEPARTMENT
Admin Only
=========================================
*/
router.put(
  "/:id",
  requireAuth,
  requireRole("admin"),
  updateDepartment
);

/*
=========================================
DELETE DEPARTMENT
Admin Only
=========================================
*/
router.delete(
  "/:id",
  requireAuth,
  requireRole("admin"),
  deleteDepartment
);

export default router;