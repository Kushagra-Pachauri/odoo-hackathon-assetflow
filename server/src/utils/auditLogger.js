import pool from "../db/db.js";

export const logActivity = async (
  employeeId,
  action,
  entityType = null,
  entityId = null,
  details = {}
) => {
  try {
    await pool.query(
      `
      INSERT INTO audit_logs
      (
        employee_id,
        action,
        entity_type,
        entity_id,
        details
      )
      VALUES
      ($1,$2,$3,$4,$5)
      `,
      [
        employeeId,
        action,
        entityType,
        entityId,
        JSON.stringify(details),
      ]
    );
  } catch (err) {
    console.error("Audit Log Error:", err);
  }
};