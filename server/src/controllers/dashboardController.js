import pool from "../db/db.js";

export const getDashboardStats = async (req, res) => {
  try {

    const [
      assets,
      available,
      allocated,
      maintenance,
      employees,
      bookings,
      pendingMaintenance,
    ] = await Promise.all([

      pool.query("SELECT COUNT(*) FROM assets"),

      pool.query(
        "SELECT COUNT(*) FROM assets WHERE status='available'"
      ),

      pool.query(
        "SELECT COUNT(*) FROM assets WHERE status='allocated'"
      ),

      pool.query(
        "SELECT COUNT(*) FROM assets WHERE status='under_maintenance'"
      ),

      pool.query(
        "SELECT COUNT(*) FROM employees"
      ),

      pool.query(
        "SELECT COUNT(*) FROM bookings WHERE status='upcoming'"
      ),

      pool.query(
        "SELECT COUNT(*) FROM maintenance_requests WHERE status='pending'"
      ),

    ]);

    res.json({

      totalAssets: Number(assets.rows[0].count),

      availableAssets: Number(available.rows[0].count),

      allocatedAssets: Number(allocated.rows[0].count),

      maintenanceAssets: Number(maintenance.rows[0].count),

      totalEmployees: Number(employees.rows[0].count),

      activeBookings: Number(bookings.rows[0].count),

      pendingMaintenance: Number(
        pendingMaintenance.rows[0].count
      ),

    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      message: "Server Error",
    });

  }
};