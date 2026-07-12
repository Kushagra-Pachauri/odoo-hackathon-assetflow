-- ============================================================
-- AssetFlow Seed Data
-- Run AFTER schema.sql: psql $DATABASE_URL -f seed.sql
-- ============================================================

-- ================================
-- DEPARTMENTS
-- ================================

INSERT INTO departments (id, name, status)
VALUES
  ('d0000001-0000-0000-0000-000000000001', 'Engineering',     'active'),
  ('d0000001-0000-0000-0000-000000000002', 'Human Resources', 'active'),
  ('d0000001-0000-0000-0000-000000000003', 'Finance',         'active'),
  ('d0000001-0000-0000-0000-000000000004', 'Marketing',       'active'),
  ('d0000001-0000-0000-0000-000000000005', 'Operations',      'active');

-- ================================
-- EMPLOYEES
-- password for ALL users is: password123
-- bcrypt hash of "password123" (10 rounds)
-- ================================

INSERT INTO employees (id, name, email, password_hash, department_id, role, status)
VALUES
  -- Admin
  ('e0000001-0000-0000-0000-000000000001',
   'Raj Sharma',
   'admin@assetflow.com',
   '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
   'd0000001-0000-0000-0000-000000000001',
   'admin',
   'active'),

  -- Asset Manager
  ('e0000001-0000-0000-0000-000000000002',
   'Priya Patel',
   'priya@assetflow.com',
   '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
   'd0000001-0000-0000-0000-000000000001',
   'asset_manager',
   'active'),

  -- Department Head
  ('e0000001-0000-0000-0000-000000000003',
   'Amit Kumar',
   'amit@assetflow.com',
   '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
   'd0000001-0000-0000-0000-000000000002',
   'department_head',
   'active'),

  -- Regular Employees
  ('e0000001-0000-0000-0000-000000000004',
   'Sneha Gupta',
   'sneha@assetflow.com',
   '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
   'd0000001-0000-0000-0000-000000000003',
   'employee',
   'active'),

  ('e0000001-0000-0000-0000-000000000005',
   'Vikram Singh',
   'vikram@assetflow.com',
   '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
   'd0000001-0000-0000-0000-000000000004',
   'employee',
   'active'),

  ('e0000001-0000-0000-0000-000000000006',
   'Neha Verma',
   'neha@assetflow.com',
   '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
   'd0000001-0000-0000-0000-000000000005',
   'employee',
   'active'),

  ('e0000001-0000-0000-0000-000000000007',
   'Rohit Jain',
   'rohit@assetflow.com',
   '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
   'd0000001-0000-0000-0000-000000000001',
   'employee',
   'active'),

  ('e0000001-0000-0000-0000-000000000008',
   'Kavita Desai',
   'kavita@assetflow.com',
   '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
   'd0000001-0000-0000-0000-000000000002',
   'employee',
   'active');

-- Set department heads
UPDATE departments SET head_employee_id = 'e0000001-0000-0000-0000-000000000001'
  WHERE id = 'd0000001-0000-0000-0000-000000000001';
UPDATE departments SET head_employee_id = 'e0000001-0000-0000-0000-000000000003'
  WHERE id = 'd0000001-0000-0000-0000-000000000002';
UPDATE departments SET head_employee_id = 'e0000001-0000-0000-0000-000000000004'
  WHERE id = 'd0000001-0000-0000-0000-000000000003';

-- ================================
-- ASSET CATEGORIES
-- ================================

INSERT INTO asset_categories (id, name, custom_fields)
VALUES
  ('c0000001-0000-0000-0000-000000000001', 'Laptops',        '{"brand": "text", "ram": "number", "storage": "text"}'),
  ('c0000001-0000-0000-0000-000000000002', 'Monitors',       '{"size": "number", "resolution": "text"}'),
  ('c0000001-0000-0000-0000-000000000003', 'Furniture',      '{"material": "text", "color": "text"}'),
  ('c0000001-0000-0000-0000-000000000004', 'Vehicles',       '{"make": "text", "model": "text", "year": "number"}'),
  ('c0000001-0000-0000-0000-000000000005', 'Printers',       '{"type": "text", "color_capable": "boolean"}'),
  ('c0000001-0000-0000-0000-000000000006', 'Phones',         '{"brand": "text", "os": "text"}'),
  ('c0000001-0000-0000-0000-000000000007', 'Projectors',     '{"lumens": "number", "resolution": "text"}'),
  ('c0000001-0000-0000-0000-000000000008', 'Network Devices', '{"type": "text", "ports": "number"}');

