import pool from "../db/db.js";
import { io } from "../socket/socket.js";
import { logActivity } from "../utils/auditLogger.js";

/*
=========================================
CREATE TRANSFER REQUEST
=========================================
*/

export const createTransferRequest = async (req, res) => {
  try {
    const {
      allocation_id,
      requested_to_employee_id,
    } = req.body;

    const requested_by = req.user.employeeId;

    if (!allocation_id || !requested_to_employee_id) {
      return res.status(400).json({
        message: "allocation_id and requested_to_employee_id are required",
      });
    }

    const allocation = await pool.query(
      `
      SELECT *
      FROM allocations
      WHERE id = $1
      AND status = 'active'
      `,
      [allocation_id]
    );

    if (allocation.rows.length === 0) {
      return res.status(404).json({
        message: "Active allocation not found",
      });
    }

    const result = await pool.query(
      `
      INSERT INTO transfer_requests
      (
        allocation_id,
        requested_to_employee_id,
        requested_by,
        status
      )
      VALUES
      ($1,$2,$3,'requested')
      RETURNING *
      `,
      [
        allocation_id,
        requested_to_employee_id,
        requested_by,
      ]
    );

    // ==============================
    // AUDIT LOG
    // ==============================

    await logActivity(
      requested_by,
      "Transfer Requested",
      "transfer",
      result.rows[0].id,
      {
        allocationId: allocation_id,
        requestedTo: requested_to_employee_id,
      }
    );

    res.status(201).json({
      message: "Transfer request created",
      transfer: result.rows[0],
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      message: "Server Error",
    });

  }
};

/*
=========================================
GET ALL TRANSFER REQUESTS
=========================================
*/

export const getTransferRequests = async (req, res) => {

  try {

    const result = await pool.query(`
      SELECT
        tr.*,
        e1.name AS requested_by_name,
        e2.name AS requested_to_name
      FROM transfer_requests tr
      LEFT JOIN employees e1
        ON e1.id = tr.requested_by
      LEFT JOIN employees e2
        ON e2.id = tr.requested_to_employee_id
      ORDER BY tr.created_at DESC
    `);

    res.json(result.rows);

  } catch (err) {

    console.error(err);

    res.status(500).json({
      message: "Server Error",
    });

  }

};

/*
=========================================
APPROVE TRANSFER
=========================================
*/

export const approveTransfer = async (req, res) => {

  try {

    const { id } = req.params;

    const approved_by = req.user.employeeId;

    const transfer = await pool.query(
      `
      SELECT *
      FROM transfer_requests
      WHERE id = $1
      `,
      [id]
    );

    if (transfer.rows.length === 0) {
      return res.status(404).json({
        message: "Transfer request not found",
      });
    }

    await pool.query(
      `
      UPDATE allocations
      SET employee_id = $1
      WHERE id = $2
      `,
      [
        transfer.rows[0].requested_to_employee_id,
        transfer.rows[0].allocation_id,
      ]
    );

    const result = await pool.query(
      `
      UPDATE transfer_requests
      SET
        approved_by = $1,
        status = 'approved'
      WHERE id = $2
      RETURNING *
      `,
      [
        approved_by,
        id,
      ]
    );

    // ==============================
    // SOCKET NOTIFICATION
    // ==============================

    if (io) {

      io.to(transfer.rows[0].requested_to_employee_id).emit("notification", {
        title: "Transfer Approved",
        message: "An asset has been transferred to you.",
        type: "transfer",
        transferId: id,
      });

    }

    // ==============================
    // AUDIT LOG
    // ==============================

    await logActivity(
      approved_by,
      "Transfer Approved",
      "transfer",
      id,
      {
        allocationId: transfer.rows[0].allocation_id,
        newEmployee: transfer.rows[0].requested_to_employee_id,
      }
    );

    res.json({
      message: "Transfer approved",
      transfer: result.rows[0],
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      message: "Server Error",
    });

  }

};