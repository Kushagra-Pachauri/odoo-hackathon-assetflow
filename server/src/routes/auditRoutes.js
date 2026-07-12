import express from "express";

import {
  getAuditLogs,
  getAuditLogById,
} from "../controllers/auditController.js";

import {
  requireAuth,
  requireRole,
} from "../middleware/authMiddleware.js";

const router = express.Router();

/*
=========================================
GET ALL LOGS
=========================================
*/

router.get(
  "/",
  requireAuth,
  requireRole("admin"),
  getAuditLogs
);

/*
=========================================
GET SINGLE LOG
=========================================
*/

router.get(
  "/:id",
  requireAuth,
  requireRole("admin"),
  getAuditLogById
);

export default router;