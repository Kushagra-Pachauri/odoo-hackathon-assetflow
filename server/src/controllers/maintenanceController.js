import pool from "../db/db.js";

/*
=========================================
CREATE MAINTENANCE REQUEST
POST /api/maintenance
=========================================
*/

export const createMaintenanceRequest = async (req, res) => {
  try {
    const {
      asset_id,
      issue_description,
      priority,
      photo_url,
    } = req.body;

    const raised_by = req.user.employeeId;

    if (!asset_id || !issue_description) {
      return res.status(400).json({
        message: "asset_id and issue_description are required",
      });
    }

    // Check asset exists
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

    // Create maintenance request
    const result = await pool.query(
      `
      INSERT INTO maintenance_requests
      (
        asset_id,
        raised_by,
        issue_description,
        priority,
        photo_url,
        status
      )
      VALUES
      ($1,$2,$3,$4,$5,'pending')
      RETURNING *
      `,
      [
        asset_id,
        raised_by,
        issue_description,
        priority || "Medium",
        photo_url || null,
      ]
    );

    // Update asset status
    await pool.query(
      `
      UPDATE assets
      SET status='under_maintenance'
      WHERE id=$1
      `,
      [asset_id]
    );

    res.status(201).json({
      message: "Maintenance request created successfully",
      maintenance: result.rows[0],
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
GET ALL MAINTENANCE REQUESTS
GET /api/maintenance
=========================================
*/

export const getMaintenanceRequests = async (req, res) => {
  try {

    const result = await pool.query(`
      SELECT
        mr.*,
        a.asset_tag,
        a.name AS asset_name,
        e.name AS raised_by_name
      FROM maintenance_requests mr
      JOIN assets a
        ON a.id = mr.asset_id
      JOIN employees e
        ON e.id = mr.raised_by
      ORDER BY mr.resolved_at NULLS FIRST, mr.id DESC
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
APPROVE MAINTENANCE
PUT /api/maintenance/:id/approve
=========================================
*/

export const approveMaintenance = async (req, res) => {

  try {

    const { id } = req.params;
    const { technician } = req.body;

    const approved_by = req.user.employeeId;

    const request = await pool.query(
      `
      SELECT *
      FROM maintenance_requests
      WHERE id=$1
      `,
      [id]
    );

    if (request.rows.length === 0) {
      return res.status(404).json({
        message: "Maintenance request not found",
      });
    }

    const result = await pool.query(
      `
      UPDATE maintenance_requests
      SET
        approved_by=$1,
        technician=$2,
        status='approved'
      WHERE id=$3
      RETURNING *
      `,
      [
        approved_by,
        technician,
        id,
      ]
    );

    res.json({
      message: "Maintenance approved successfully",
      maintenance: result.rows[0],
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
RESOLVE MAINTENANCE
PUT /api/maintenance/:id/resolve
=========================================
*/

export const resolveMaintenance = async (req, res) => {

  try {

    const { id } = req.params;

    const request = await pool.query(
      `
      SELECT *
      FROM maintenance_requests
      WHERE id=$1
      `,
      [id]
    );

    if (request.rows.length === 0) {
      return res.status(404).json({
        message: "Maintenance request not found",
      });
    }

    await pool.query(
      `
      UPDATE maintenance_requests
      SET
        status='resolved',
        resolved_at=NOW()
      WHERE id=$1
      `,
      [id]
    );

    await pool.query(
      `
      UPDATE assets
      SET status='available'
      WHERE id=$1
      `,
      [request.rows[0].asset_id]
    );

    res.json({
      message: "Maintenance resolved successfully",
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      message: "Server Error",
    });

  }
};