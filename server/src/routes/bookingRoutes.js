import express from "express";

import {
  createBooking,
  getBookings,
  cancelBooking,
} from "../controllers/bookingController.js";

import {
  requireAuth,
  requireRole,
} from "../middleware/authMiddleware.js";

const router = express.Router();

/*
=========================================
CREATE BOOKING
=========================================
*/
router.post(
  "/",
  requireAuth,
  createBooking
);

/*
=========================================
GET ALL BOOKINGS
=========================================
*/
router.get(
  "/",
  requireAuth,
  getBookings
);

/*
=========================================
CANCEL BOOKING
=========================================
*/
router.put(
  "/:id/cancel",
  requireAuth,
  requireRole("admin"),
  cancelBooking
);

export default router;