-- ================================
-- ASSETS
-- ================================

INSERT INTO assets (id, asset_tag, name, category_id, serial_number, acquisition_date, acquisition_cost, condition, location, is_bookable, status, photo_url)
VALUES
  -- Laptops
  ('a0000001-0000-0000-0000-000000000001', 'AST-001', 'MacBook Pro 16"',
   'c0000001-0000-0000-0000-000000000001', 'SN-MBP-001', '2025-01-15', 249999, 'excellent', 'Floor 3, Desk A1', false, 'available', NULL),

  ('a0000001-0000-0000-0000-000000000002', 'AST-002', 'Dell XPS 15',
   'c0000001-0000-0000-0000-000000000001', 'SN-DELL-002', '2025-02-20', 179999, 'good', 'Floor 3, Desk A2', false, 'allocated', NULL),

  ('a0000001-0000-0000-0000-000000000003', 'AST-003', 'ThinkPad X1 Carbon',
   'c0000001-0000-0000-0000-000000000001', 'SN-LEN-003', '2025-03-10', 159999, 'excellent', 'Floor 2, Desk B5', false, 'available', NULL),

  ('a0000001-0000-0000-0000-000000000004', 'AST-004', 'HP Spectre x360',
   'c0000001-0000-0000-0000-000000000001', 'SN-HP-004', '2024-11-05', 149999, 'good', 'Floor 1, Desk C3', false, 'under_maintenance', NULL),

  -- Monitors
  ('a0000001-0000-0000-0000-000000000005', 'AST-005', 'Dell UltraSharp 27"',
   'c0000001-0000-0000-0000-000000000002', 'SN-MON-005', '2025-01-20', 45999, 'excellent', 'Floor 3, Desk A1', false, 'available', NULL),

  ('a0000001-0000-0000-0000-000000000006', 'AST-006', 'LG 34" Curved',
   'c0000001-0000-0000-0000-000000000002', 'SN-MON-006', '2025-04-01', 65999, 'excellent', 'Floor 2, Desk B1', false, 'allocated', NULL),

  -- Furniture
  ('a0000001-0000-0000-0000-000000000007', 'AST-007', 'Herman Miller Aeron Chair',
   'c0000001-0000-0000-0000-000000000003', 'SN-FUR-007', '2024-08-15', 129999, 'good', 'Floor 3, Room 301', false, 'available', NULL),

  ('a0000001-0000-0000-0000-000000000008', 'AST-008', 'Standing Desk Motorised',
   'c0000001-0000-0000-0000-000000000003', 'SN-FUR-008', '2025-02-01', 55999, 'excellent', 'Floor 2, Room 205', false, 'available', NULL),

  -- Vehicles
  ('a0000001-0000-0000-0000-000000000009', 'AST-009', 'Toyota Innova Crysta',
   'c0000001-0000-0000-0000-000000000004', 'SN-VEH-009', '2024-06-20', 2499999, 'good', 'Parking Lot A', true, 'available', NULL),

  ('a0000001-0000-0000-0000-000000000010', 'AST-010', 'Maruti Swift Dzire',
   'c0000001-0000-0000-0000-000000000004', 'SN-VEH-010', '2025-01-10', 999999, 'excellent', 'Parking Lot B', true, 'available', NULL),

  -- Printers
  ('a0000001-0000-0000-0000-000000000011', 'AST-011', 'HP LaserJet Pro MFP',
   'c0000001-0000-0000-0000-000000000005', 'SN-PRT-011', '2024-12-01', 35999, 'good', 'Floor 1, Print Room', true, 'available', NULL),

  -- Phones
  ('a0000001-0000-0000-0000-000000000012', 'AST-012', 'iPhone 16 Pro',
   'c0000001-0000-0000-0000-000000000006', 'SN-PHN-012', '2025-03-15', 134999, 'excellent', 'IT Storage', false, 'available', NULL),

  -- Projectors
  ('a0000001-0000-0000-0000-000000000013', 'AST-013', 'Epson EB-U42 Projector',
   'c0000001-0000-0000-0000-000000000007', 'SN-PRJ-013', '2024-09-01', 75999, 'good', 'Conference Room A', true, 'available', NULL),

  ('a0000001-0000-0000-0000-000000000014', 'AST-014', 'BenQ MH733 Projector',
   'c0000001-0000-0000-0000-000000000007', 'SN-PRJ-014', '2025-05-01', 89999, 'excellent', 'Conference Room B', true, 'available', NULL),

  -- Network Devices
  ('a0000001-0000-0000-0000-000000000015', 'AST-015', 'Cisco Catalyst Switch',
   'c0000001-0000-0000-0000-000000000008', 'SN-NET-015', '2024-10-15', 125999, 'excellent', 'Server Room', false, 'available', NULL);

