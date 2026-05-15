import pool from "../config/database.js";
import { asyncHandler } from "../middleware/errorHandler.js";

/**
 * GET /api/rooms/types - List all room types
 */
export const listRoomTypes = asyncHandler(async (req, res) => {
  const [rows] = await pool.query(
    "SELECT * FROM room_types ORDER BY base_price ASC",
  );
  res.json({ success: true, data: rows });
});

/**
 * POST /api/rooms/types - Create a room type (admin/manager)
 */
export const createRoomType = asyncHandler(async (req, res) => {
  const { name, description, base_price, capacity, amenities } = req.body;
  if (!name || !base_price || !capacity) {
    return res.status(400).json({
      success: false,
      message: "name, base_price, and capacity are required",
    });
  }
  const [result] = await pool.query(
    "INSERT INTO room_types (name, description, base_price, capacity, amenities) VALUES (?, ?, ?, ?, ?)",
    [
      name,
      description || null,
      base_price,
      capacity,
      amenities ? JSON.stringify(amenities) : null,
    ],
  );
  res.status(201).json({ success: true, data: { id: result.insertId } });
});

/**
 * PATCH /api/rooms/types/:id
 */
export const updateRoomType = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const allowed = ["name", "description", "base_price", "capacity", "amenities"];
  const fields = [];
  const values = [];
  for (const k of allowed) {
    if (req.body[k] !== undefined) {
      fields.push(`${k} = ?`);
      values.push(k === "amenities" ? JSON.stringify(req.body[k]) : req.body[k]);
    }
  }
  if (!fields.length) {
    return res
      .status(400)
      .json({ success: false, message: "No fields to update" });
  }
  values.push(id);
  await pool.query(
    `UPDATE room_types SET ${fields.join(", ")} WHERE id = ?`,
    values,
  );
  res.json({ success: true });
});

/**
 * GET /api/rooms - List all rooms with their type info
 * Query: ?status=available
 */
export const listRooms = asyncHandler(async (req, res) => {
  const { status } = req.query;
  let sql = `SELECT r.*, rt.name AS room_type_name, rt.base_price, rt.capacity, rt.description AS type_description, rt.amenities
             FROM rooms r
             JOIN room_types rt ON rt.id = r.room_type_id
             WHERE r.is_active = TRUE`;
  const params = [];
  if (status) {
    sql += " AND r.status = ?";
    params.push(status);
  }
  sql += " ORDER BY r.room_number ASC";
  const [rows] = await pool.query(sql, params);
  res.json({ success: true, data: rows });
});

/**
 * POST /api/rooms - Create room
 */
export const createRoom = asyncHandler(async (req, res) => {
  const { room_number, room_type_id, floor, status } = req.body;
  if (!room_number || !room_type_id) {
    return res.status(400).json({
      success: false,
      message: "room_number and room_type_id are required",
    });
  }
  const [result] = await pool.query(
    "INSERT INTO rooms (room_number, room_type_id, floor, status) VALUES (?, ?, ?, ?)",
    [room_number, room_type_id, floor || null, status || "available"],
  );
  res.status(201).json({ success: true, data: { id: result.insertId } });
});

/**
 * PATCH /api/rooms/:id
 */
export const updateRoom = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const allowed = ["room_number", "room_type_id", "floor", "status", "is_active"];
  const fields = [];
  const values = [];
  for (const k of allowed) {
    if (req.body[k] !== undefined) {
      fields.push(`${k} = ?`);
      values.push(req.body[k]);
    }
  }
  if (!fields.length) {
    return res
      .status(400)
      .json({ success: false, message: "No fields to update" });
  }
  values.push(id);
  await pool.query(`UPDATE rooms SET ${fields.join(", ")} WHERE id = ?`, values);
  res.json({ success: true });
});

/**
 * DELETE /api/rooms/:id - Soft delete
 */
export const deleteRoom = asyncHandler(async (req, res) => {
  const { id } = req.params;
  await pool.query("UPDATE rooms SET is_active = FALSE WHERE id = ?", [id]);
  res.json({ success: true });
});

/**
 * GET /api/rooms/availability?check_in=YYYY-MM-DD&check_out=YYYY-MM-DD
 * Returns rooms available between dates (no overlapping confirmed/checked_in bookings).
 */
export const checkAvailability = asyncHandler(async (req, res) => {
  const { check_in, check_out } = req.query;
  if (!check_in || !check_out) {
    return res.status(400).json({
      success: false,
      message: "check_in and check_out dates required (YYYY-MM-DD)",
    });
  }
  if (new Date(check_out) <= new Date(check_in)) {
    return res.status(400).json({
      success: false,
      message: "check_out must be after check_in",
    });
  }

  // A room is unavailable if it has a booking that overlaps the requested range
  // Overlap: existing.check_in < requested.check_out AND existing.check_out > requested.check_in
  const [rows] = await pool.query(
    `SELECT r.*, rt.name AS room_type_name, rt.base_price, rt.capacity,
            rt.description AS type_description, rt.amenities
     FROM rooms r
     JOIN room_types rt ON rt.id = r.room_type_id
     WHERE r.is_active = TRUE
       AND r.status NOT IN ('maintenance')
       AND r.id NOT IN (
         SELECT b.room_id FROM bookings b
         WHERE b.status IN ('confirmed', 'checked_in', 'pending')
           AND b.check_in_date < ?
           AND b.check_out_date > ?
       )
     ORDER BY rt.base_price ASC, r.room_number ASC`,
    [check_out, check_in],
  );
  res.json({ success: true, data: rows });
});
