import pool from "../db/db.js";

/*
=========================================
CREATE DEPARTMENT
POST /api/departments
=========================================
*/
export const createDepartment = async (req, res) => {
  try {
    const {
      name,
      parent_department_id,
      head_employee_id,
      status,
    } = req.body;

    if (!name) {
      return res.status(400).json({
        message: "Department name is required",
      });
    }

    const result = await pool.query(
      `
      INSERT INTO departments
      (name, parent_department_id, head_employee_id, status)
      VALUES ($1, $2, $3, $4)
      RETURNING *
      `,
      [
        name,
        parent_department_id || null,
        head_employee_id || null,
        status || "active",
      ]
    );

    res.status(201).json({
      message: "Department created successfully",
      department: result.rows[0],
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
GET ALL DEPARTMENTS
GET /api/departments
=========================================
*/
export const getDepartments = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT *
      FROM departments
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
GET DEPARTMENT BY ID
GET /api/departments/:id
=========================================
*/
export const getDepartmentById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `
      SELECT *
      FROM departments
      WHERE id = $1
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Department not found",
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
UPDATE DEPARTMENT
PUT /api/departments/:id
=========================================
*/
export const updateDepartment = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      name,
      parent_department_id,
      head_employee_id,
      status,
    } = req.body;

    const result = await pool.query(
      `
      UPDATE departments
      SET
        name = $1,
        parent_department_id = $2,
        head_employee_id = $3,
        status = $4
      WHERE id = $5
      RETURNING *
      `,
      [
        name,
        parent_department_id || null,
        head_employee_id || null,
        status,
        id,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Department not found",
      });
    }

    res.json({
      message: "Department updated successfully",
      department: result.rows[0],
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
DELETE DEPARTMENT
DELETE /api/departments/:id
=========================================
*/
export const deleteDepartment = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `
      DELETE FROM departments
      WHERE id = $1
      RETURNING *
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Department not found",
      });
    }

    res.json({
      message: "Department deleted successfully",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Server Error",
    });
  }
};