-- ================================
-- ALLOCATIONS
-- ================================

INSERT INTO allocations (id, asset_id, employee_id, department_id, allocated_at, expected_return_date, status)
VALUES
  -- Dell XPS allocated to Priya
  ('a1000001-0000-0000-0000-000000000001',
   'a0000001-0000-0000-0000-000000000002',
   'e0000001-0000-0000-0000-000000000002',
   'd0000001-0000-0000-0000-000000000001',
   NOW() - INTERVAL '30 days',
   (CURRENT_DATE + INTERVAL '60 days')::date,
   'active'),

  -- LG Monitor allocated to Amit
  ('a1000001-0000-0000-0000-000000000002',
   'a0000001-0000-0000-0000-000000000006',
   'e0000001-0000-0000-0000-000000000003',
   'd0000001-0000-0000-0000-000000000002',
   NOW() - INTERVAL '15 days',
   (CURRENT_DATE + INTERVAL '90 days')::date,
   'active'),

  -- Completed allocation (ThinkPad was returned by Sneha)
  ('a1000001-0000-0000-0000-000000000003',
   'a0000001-0000-0000-0000-000000000003',
   'e0000001-0000-0000-0000-000000000004',
   'd0000001-0000-0000-0000-000000000003',
   NOW() - INTERVAL '60 days',
   (CURRENT_DATE - INTERVAL '10 days')::date,
   'returned');

UPDATE allocations
SET actual_return_date = (CURRENT_DATE - INTERVAL '10 days')::date,
    return_condition_notes = 'Returned in good condition'
WHERE id = 'a1000001-0000-0000-0000-000000000003';

-- ================================
-- TRANSFER REQUESTS
-- ================================

INSERT INTO transfer_requests (id, allocation_id, requested_to_employee_id, requested_by, status, created_at)
VALUES
  -- Pending transfer: Priya wants to transfer Dell XPS to Rohit
  ('ed000001-0000-0000-0000-000000000001',
   'a1000001-0000-0000-0000-000000000001',
   'e0000001-0000-0000-0000-000000000007',
   'e0000001-0000-0000-0000-000000000002',
   'requested',
   NOW() - INTERVAL '2 days');

-- ================================
-- BOOKINGS
-- ================================

INSERT INTO bookings (id, asset_id, booked_by, starts_at, ends_at, status, purpose)
VALUES
  -- Upcoming: Vikram booked the Innova
  ('b0000001-0000-0000-0000-000000000001',
   'a0000001-0000-0000-0000-000000000009',
   'e0000001-0000-0000-0000-000000000005',
   NOW() + INTERVAL '2 days',
   NOW() + INTERVAL '3 days',
   'upcoming',
   'Client site visit in Pune'),

  -- Upcoming: Sneha booked the projector
  ('b0000001-0000-0000-0000-000000000002',
   'a0000001-0000-0000-0000-000000000013',
   'e0000001-0000-0000-0000-000000000004',
   NOW() + INTERVAL '5 days',
   NOW() + INTERVAL '5 days' + INTERVAL '3 hours',
   'upcoming',
   'Quarterly review presentation'),

  -- Upcoming: Neha booked the printer
  ('b0000001-0000-0000-0000-000000000003',
   'a0000001-0000-0000-0000-000000000011',
   'e0000001-0000-0000-0000-000000000006',
   NOW() + INTERVAL '1 day',
   NOW() + INTERVAL '1 day' + INTERVAL '2 hours',
   'upcoming',
   'Bulk printing for onboarding kits');

