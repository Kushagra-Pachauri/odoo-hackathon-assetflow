import bcrypt from "bcryptjs";
import pool from "../db/db.js";
import { generateToken } from "../utils/jwt.js";

/*
=========================================
SIGNUP
=========================================
POST /api/auth/signup
*/

export const signup = async (req, res) => {
  try {
    const { name, email, password, departmentId } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Name, email and password are required",
      });
    }

    const existingUser = await pool.query(
      "SELECT id FROM employees WHERE email=$1",
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({
        message: "Email already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `
      INSERT INTO employees
      (name,email,password_hash,department_id,role)
      VALUES($1,$2,$3,$4,'employee')
      RETURNING id,name,email,role,department_id
      `,
      [
        name,
        email,
        hashedPassword,
        departmentId || null,
      ]
    );

    return res.status(201).json({
      message: "Employee created successfully",
      employee: result.rows[0],
    });

  } catch (err) {
    console.error(err);

    return res.status(500).json({
      message: "Server Error",
    });
  }
};

/*
=========================================
LOGIN
=========================================
POST /api/auth/login
*/

export const login = async (req, res) => {

  try {

    const { email, password } = req.body;

    if (!email || !password) {

      return res.status(400).json({
        message: "Email and password required",
      });

    }

    const result = await pool.query(

      `
      SELECT *
      FROM employees
      WHERE email=$1
      `,
      [email]

    );

    if (result.rows.length === 0) {

      return res.status(401).json({
        message: "Invalid Credentials",
      });

    }

    const employee = result.rows[0];

    const match = await bcrypt.compare(
      password,
      employee.password_hash
    );

    if (!match) {

      return res.status(401).json({
        message: "Invalid Credentials",
      });

    }

    const token = generateToken(employee);

    res.cookie("token", token, {

      httpOnly: true,
      sameSite: "lax",
      maxAge: 8 * 60 * 60 * 1000,

    });

    return res.json({

      message: "Login Successful",

      employee: {

        id: employee.id,
        name: employee.name,
        email: employee.email,
        role: employee.role,

      },

    });

  }

  catch (err) {

    console.error(err);

    return res.status(500).json({

      message: "Server Error",

    });

  }

};

/*
=========================================
LOGOUT
=========================================
POST /api/auth/logout
*/

export const logout = async (req, res) => {

  res.clearCookie("token");

  return res.json({

    message: "Logged Out",

  });

};

/*
=========================================
ME
=========================================
GET /api/auth/me
*/

export const me = async (req, res) => {

  try {

    const result = await pool.query(

      `
      SELECT
      id,
      name,
      email,
      role,
      department_id
      FROM employees
      WHERE id=$1
      `,
      [req.user.employeeId]

    );

    if (result.rows.length === 0) {

      return res.status(404).json({

        message: "Employee Not Found",

      });

    }

    return res.json(result.rows[0]);

  }

  catch (err) {

    console.error(err);

    return res.status(500).json({

      message: "Server Error",

    });

  }

};