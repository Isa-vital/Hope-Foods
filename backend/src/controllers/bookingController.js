import { v4 as uuidv4 } from "uuid";
import pool from "../config/database.js";
import { asyncHandler } from "../middleware/errorHandler.js";

const TAX_RATE = 0.0; // No VAT for now; adjust if needed

function nightsBetween(checkIn, checkOut) {
  const ms = new Date(checkOut).getTime() - new Date(checkIn).getTime();
  return Math.max(1, Math.round(ms / (1000 * 60 * 60 * 24)));
}

async function generateBookingNumber(conn) {
  const today = new Date();
  const ymd = today.toISOString().slice(0, 10).replace(/-/g, "");
  const [[{ count }]] = await conn.query(
    "SELECT COUNT(*) AS count FROM bookings WHERE DATE(created_at) = CURDATE()",
  );
  return `BK${ymd}${String(count + 1).padStart(4, "0")}`;
}

/**
 * POST /api/bookings - Create a booking (public)
 * Body: { guest_name, guest_phone, guest_email?, guest_id_number?, room_id,
 *         check_in_date, check_out_date, num_guests?, notes? }
 */
export const createBooking = asyncHandler(async (req, res) => {
  const {
    guest_name,
    guest_phone,
    guest_email,
    guest_id_number,
    room_id,
    check_in_date,
    check_out_date,
    num_guests = 1,
    notes,
  } = req.body;

  if (!guest_name || !guest_phone || !room_id || !check_in_date || !check_out_date) {
    return res.status(400).json({
      success: false,
      message:
        "guest_name, guest_phone, room_id, check_in_date and check_out_date are required",
    });
  }
  if (new Date(check_out_date) <= new Date(check_in_date)) {
    return res.status(400).json({
      success: false,
      message: "check_out_date must be after check_in_date",
    });
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // Fetch room + rate
    const [rooms] = await conn.query(
      `SELECT r.id, r.is_active, rt.base_price, rt.capacity
       FROM rooms r JOIN room_types rt ON rt.id = r.room_type_id
       WHERE r.id = ? FOR UPDATE`,
      [room_id],
    );
    if (!rooms.length || !rooms[0].is_active) {
      await conn.rollback();
      return res
        .status(404)
        .json({ success: false, message: "Room not found" });
    }
    if (num_guests > rooms[0].capacity) {
      await conn.rollback();
      return res.status(400).json({
        success: false,
        message: `Room capacity is ${rooms[0].capacity}`,
      });
    }

    // Overlap check
    const [conflicts] = await conn.query(
      `SELECT id FROM bookings
       WHERE room_id = ?
         AND status IN ('confirmed','checked_in','pending')
         AND check_in_date < ?
         AND check_out_date > ?`,
      [room_id, check_out_date, check_in_date],
    );
    if (conflicts.length) {
      await conn.rollback();
      return res.status(409).json({
        success: false,
        message: "Room is not available for the selected dates",
      });
    }

    const num_nights = nightsBetween(check_in_date, check_out_date);
    const rate_per_night = parseFloat(rooms[0].base_price);
    const subtotal = rate_per_night * num_nights;
    const tax = subtotal * TAX_RATE;
    const total = subtotal + tax;

    const booking_number = await generateBookingNumber(conn);
    const uuid = uuidv4();

    const [result] = await conn.query(
      `INSERT INTO bookings
        (booking_number, uuid, guest_id, guest_name, guest_phone, guest_email, guest_id_number,
         room_id, check_in_date, check_out_date, num_guests, num_nights,
         rate_per_night, subtotal, tax, total, status, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?)`,
      [
        booking_number,
        uuid,
        req.user?.id || null,
        guest_name,
        guest_phone,
        guest_email || null,
        guest_id_number || null,
        room_id,
        check_in_date,
        check_out_date,
        num_guests,
        num_nights,
        rate_per_night,
        subtotal,
        tax,
        total,
        req.user?.id || null,
      ],
    );

    if (notes) {
      await conn.query("UPDATE bookings SET notes = ? WHERE id = ?", [
        notes,
        result.insertId,
      ]);
    }

    await conn.commit();

    res.status(201).json({
      success: true,
      data: {
        id: result.insertId,
        booking_number,
        uuid,
        num_nights,
        rate_per_night,
        subtotal,
        tax,
        total,
      },
    });
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
});

/**
 * GET /api/bookings/:id - Public lookup by id or booking_number
 */
export const getBooking = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const isNumeric = /^\d+$/.test(id);
  const [rows] = await pool.query(
    `SELECT b.*, r.room_number, r.floor, rt.name AS room_type_name
     FROM bookings b
     JOIN rooms r ON r.id = b.room_id
     JOIN room_types rt ON rt.id = r.room_type_id
     WHERE ${isNumeric ? "b.id" : "b.booking_number"} = ?`,
    [id],
  );
  if (!rows.length) {
    return res
      .status(404)
      .json({ success: false, message: "Booking not found" });
  }
  res.json({ success: true, data: rows[0] });
});

