import express from "express";

import {
  getNotifications,
  markAsRead,
} from "../controllers/notificationController.js";

import {
  requireAuth,
} from "../middleware/authMiddleware.js";

const router = express.Router();

/*
=========================================
GET MY NOTIFICATIONS
=========================================
*/
router.get(
  "/",
  requireAuth,
  getNotifications
);

/*
=========================================
MARK NOTIFICATION AS READ
=========================================
*/
router.put(
  "/:id/read",
  requireAuth,
  markAsRead
);

export default router;
