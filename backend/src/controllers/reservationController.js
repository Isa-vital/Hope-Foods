import { v4 as uuidv4 } from "uuid";
import pool from "../config/database.js";
import { asyncHandler } from "../middleware/errorHandler.js";

// GET /api/reservations  (staff)
export const listReservations = asyncHandler(async (req, res) => {
  const { date, status } = req.query;
  const where = [];
  const params = [];

  if (date) {
    where.push("r.reservation_date = ?");
    params.push(date);
  }
  if (status) {
    where.push("r.status = ?");
    params.push(status);
  }
  const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";

  const [rows] = await pool.query(
    `SELECT r.*, t.table_number, t.capacity AS table_capacity
     FROM reservations r
     LEFT JOIN restaurant_tables t ON t.id = r.table_id
     ${whereSql}
     ORDER BY r.reservation_date DESC, r.reservation_time DESC`,
    params,
  );

  res.json({ success: true, data: rows });
});

// GET /api/reservations/:id  (public — for confirmation)
export const getReservation = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const [rows] = await pool.query(
    `SELECT r.*, t.table_number
     FROM reservations r
     LEFT JOIN restaurant_tables t ON t.id = r.table_id
     WHERE r.id = ? OR r.uuid = ?
     LIMIT 1`,
    [id, id],
  );

  if (!rows.length) {
    return res
      .status(404)
      .json({ success: false, message: "Reservation not found" });
  }
  res.json({ success: true, data: rows[0] });
});

// POST /api/reservations  (public)
export const createReservation = asyncHandler(async (req, res) => {
  const {
    customer_name,
    customer_phone,
    customer_email,
    reservation_date,
    reservation_time,
    party_size,
    special_requests,
  } = req.body;

  if (
    !customer_name ||
    !customer_phone ||
    !reservation_date ||
    !reservation_time ||
    !party_size
  ) {
    return res.status(400).json({
      success: false,
      message:
        "customer_name, customer_phone, reservation_date, reservation_time, party_size are required",
    });
  }

  const uuid = uuidv4();
  const [result] = await pool.query(
    `INSERT INTO reservations
      (uuid, customer_name, customer_phone, customer_email,
       reservation_date, reservation_time, party_size, special_requests, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
    [
      uuid,
      customer_name,
      customer_phone,
      customer_email || null,
      reservation_date,
      reservation_time,
      party_size,
      special_requests || null,
    ],
  );

  const [rows] = await pool.query("SELECT * FROM reservations WHERE id = ?", [
    result.insertId,
  ]);

  res.status(201).json({ success: true, data: rows[0] });
});

// PATCH /api/reservations/:id/status (staff)
export const updateReservationStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status, table_id } = req.body;

  const allowed = [
    "pending",
    "confirmed",
    "seated",
    "completed",
    "cancelled",
    "no_show",
  ];
  if (!allowed.includes(status)) {
    return res.status(400).json({ success: false, message: "Invalid status" });
  }

  await pool.query(
    `UPDATE reservations
     SET status = ?, table_id = COALESCE(?, table_id)
     WHERE id = ?`,
    [status, table_id || null, id],
  );

  const [rows] = await pool.query("SELECT * FROM reservations WHERE id = ?", [
    id,
  ]);
  if (!rows.length) {
    return res
      .status(404)
      .json({ success: false, message: "Reservation not found" });
  }

  res.json({ success: true, data: rows[0] });
});

// ============== TABLES ==============

// GET /api/tables  (public — used by reservation UI)
export const listTables = asyncHandler(async (req, res) => {
  const [rows] = await pool.query(
    `SELECT * FROM restaurant_tables WHERE is_active = TRUE ORDER BY table_number`,
  );
  res.json({ success: true, data: rows });
});

// POST /api/tables  (admin/manager)
export const createTable = asyncHandler(async (req, res) => {
  const { table_number, capacity, location } = req.body;
  if (!table_number || !capacity) {
    return res
      .status(400)
      .json({ success: false, message: "table_number and capacity required" });
  }

  const [result] = await pool.query(
    `INSERT INTO restaurant_tables (table_number, capacity, location)
     VALUES (?, ?, ?)`,
    [table_number, capacity, location || null],
  );

  const [rows] = await pool.query(
    "SELECT * FROM restaurant_tables WHERE id = ?",
    [result.insertId],
  );
  res.status(201).json({ success: true, data: rows[0] });
});

// PATCH /api/tables/:id  (admin/manager)
export const updateTable = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const fields = [
    "table_number",
    "capacity",
    "location",
    "status",
    "is_active",
  ];
  const updates = [];
  const params = [];

  for (const f of fields) {
    if (req.body[f] !== undefined) {
      updates.push(`${f} = ?`);
      params.push(req.body[f]);
    }
  }
  if (!updates.length) {
    return res
      .status(400)
      .json({ success: false, message: "No fields to update" });
  }
  params.push(id);

  await pool.query(
    `UPDATE restaurant_tables SET ${updates.join(", ")} WHERE id = ?`,
    params,
  );

  const [rows] = await pool.query(
    "SELECT * FROM restaurant_tables WHERE id = ?",
    [id],
  );
  res.json({ success: true, data: rows[0] });
});

// DELETE /api/tables/:id  (admin)
export const deleteTable = asyncHandler(async (req, res) => {
  const { id } = req.params;
  await pool.query(
    "UPDATE restaurant_tables SET is_active = FALSE WHERE id = ?",
    [id],
  );
  res.json({ success: true, message: "Table disabled" });
});
