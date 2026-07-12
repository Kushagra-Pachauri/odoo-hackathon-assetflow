import express from "express";

import {
  createMaintenanceRequest,
  getMaintenanceRequests,
  approveMaintenance,
  resolveMaintenance,
} from "../controllers/maintenanceController.js";

import {
  requireAuth,
  requireRole,
} from "../middleware/authMiddleware.js";

const router = express.Router();

/*
=========================================
CREATE MAINTENANCE REQUEST
=========================================
*/
router.post(
  "/",
  requireAuth,
  createMaintenanceRequest
);

/*
=========================================
GET ALL MAINTENANCE REQUESTS
=========================================
*/
router.get(
  "/",
  requireAuth,
  getMaintenanceRequests
);

/*
=========================================
APPROVE MAINTENANCE
=========================================
*/
router.put(
  "/:id/approve",
  requireAuth,
  requireRole("admin"),
  approveMaintenance
);

/*
=========================================
RESOLVE MAINTENANCE
=========================================
*/
router.put(
  "/:id/resolve",
  requireAuth,
  requireRole("admin"),
  resolveMaintenance
);

export default router;