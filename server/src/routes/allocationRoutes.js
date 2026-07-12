import express from "express";

import {
  allocateAsset,
  getAllocations,
  returnAsset,
} from "../controllers/allocationController.js";

import {
  requireAuth,
  requireRole,
} from "../middleware/authMiddleware.js";

const router = express.Router();

/*
=========================================
ALLOCATE ASSET
Admin Only
=========================================
*/
router.post(
  "/",
  requireAuth,
  requireRole("admin"),
  allocateAsset
);

/*
=========================================
GET ALL ALLOCATIONS
Logged In Users
=========================================
*/
router.get(
  "/",
  requireAuth,
  getAllocations
);

/*
=========================================
RETURN ASSET
Admin Only
=========================================
*/
router.put(
  "/:id/return",
  requireAuth,
  requireRole("admin"),
  returnAsset
);

export default router;