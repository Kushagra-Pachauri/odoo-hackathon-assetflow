import express from "express";

import {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
} from "../controllers/categoryController.js";

import {
  requireAuth,
  requireRole,
} from "../middleware/authMiddleware.js";

const router = express.Router();

/*
=========================================
CREATE CATEGORY
Admin Only
=========================================
*/
router.post(
  "/",
  requireAuth,
  requireRole("admin"),
  createCategory
);

/*
=========================================
GET ALL CATEGORIES
Logged-in Users
=========================================
*/
router.get(
  "/",
  requireAuth,
  getCategories
);

/*
=========================================
GET CATEGORY BY ID
Logged-in Users
=========================================
*/
router.get(
  "/:id",
  requireAuth,
  getCategoryById
);

/*
=========================================
UPDATE CATEGORY
Admin Only
=========================================
*/
router.put(
  "/:id",
  requireAuth,
  requireRole("admin"),
  updateCategory
);

/*
=========================================
DELETE CATEGORY
Admin Only
=========================================
*/
router.delete(
  "/:id",
  requireAuth,
  requireRole("admin"),
  deleteCategory
);

export default router;