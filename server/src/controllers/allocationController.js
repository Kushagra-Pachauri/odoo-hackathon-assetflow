import pool from "../db/db.js";

/*
=========================================
ALLOCATE ASSET
POST /api/allocations
=========================================
*/

export const allocateAsset = async (req, res) => {
  try {
    const {
      asset_id,
      employee_id,
      expected_return_date,
    } = req.body;

    if (!asset_id || !employee_id) {
      return res.status(400).json({
        message: "asset_id and employee_id are required",
      });
    }

    // Check asset exists
    const asset = await pool.query(
      "SELECT * FROM assets WHERE id = $1",
      [asset_id]
    );

    if (asset.rows.length === 0) {
      return res.status(404).json({
        message: "Asset not found",
      });
    }

    // Check if asset is already allocated
    const activeAllocation = await pool.query(
      `
      SELECT id
      FROM allocations
      WHERE asset_id = $1
      AND status = 'active'
      `,
      [asset_id]
    );

    if (activeAllocation.rows.length > 0) {
      return res.status(400).json({
        message: "Asset is already allocated",
      });
    }

    // Create allocation
    const allocation = await pool.query(
      `
      INSERT INTO allocations
      (
        asset_id,
        employee_id,
        allocated_at,
        expected_return_date,
        status
      )
      VALUES
      ($1,$2,NOW(),$3,'active')
      RETURNING *
      `,
      [
        asset_id,
        employee_id,
        expected_return_date || null,
      ]
    );

    // Update asset status
    await pool.query(
      `
      UPDATE assets
      SET status='allocated'
      WHERE id=$1
      `,
      [asset_id]
    );

    res.status(201).json({
      message: "Asset allocated successfully",
      allocation: allocation.rows[0],
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
GET ALL ALLOCATIONS
=========================================
*/

export const getAllocations = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        al.*,
        a.asset_tag,
        a.name AS asset_name,
        e.name AS employee_name
      FROM allocations al
      JOIN assets a
        ON a.id = al.asset_id
      JOIN employees e
        ON e.id = al.employee_id
      ORDER BY al.allocated_at DESC
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
RETURN ASSET
PUT /api/allocations/:id/return
=========================================
*/

export const returnAsset = async (req, res) => {
  try {
    const { id } = req.params;

    const allocation = await pool.query(
      `
      SELECT *
      FROM allocations
      WHERE id=$1
      `,
      [id]
    );

    if (allocation.rows.length === 0) {
      return res.status(404).json({
        message: "Allocation not found",
      });
    }

    await pool.query(
      `
      UPDATE allocations
      SET
        actual_return_date = CURRENT_DATE,
        status='returned'
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
      [allocation.rows[0].asset_id]
    );

    res.json({
      message: "Asset returned successfully",
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Server Error",
    });
  }
};