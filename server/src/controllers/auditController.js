import pool from "../db/db.js";

/*
=========================================
GET ALL AUDIT LOGS
(Admin Only)
=========================================
*/

export const getAuditLogs = async (req, res) => {

  try {

    const result = await pool.query(`
      SELECT
        al.*,
        e.name AS employee_name,
        e.email
      FROM audit_logs al
      LEFT JOIN employees e
      ON e.id = al.employee_id
      ORDER BY al.created_at DESC
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
GET SINGLE AUDIT LOG
=========================================
*/

export const getAuditLogById = async (req, res) => {

  try {

    const { id } = req.params;

    const result = await pool.query(
      `
      SELECT
        al.*,
        e.name AS employee_name,
        e.email
      FROM audit_logs al
      LEFT JOIN employees e
      ON e.id = al.employee_id
      WHERE al.id = $1
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Audit log not found",
      });
    }

    res.json(result.rows[0]);

  } catch (err) {

    console.error(err);

    res.status(500).json({
      message: "Server Error",
    });

  }

};