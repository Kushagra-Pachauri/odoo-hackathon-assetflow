import pg from 'pg';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function seed() {
  console.log("Starting idempotent database seed...");

  try {
    // 1. Seed Asset Categories (Idempotent by name - no unique constraint, so we check existence)
    console.log("Seeding Asset Categories...");
    const categories = ['Electronics', 'Furniture', 'Vehicles'];
    for (const cat of categories) {
      const res = await pool.query('SELECT id FROM asset_categories WHERE name = $1', [cat]);
      if (res.rows.length === 0) {
        await pool.query('INSERT INTO asset_categories (name) VALUES ($1)', [cat]);
      }
    }

    // Fetch category IDs
    const catRows = await pool.query('SELECT id, name FROM asset_categories');
    const getCatId = (name) => catRows.rows.find(c => c.name === name)?.id;

    // 2. Seed Departments (Check by name)
    console.log("Seeding Departments...");
    const depts = [
      { name: 'Engineering', status: 'active' },
      { name: 'Facilities', status: 'active' },
      { name: 'Field Ops', status: 'active' },
      { name: 'Inactive Dept', status: 'inactive' }
    ];

    for (const dept of depts) {
      const res = await pool.query('SELECT id FROM departments WHERE name = $1', [dept.name]);
      if (res.rows.length === 0) {
        await pool.query('INSERT INTO departments (name, status) VALUES ($1, $2)', [dept.name, dept.status]);
      } else {
        await pool.query('UPDATE departments SET status = $2 WHERE name = $1', [dept.name, dept.status]);
      }
    }

    // Field Ops (East) as child of Field Ops
    const fieldOpsRes = await pool.query("SELECT id FROM departments WHERE name = 'Field Ops'");
    const fieldOpsId = fieldOpsRes.rows[0].id;
    const childRes = await pool.query("SELECT id FROM departments WHERE name = 'Field Ops (East)'");
    if (childRes.rows.length === 0) {
      await pool.query('INSERT INTO departments (name, parent_department_id) VALUES ($1, $2)', ['Field Ops (East)', fieldOpsId]);
    } else {
      await pool.query('UPDATE departments SET parent_department_id = $2 WHERE name = $1', ['Field Ops (East)', fieldOpsId]);
    }

    // Fetch department IDs
    const deptRows = await pool.query('SELECT id, name FROM departments');
    const getDeptId = (name) => deptRows.rows.find(d => d.name === name)?.id;

    // 3. Seed Employees (Idempotent using ON CONFLICT since email is UNIQUE)
    console.log("Seeding Employees...");
    const defaultPassword = await bcrypt.hash('password123', 10);
    const employees = [
      { name: 'Admin User', email: 'admin@assetflow.com', role: 'admin', dept: 'Engineering' },
      { name: 'Asset Manager', email: 'manager@assetflow.com', role: 'asset_manager', dept: 'Facilities' },
      { name: 'Eng Head', email: 'enghead@assetflow.com', role: 'department_head', dept: 'Engineering' },
      { name: 'Alice Smith', email: 'alice@assetflow.com', role: 'employee', dept: 'Engineering' },
      { name: 'Bob Jones', email: 'bob@assetflow.com', role: 'employee', dept: 'Field Ops (East)' },
    ];

    for (const emp of employees) {
      const deptId = getDeptId(emp.dept);
      await pool.query(
        `INSERT INTO employees (name, email, password_hash, department_id, role) 
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (email) DO UPDATE 
         SET name = $1, department_id = $4, role = $5`,
        [emp.name, emp.email, defaultPassword, deptId, emp.role]
      );
    }

    // Set Department Head for Engineering
    const engHeadRes = await pool.query("SELECT id FROM employees WHERE email = 'enghead@assetflow.com'");
    await pool.query("UPDATE departments SET head_employee_id = $1 WHERE name = 'Engineering'", [engHeadRes.rows[0].id]);

    const empRows = await pool.query('SELECT id, email FROM employees');
    const getEmpId = (email) => empRows.rows.find(e => e.email === email)?.id;

    // 4. Seed Assets (ON CONFLICT asset_tag)
    console.log("Seeding Assets...");
    const assets = [
      { tag: 'AF-0012', name: 'Dell Laptop', cat: 'Electronics', bookable: false, status: 'allocated' },
      { tag: 'AF-0062', name: 'Projector', cat: 'Electronics', bookable: true, status: 'available' },
      { tag: 'AF-0201', name: 'Office Chair', cat: 'Furniture', bookable: false, status: 'available' },
      // 12 extra assets
      { tag: 'AF-1001', name: 'MacBook Pro', cat: 'Electronics', bookable: false, status: 'allocated' },
      { tag: 'AF-1002', name: 'ThinkPad T14', cat: 'Electronics', bookable: false, status: 'under_maintenance' },
      { tag: 'AF-1003', name: 'Standing Desk', cat: 'Furniture', bookable: false, status: 'available' },
      { tag: 'AF-1004', name: 'Ergonomic Mouse', cat: 'Electronics', bookable: false, status: 'allocated' },
      { tag: 'AF-1005', name: 'Conference Table', cat: 'Furniture', bookable: true, status: 'available' },
      { tag: 'AF-1006', name: 'Delivery Van', cat: 'Vehicles', bookable: true, status: 'allocated' },
      { tag: 'AF-1007', name: 'Forklift', cat: 'Vehicles', bookable: false, status: 'under_maintenance' },
      { tag: 'AF-1008', name: 'Dual Monitor Setup', cat: 'Electronics', bookable: false, status: 'available' },
      { tag: 'AF-1009', name: 'Server Rack', cat: 'Electronics', bookable: false, status: 'allocated' },
      { tag: 'AF-1010', name: 'Whiteboard', cat: 'Furniture', bookable: false, status: 'available' },
      { tag: 'AF-1011', name: 'Company Car (Sedan)', cat: 'Vehicles', bookable: true, status: 'available' },
      { tag: 'AF-1012', name: 'iPad Pro', cat: 'Electronics', bookable: true, status: 'available' },
    ];

    for (const asset of assets) {
      const catId = getCatId(asset.cat);
      await pool.query(
        `INSERT INTO assets (asset_tag, name, category_id, is_bookable, status)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (asset_tag) DO UPDATE 
         SET name = $2, category_id = $3, is_bookable = $4, status = $5`,
        [asset.tag, asset.name, catId, asset.bookable, asset.status]
      );
    }

    const assetRows = await pool.query('SELECT id, asset_tag FROM assets');
    const getAssetId = (tag) => assetRows.rows.find(a => a.asset_tag === tag)?.id;

    // 5. Seed Allocations
    console.log("Seeding Allocations...");
    // Only insert if no active allocation exists for this asset to avoid breaking the partial unique index
    const seedAllocation = async (assetTag, empEmail, expectedReturnOffsetDays = null) => {
      const aId = getAssetId(assetTag);
      const eId = getEmpId(empEmail);
      
      const existing = await pool.query("SELECT id FROM allocations WHERE asset_id = $1 AND status = 'active'", [aId]);
      if (existing.rows.length === 0) {
        let expectedReturn = null;
        if (expectedReturnOffsetDays !== null) {
          const d = new Date();
          d.setDate(d.getDate() + expectedReturnOffsetDays);
          expectedReturn = d.toISOString();
        }
        await pool.query(
          `INSERT INTO allocations (asset_id, employee_id, status, expected_return_date) VALUES ($1, $2, 'active', $3)`,
          [aId, eId, expectedReturn]
        );
      }
    };

    // Standard active allocation
    await seedAllocation('AF-0012', 'alice@assetflow.com', 30);
    
    // Intentionally overdue allocation (-5 days)
    await seedAllocation('AF-1001', 'bob@assetflow.com', -5);

    // 6. Seed Bookings
    console.log("Seeding Bookings...");
    const bookableAssetId = getAssetId('AF-0062');
    const bookerId = getEmpId('alice@assetflow.com');
    
    // Create a booking for today (next hour)
    const start = new Date();
    start.setHours(start.getHours() + 1);
    const end = new Date(start);
    end.setHours(end.getHours() + 1);

    // Idempotency: clear existing upcoming bookings for this specific bookable asset to avoid overlap exclusion errors on re-run
    await pool.query("DELETE FROM bookings WHERE asset_id = $1 AND status = 'upcoming'", [bookableAssetId]);
    await pool.query(
      `INSERT INTO bookings (asset_id, booked_by, starts_at, ends_at, purpose) VALUES ($1, $2, $3, $4, $5)`,
      [bookableAssetId, bookerId, start.toISOString(), end.toISOString(), 'Client Presentation']
    );

    // 7. Seed Maintenance Requests
    console.log("Seeding Maintenance Requests...");
    const m1AssetId = getAssetId('AF-1002');
    const m2AssetId = getAssetId('AF-1007');

    // Idempotency: Delete existing requests for these assets to prevent dupes
    await pool.query("DELETE FROM maintenance_requests WHERE asset_id = $1 OR asset_id = $2", [m1AssetId, m2AssetId]);

    // Pending
    await pool.query(
      `INSERT INTO maintenance_requests (asset_id, raised_by, issue_description, priority, status) VALUES ($1, $2, $3, $4, $5)`,
      [m1AssetId, getEmpId('alice@assetflow.com'), 'Screen flickering', 'High', 'pending']
    );

    // Approved / Technician Assigned
    await pool.query(
      `INSERT INTO maintenance_requests (asset_id, raised_by, issue_description, priority, status, technician, approved_by) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [m2AssetId, getEmpId('bob@assetflow.com'), 'Hydraulic leak', 'Critical', 'approved', 'John Fixer', getEmpId('admin@assetflow.com')]
    );

    console.log("Database seeded successfully!");
  } catch (error) {
    console.error("Error during seeding:", error);
  } finally {
    pool.end();
  }
}

seed();