/**
 * GET /api/bookings - Staff list with filters
 */
export const listBookings = asyncHandler(async (req, res) => {
  const { status, date } = req.query;
  const clauses = [];
  const params = [];
  if (status) {
    clauses.push("b.status = ?");
    params.push(status);
  }
  if (date) {
    clauses.push("(? BETWEEN b.check_in_date AND b.check_out_date)");
    params.push(date);
  }
  const where = clauses.length ? "WHERE " + clauses.join(" AND ") : "";
  const [rows] = await pool.query(
    `SELECT b.*, r.room_number, rt.name AS room_type_name
     FROM bookings b
     JOIN rooms r ON r.id = b.room_id
     JOIN room_types rt ON rt.id = r.room_type_id
     ${where}
     ORDER BY b.created_at DESC
     LIMIT 200`,
    params,
  );
  res.json({ success: true, data: rows });
});

/**
 * PATCH /api/bookings/:id/status
 * Body: { status: 'confirmed'|'checked_in'|'checked_out'|'cancelled'|'no_show' }
 * Updates room.status accordingly.
 */
export const updateBookingStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const valid = [
    "pending",
    "confirmed",
    "checked_in",
    "checked_out",
    "cancelled",
    "no_show",
  ];
  if (!valid.includes(status)) {
    return res.status(400).json({ success: false, message: "Invalid status" });
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [rows] = await conn.query(
      "SELECT id, room_id, status FROM bookings WHERE id = ?",
      [id],
    );
    if (!rows.length) {
      await conn.rollback();
      return res
        .status(404)
        .json({ success: false, message: "Booking not found" });
    }
    const booking = rows[0];

    const extra = [];
    const extraVals = [];
    if (status === "checked_in") {
      extra.push("actual_check_in = NOW()");
    }
    if (status === "checked_out") {
      extra.push("actual_check_out = NOW()");
    }
    const setClause = ["status = ?", ...extra].join(", ");
    extraVals.unshift(status);
    extraVals.push(id);
    await conn.query(`UPDATE bookings SET ${setClause} WHERE id = ?`, extraVals);

    // Sync room status
    let roomStatus = null;
    if (status === "checked_in") roomStatus = "occupied";
    else if (status === "confirmed") roomStatus = "reserved";
    else if (status === "checked_out") roomStatus = "cleaning";
    else if (status === "cancelled" || status === "no_show")
      roomStatus = "available";
    if (roomStatus) {
      await conn.query("UPDATE rooms SET status = ? WHERE id = ?", [
        roomStatus,
        booking.room_id,
      ]);
    }

    await conn.commit();
    res.json({ success: true });
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
});

/**
 * GET /api/bookings/me - Bookings for the logged-in user (matched by guest_id or email)
 */
export const myBookings = asyncHandler(async (req, res) => {
  const [rows] = await pool.query(
    `SELECT b.*, r.room_number, rt.name AS room_type_name
     FROM bookings b
     JOIN rooms r ON r.id = b.room_id
     JOIN room_types rt ON rt.id = r.room_type_id
     WHERE b.guest_id = ? OR (b.guest_email IS NOT NULL AND b.guest_email = ?)
     ORDER BY b.check_in_date DESC
     LIMIT 100`,
    [req.user.id, req.user.email],
  );
  res.json({ success: true, data: rows });
});
