import pool from "../db/db.js";
import { logActivity } from "../utils/auditLogger.js";

/*
=========================================
CREATE ASSET
=========================================
*/

export const createAsset = async (req, res) => {
  try {

    const {
      asset_tag,
      name,
      category_id,
      serial_number,
      acquisition_date,
      acquisition_cost,
      condition,
      location,
      is_bookable,
      status,
      photo_url
    } = req.body;

    if (!asset_tag || !name || !category_id) {
      return res.status(400).json({
        message: "asset_tag, name and category_id are required"
      });
    }

    const result = await pool.query(
      `
      INSERT INTO assets
      (
        asset_tag,
        name,
        category_id,
        serial_number,
        acquisition_date,
        acquisition_cost,
        condition,
        location,
        is_bookable,
        status,
        photo_url
      )
      VALUES
      ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
      RETURNING *
      `,
      [
        asset_tag,
        name,
        category_id,
        serial_number || null,
        acquisition_date || null,
        acquisition_cost || null,
        condition || null,
        location || null,
        is_bookable || false,
        status || "available",
        photo_url || null
      ]
    );

    // ==============================
    // AUDIT LOG
    // ==============================
    await logActivity(
      req.user.employeeId,
      "Created Asset",
      "asset",
      result.rows[0].id,
      {
        assetTag: result.rows[0].asset_tag,
        name: result.rows[0].name,
      }
    );

    res.status(201).json({
      message: "Asset created successfully",
      asset: result.rows[0]
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      message: "Server Error"
    });

  }
};

/*
=========================================
GET ALL ASSETS
=========================================
*/

export const getAssets = async (req, res) => {

  try {

    const result = await pool.query(`
      SELECT
        a.*,
        c.name AS category_name
      FROM assets a
      LEFT JOIN asset_categories c
        ON c.id = a.category_id
      ORDER BY a.asset_tag
    `);

    res.json(result.rows);

  } catch (err) {

    console.error(err);

    res.status(500).json({
      message: "Server Error"
    });

  }

};

/*
=========================================
GET SINGLE ASSET
=========================================
*/

export const getAssetById = async (req, res) => {

  try {

    const { id } = req.params;

    const result = await pool.query(
      `
      SELECT *
      FROM assets
      WHERE id=$1
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Asset not found"
      });
    }

    res.json(result.rows[0]);

  } catch (err) {

    console.error(err);

    res.status(500).json({
      message: "Server Error"
    });

  }

};

/*
=========================================
UPDATE ASSET
=========================================
*/

export const updateAsset = async (req, res) => {

  try {

    const { id } = req.params;

    const {
      asset_tag,
      name,
      category_id,
      serial_number,
      acquisition_date,
      acquisition_cost,
      condition,
      location,
      is_bookable,
      status,
      photo_url
    } = req.body;

    const result = await pool.query(
      `
      UPDATE assets
      SET
        asset_tag=$1,
        name=$2,
        category_id=$3,
        serial_number=$4,
        acquisition_date=$5,
        acquisition_cost=$6,
        condition=$7,
        location=$8,
        is_bookable=$9,
        status=$10,
        photo_url=$11
      WHERE id=$12
      RETURNING *
      `,
      [
        asset_tag,
        name,
        category_id,
        serial_number,
        acquisition_date,
        acquisition_cost,
        condition,
        location,
        is_bookable,
        status,
        photo_url,
        id
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Asset not found"
      });
    }

    // ==============================
    // AUDIT LOG
    // ==============================
    await logActivity(
      req.user.employeeId,
      "Updated Asset",
      "asset",
      id,
      {
        assetTag: result.rows[0].asset_tag,
        name: result.rows[0].name,
      }
    );

    res.json({
      message: "Asset updated successfully",
      asset: result.rows[0]
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      message: "Server Error"
    });

  }

};

/*
=========================================
DELETE ASSET
=========================================
*/

export const deleteAsset = async (req, res) => {

  try {

    const { id } = req.params;

    const asset = await pool.query(
      `
      SELECT *
      FROM assets
      WHERE id=$1
      `,
      [id]
    );

    if (asset.rows.length === 0) {
      return res.status(404).json({
        message: "Asset not found"
      });
    }

    await pool.query(
      `
      DELETE FROM assets
      WHERE id=$1
      `,
      [id]
    );

    // ==============================
    // AUDIT LOG
    // ==============================
    await logActivity(
      req.user.employeeId,
      "Deleted Asset",
      "asset",
      id,
      {
        assetTag: asset.rows[0].asset_tag,
        name: asset.rows[0].name,
      }
    );

    res.json({
      message: "Asset deleted successfully"
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      message: "Server Error"
    });

  }

};  