-- ================================
-- MAINTENANCE REQUESTS
-- ================================

INSERT INTO maintenance_requests (id, asset_id, raised_by, issue_description, priority, status)
VALUES
  -- Pending: HP Spectre has overheating issue
  ('ad000001-0000-0000-0000-000000000001',
   'a0000001-0000-0000-0000-000000000004',
   'e0000001-0000-0000-0000-000000000005',
   'Laptop overheats during heavy workloads. Fan makes loud noise.',
   'High',
   'pending'),

  -- Approved: Standing desk motor malfunction
  ('ad000001-0000-0000-0000-000000000002',
   'a0000001-0000-0000-0000-000000000008',
   'e0000001-0000-0000-0000-000000000006',
   'Motorised height adjustment stuck. Cannot lower the desk.',
   'Medium',
   'approved');

UPDATE maintenance_requests
SET approved_by = 'e0000001-0000-0000-0000-000000000001',
    technician = 'Office Maintenance Co.'
WHERE id = 'ad000001-0000-0000-0000-000000000002';

-- ================================
-- NOTIFICATIONS
-- ================================

INSERT INTO notifications (id, employee_id, type, message, related_entity_type, related_entity_id, read, created_at)
VALUES
  ('90000001-0000-0000-0000-000000000001',
   'e0000001-0000-0000-0000-000000000002',
   'allocation',
   'Dell XPS 15 has been allocated to you.',
   'asset',
   'a0000001-0000-0000-0000-000000000002',
   true,
   NOW() - INTERVAL '30 days'),

  ('90000001-0000-0000-0000-000000000002',
   'e0000001-0000-0000-0000-000000000007',
   'transfer',
   'Priya Patel has requested to transfer Dell XPS 15 to you.',
   'transfer',
   'ed000001-0000-0000-0000-000000000001',
   false,
   NOW() - INTERVAL '2 days'),

  ('90000001-0000-0000-0000-000000000003',
   'e0000001-0000-0000-0000-000000000005',
   'maintenance',
   'Your maintenance request for HP Spectre x360 is pending review.',
   'maintenance',
   'ad000001-0000-0000-0000-000000000001',
   false,
   NOW() - INTERVAL '1 day'),

  ('90000001-0000-0000-0000-000000000004',
   'e0000001-0000-0000-0000-000000000001',
   'system',
   'Welcome to AssetFlow! You are the system administrator.',
   NULL, NULL,
   true,
   NOW() - INTERVAL '60 days');

-- ================================
-- AUDIT LOGS
-- ================================

INSERT INTO audit_logs (id, employee_id, action, entity_type, entity_id, details, created_at)
VALUES
  ('f0000001-0000-0000-0000-000000000001',
   'e0000001-0000-0000-0000-000000000001',
   'Created Asset',
   'asset',
   'a0000001-0000-0000-0000-000000000001',
   '{"assetTag": "AST-001", "name": "MacBook Pro 16\""}',
   NOW() - INTERVAL '45 days'),

  ('f0000001-0000-0000-0000-000000000002',
   'e0000001-0000-0000-0000-000000000001',
   'Allocated Asset',
   'asset',
   'a0000001-0000-0000-0000-000000000002',
   '{"allocatedTo": "e0000001-0000-0000-0000-000000000002"}',
   NOW() - INTERVAL '30 days'),

  ('f0000001-0000-0000-0000-000000000003',
   'e0000001-0000-0000-0000-000000000002',
   'User Logged In',
   'employee',
   'e0000001-0000-0000-0000-000000000002',
   '{}',
   NOW() - INTERVAL '5 days'),

  ('f0000001-0000-0000-0000-000000000004',
   'e0000001-0000-0000-0000-000000000005',
   'Maintenance Requested',
   'maintenance',
   'ad000001-0000-0000-0000-000000000001',
   '{"assetId": "a0000001-0000-0000-0000-000000000004", "priority": "High"}',
   NOW() - INTERVAL '3 days'),

  ('f0000001-0000-0000-0000-000000000005',
   'e0000001-0000-0000-0000-000000000001',
   'Maintenance Approved',
   'maintenance',
   'ad000001-0000-0000-0000-000000000002',
   '{"technician": "Office Maintenance Co."}',
   NOW() - INTERVAL '2 days');
