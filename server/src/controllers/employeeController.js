import pool from "../db/db.js";

/*
=========================================
GET ALL EMPLOYEES
=========================================
*/

export const getEmployees = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        id,
        name,
        email,
        role,
        department_id,
        status
      FROM employees
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
GET EMPLOYEE BY ID
=========================================
*/

export const getEmployeeById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `
      SELECT
        id,
        name,
        email,
        role,
        department_id,
        status
      FROM employees
      WHERE id=$1
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Employee not found",
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
UPDATE EMPLOYEE
=========================================
*/

export const updateEmployee = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      name,
      email,
      department_id,
      status,
    } = req.body;

    const result = await pool.query(
      `
      UPDATE employees
      SET
        name=$1,
        email=$2,
        department_id=$3,
        status=$4
      WHERE id=$5
      RETURNING
        id,
        name,
        email,
        role,
        department_id,
        status
      `,
      [
        name,
        email,
        department_id || null,
        status,
        id,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Employee not found",
      });
    }

    res.json({
      message: "Employee updated successfully",
      employee: result.rows[0],
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
DELETE EMPLOYEE
=========================================
*/

export const deleteEmployee = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `
      DELETE FROM employees
      WHERE id=$1
      RETURNING id
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Employee not found",
      });
    }

    res.json({
      message: "Employee deleted successfully",
    });

  } catch (err) {
    console.error(err);

    res.status(500).json({
      message: "Server Error",
    });
  }
};