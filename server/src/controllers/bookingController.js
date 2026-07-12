import pool from "../db/db.js";
import { io } from "../socket/socket.js";
/*
=========================================
CREATE BOOKING
=========================================
*/

export const createBooking = async (req, res) => {
  try {
    const {
      asset_id,
      starts_at,
      ends_at,
      purpose,
    } = req.body;

    const booked_by = req.user.employeeId;

    if (!asset_id || !starts_at || !ends_at) {
      return res.status(400).json({
        message: "asset_id, starts_at and ends_at are required",
      });
    }

    const asset = await pool.query(
      `
      SELECT *
      FROM assets
      WHERE id = $1
      `,
      [asset_id]
    );

    if (asset.rows.length === 0) {
      return res.status(404).json({
        message: "Asset not found",
      });
    }

    if (!asset.rows[0].is_bookable) {
      return res.status(400).json({
        message: "This asset cannot be booked",
      });
    }

    const result = await pool.query(
      `
      INSERT INTO bookings
      (
        asset_id,
        booked_by,
        starts_at,
        ends_at,
        purpose,
        status
      )
      VALUES
      ($1,$2,$3,$4,$5,'upcoming')
      RETURNING *
      `,
      [
        asset_id,
        booked_by,
        starts_at,
        ends_at,
        purpose || null,
      ]
    );

    // ==============================
    // SOCKET.IO NOTIFICATION
    // ==============================
    if (io) {
      io.to(booked_by).emit("notification", {
        title: "Booking Confirmed",
        message: `Your booking for "${asset.rows[0].name}" has been confirmed.`,
        type: "booking",
        bookingId: result.rows[0].id,
        assetId: asset_id,
      });
    }

    res.status(201).json({
      message: "Booking created successfully",
      booking: result.rows[0],
    });

  } catch (err) {

    console.error(err);

    // PostgreSQL exclusion constraint violation
    if (err.code === "23P01") {
      return res.status(400).json({
        message: "Asset already booked during this time",
      });
    }

    res.status(500).json({
      message: "Server Error",
    });

  }
};

/*
=========================================
GET BOOKINGS
=========================================
*/

export const getBookings = async (req, res) => {

  try {

    const result = await pool.query(`
      SELECT
      b.*,
      a.asset_tag,
      a.name AS asset_name,
      e.name AS booked_by_name
      FROM bookings b
      JOIN assets a
      ON a.id=b.asset_id
      JOIN employees e
      ON e.id=b.booked_by
      ORDER BY b.starts_at
    `);

    res.json(result.rows);

  } catch (err) {

    console.error(err);

    res.status(500).json({
      message:"Server Error"
    });

  }

};

/*
=========================================
CANCEL BOOKING
=========================================
*/

export const cancelBooking = async (req, res) => {

  try {

    const { id } = req.params;

    const result = await pool.query(
      `
      UPDATE bookings
      SET status='cancelled'
      WHERE id=$1
      RETURNING *
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message:"Booking not found"
      });
    }

    res.json({
      message:"Booking cancelled"
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      message:"Server Error"
    });

  }

};