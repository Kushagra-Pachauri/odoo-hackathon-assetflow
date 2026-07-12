import express from "express";

import {
  createTransferRequest,
  getTransferRequests,
  approveTransfer,
} from "../controllers/transferController.js";

import {
  requireAuth,
  requireRole,
} from "../middleware/authMiddleware.js";

const router = express.Router();

/*
=========================================
CREATE TRANSFER REQUEST
Employee/Admin
=========================================
*/
router.post(
  "/",
  requireAuth,
  createTransferRequest
);

/*
=========================================
GET ALL TRANSFER REQUESTS
Logged In Users
=========================================
*/
router.get(
  "/",
  requireAuth,
  getTransferRequests
);

/*
=========================================
APPROVE TRANSFER REQUEST
Admin Only
=========================================
*/
router.put(
  "/:id/approve",
  requireAuth,
  requireRole("admin"),
  approveTransfer
);

export default router;