import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import { validationResult } from "express-validator";
import pool from "../config/database.js";
import { asyncHandler } from "../middleware/errorHandler.js";
import { logActivity } from "../utils/activityLogger.js";

const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, uuid: user.uuid, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" },
  );
};

/**
 * POST /api/auth/register - Register new customer account
 */
export const register = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  const { full_name, email, phone, password } = req.body;

  // Check existing
  const [existing] = await pool.query("SELECT id FROM users WHERE email = ?", [
    email,
  ]);
  if (existing.length > 0) {
    return res
      .status(409)
      .json({ success: false, message: "Email already registered" });
  }

  const password_hash = await bcrypt.hash(password, 10);
  const uuid = uuidv4();

  const [result] = await pool.query(
    `INSERT INTO users (uuid, full_name, email, phone, password_hash, role) VALUES (?, ?, ?, ?, ?, 'customer')`,
    [uuid, full_name, email, phone, password_hash],
  );

  const user = {
    id: result.insertId,
    uuid,
    full_name,
    email,
    phone,
    role: "customer",
  };
  const token = generateToken(user);

  res
    .status(201)
    .json({ success: true, message: "Account created", data: { user, token } });
});

/**
 * POST /api/auth/login - Login with email + password
 */
export const login = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  const { email, password } = req.body;

  const [rows] = await pool.query(
    "SELECT id, uuid, full_name, email, phone, password_hash, role, is_active FROM users WHERE email = ?",
    [email],
  );

  if (rows.length === 0) {
    return res
      .status(401)
      .json({ success: false, message: "Invalid credentials" });
  }

  const user = rows[0];

  if (!user.is_active) {
    return res
      .status(403)
      .json({ success: false, message: "Account is disabled" });
  }

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) {
    return res
      .status(401)
      .json({ success: false, message: "Invalid credentials" });
  }

  await pool.query("UPDATE users SET last_login = NOW() WHERE id = ?", [
    user.id,
  ]);

  delete user.password_hash;
  const token = generateToken(user);

  logActivity({
    req: { ...req, user },
    action: "user.login",
    entityType: "user",
    entityId: user.id,
    description: `${user.email} logged in`,
  });

  res.json({
    success: true,
    message: "Login successful",
    data: { user, token },
  });
});

/**
 * GET /api/auth/me - Get current user profile
 */
export const getMe = asyncHandler(async (req, res) => {
  res.json({ success: true, data: { user: req.user } });
});

/**
 * PATCH /api/auth/profile - Update profile
 */
export const updateProfile = asyncHandler(async (req, res) => {
  const { full_name, phone } = req.body;
  await pool.query(
    "UPDATE users SET full_name = COALESCE(?, full_name), phone = COALESCE(?, phone) WHERE id = ?",
    [full_name, phone, req.user.id],
  );
  const [rows] = await pool.query(
    "SELECT id, uuid, full_name, email, phone, role FROM users WHERE id = ?",
    [req.user.id],
  );
  res.json({
    success: true,
    message: "Profile updated",
    data: { user: rows[0] },
  });
});

/**
 * POST /api/auth/change-password
 */
export const changePassword = asyncHandler(async (req, res) => {
  const { current_password, new_password } = req.body;

  if (!new_password || new_password.length < 6) {
    return res
      .status(400)
      .json({
        success: false,
        message: "Password must be at least 6 characters",
      });
  }

  const [rows] = await pool.query(
    "SELECT password_hash FROM users WHERE id = ?",
    [req.user.id],
  );
  const valid = await bcrypt.compare(current_password, rows[0].password_hash);
  if (!valid) {
    return res
      .status(401)
      .json({ success: false, message: "Current password incorrect" });
  }

  const hash = await bcrypt.hash(new_password, 10);
  await pool.query("UPDATE users SET password_hash = ? WHERE id = ?", [
    hash,
    req.user.id,
  ]);

  res.json({ success: true, message: "Password changed successfully" });
});
