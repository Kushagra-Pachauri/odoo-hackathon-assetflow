import pool from "../db/db.js";

/*
=========================================
CREATE CATEGORY
=========================================
*/

export const createCategory = async (req, res) => {
  try {
    const { name, custom_fields } = req.body;

    if (!name) {
      return res.status(400).json({
        message: "Category name is required",
      });
    }

    const result = await pool.query(
      `
      INSERT INTO asset_categories
      (name, custom_fields)
      VALUES($1,$2)
      RETURNING *
      `,
      [name, custom_fields || {}]
    );

    res.status(201).json({
      message: "Category created successfully",
      category: result.rows[0],
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
GET ALL CATEGORIES
=========================================
*/

export const getCategories = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT *
      FROM asset_categories
      ORDER BY name
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
GET CATEGORY BY ID
=========================================
*/

export const getCategoryById = async (req, res) => {
  try {

    const { id } = req.params;

    const result = await pool.query(
      `
      SELECT *
      FROM asset_categories
      WHERE id=$1
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Category not found",
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

/*
=========================================
UPDATE CATEGORY
=========================================
*/

export const updateCategory = async (req, res) => {
  try {

    const { id } = req.params;

    const { name, custom_fields } = req.body;

    const result = await pool.query(
      `
      UPDATE asset_categories
      SET
      name=$1,
      custom_fields=$2
      WHERE id=$3
      RETURNING *
      `,
      [name, custom_fields || {}, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Category not found",
      });
    }

    res.json({
      message: "Category updated successfully",
      category: result.rows[0],
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
DELETE CATEGORY
=========================================
*/

export const deleteCategory = async (req, res) => {
  try {

    const { id } = req.params;

    const result = await pool.query(
      `
      DELETE FROM asset_categories
      WHERE id=$1
      RETURNING *
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Category not found",
      });
    }

    res.json({
      message: "Category deleted successfully",
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Server Error",
    });
  }
};