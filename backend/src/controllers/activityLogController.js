import pool from "../config/database.js";
import { asyncHandler } from "../middleware/errorHandler.js";

/**
 * GET /api/activity-logs - List activity logs (admin/manager only)
 * Query: ?user_id=&entity_type=&action=&from=&to=&limit=200
 */
export const listActivityLogs = asyncHandler(async (req, res) => {
  const { user_id, entity_type, action, from, to, limit = 200 } = req.query;
  const clauses = [];
  const params = [];
  if (user_id) {
    clauses.push("a.user_id = ?");
    params.push(user_id);
  }
  if (entity_type) {
    clauses.push("a.entity_type = ?");
    params.push(entity_type);
  }
  if (action) {
    clauses.push("a.action LIKE ?");
    params.push(`%${action}%`);
  }
  if (from) {
    clauses.push("DATE(a.created_at) >= ?");
    params.push(from);
  }
  if (to) {
    clauses.push("DATE(a.created_at) <= ?");
    params.push(to);
  }
  const where = clauses.length ? "WHERE " + clauses.join(" AND ") : "";
  const [rows] = await pool.query(
    `SELECT a.*, u.full_name AS user_name, u.email AS user_email, u.role AS user_role
     FROM activity_logs a
     LEFT JOIN users u ON u.id = a.user_id
     ${where}
     ORDER BY a.created_at DESC
     LIMIT ?`,
    [...params, Number(limit)],
  );
  res.json({ success: true, data: rows });
});
