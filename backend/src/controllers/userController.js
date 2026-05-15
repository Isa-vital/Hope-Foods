import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import pool from "../config/database.js";
import { asyncHandler } from "../middleware/errorHandler.js";

const SAFE_FIELDS =
  "id, uuid, full_name, email, phone, role, avatar, is_active, last_login, created_at";

const VALID_ROLES = [
  "admin",
  "manager",
  "waiter",
  "kitchen",
  "receptionist",
  "cashier",
  "customer",
];

/**
 * GET /api/users - List users (admin/manager only)
 * Query: ?role=&is_active=&q=
 */
export const listUsers = asyncHandler(async (req, res) => {
  const { role, is_active, q } = req.query;
  const clauses = [];
  const params = [];
  if (role) {
    clauses.push("role = ?");
    params.push(role);
  }
  if (is_active !== undefined && is_active !== "") {
    clauses.push("is_active = ?");
    params.push(is_active === "true" || is_active === "1" ? 1 : 0);
  }
  if (q) {
    clauses.push("(full_name LIKE ? OR email LIKE ? OR phone LIKE ?)");
    params.push(`%${q}%`, `%${q}%`, `%${q}%`);
  }
  const where = clauses.length ? "WHERE " + clauses.join(" AND ") : "";
  const [rows] = await pool.query(
    `SELECT ${SAFE_FIELDS} FROM users ${where} ORDER BY created_at DESC LIMIT 500`,
    params,
  );
  res.json({ success: true, data: rows });
});

/**
 * POST /api/users - Create staff/customer (admin only)
 * Body: { full_name, email, phone?, password, role }
 */
export const createUser = asyncHandler(async (req, res) => {
  const { full_name, email, phone, password, role } = req.body;
  if (!full_name || !email || !password || !role) {
    return res.status(400).json({
      success: false,
      message: "full_name, email, password and role are required",
    });
  }
  if (!VALID_ROLES.includes(role)) {
    return res.status(400).json({ success: false, message: "Invalid role" });
  }
  if (password.length < 6) {
    return res
      .status(400)
      .json({ success: false, message: "Password must be at least 6 characters" });
  }

  const [existing] = await pool.query("SELECT id FROM users WHERE email = ?", [
    email,
  ]);
  if (existing.length) {
    return res
      .status(409)
      .json({ success: false, message: "Email already registered" });
  }

  const password_hash = await bcrypt.hash(password, 10);
  const uuid = uuidv4();
  const [result] = await pool.query(
    `INSERT INTO users (uuid, full_name, email, phone, password_hash, role)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [uuid, full_name, email, phone || null, password_hash, role],
  );
  const [rows] = await pool.query(
    `SELECT ${SAFE_FIELDS} FROM users WHERE id = ?`,
    [result.insertId],
  );
  res.status(201).json({ success: true, data: rows[0] });
});

/**
 * PATCH /api/users/:id - Update user
 * Body: { full_name?, phone?, role?, is_active?, password? }
 */
export const updateUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { full_name, phone, role, is_active, password } = req.body;

  // Prevent admin self-demotion / self-deactivation lockout
  if (Number(id) === req.user.id) {
    if (role && role !== req.user.role) {
      return res.status(400).json({
        success: false,
        message: "You cannot change your own role.",
      });
    }
    if (is_active === false || is_active === 0) {
      return res
        .status(400)
        .json({ success: false, message: "You cannot deactivate yourself." });
    }
  }

  if (role && !VALID_ROLES.includes(role)) {
    return res.status(400).json({ success: false, message: "Invalid role" });
  }

  const fields = [];
  const params = [];
  if (full_name !== undefined) {
    fields.push("full_name = ?");
    params.push(full_name);
  }
  if (phone !== undefined) {
    fields.push("phone = ?");
    params.push(phone || null);
  }
  if (role !== undefined) {
    fields.push("role = ?");
    params.push(role);
  }
  if (is_active !== undefined) {
    fields.push("is_active = ?");
    params.push(is_active ? 1 : 0);
  }
  if (password) {
    if (password.length < 6) {
      return res
        .status(400)
        .json({ success: false, message: "Password must be at least 6 characters" });
    }
    fields.push("password_hash = ?");
    params.push(await bcrypt.hash(password, 10));
  }
  if (!fields.length) {
    return res
      .status(400)
      .json({ success: false, message: "No fields to update" });
  }
  params.push(id);
  await pool.query(`UPDATE users SET ${fields.join(", ")} WHERE id = ?`, params);
  const [rows] = await pool.query(
    `SELECT ${SAFE_FIELDS} FROM users WHERE id = ?`,
    [id],
  );
  res.json({ success: true, data: rows[0] });
});

/**
 * DELETE /api/users/:id - Soft delete (deactivate)
 */
export const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (Number(id) === req.user.id) {
    return res
      .status(400)
      .json({ success: false, message: "You cannot delete yourself." });
  }
  await pool.query("UPDATE users SET is_active = FALSE WHERE id = ?", [id]);
  res.json({ success: true, message: "User deactivated" });
});
