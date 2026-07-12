import pool from "../db/db.js";

/*
=========================================
GET MY NOTIFICATIONS
=========================================
*/

export const getNotifications = async (req, res) => {
  try {

    const employeeId = req.user.employeeId;

    const result = await pool.query(
      `
      SELECT *
      FROM notifications
      WHERE employee_id = $1
      ORDER BY created_at DESC
      `,
      [employeeId]
    );

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
MARK AS READ
=========================================
*/

export const markAsRead = async (req, res) => {

  try {

    const { id } = req.params;

    const result = await pool.query(
      `
      UPDATE notifications
      SET read = true
      WHERE id = $1
      RETURNING *
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Notification not found",
      });
    }

    res.json({
      message: "Notification marked as read",
      notification: result.rows[0],
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
CREATE NOTIFICATION
(Used internally)
=========================================
*/

export const createNotification = async (
  employee_id,
  type,
  message,
  related_entity_type = null,
  related_entity_id = null
) => {

  await pool.query(
    `
    INSERT INTO notifications
    (
      employee_id,
      type,
      message,
      related_entity_type,
      related_entity_id
    )
    VALUES
    ($1,$2,$3,$4,$5)
    `,
    [
      employee_id,
      type,
      message,
      related_entity_type,
      related_entity_id,
    ]
  );

};