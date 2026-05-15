import pool from "../config/database.js";

/**
 * Log an activity. Failures are swallowed (never block the parent request).
 *
 * @param {object} opts
 * @param {object} opts.req - Express request (for user, ip, userAgent)
 * @param {string} opts.action - e.g. 'order.create', 'user.login'
 * @param {string} [opts.entityType] - e.g. 'order'
 * @param {number} [opts.entityId]
 * @param {string} [opts.description]
 * @param {object} [opts.metadata]
 */
export async function logActivity({
  req,
  action,
  entityType,
  entityId,
  description,
  metadata,
}) {
  try {
    const userId = req?.user?.id || null;
    const ip = (req?.ip || req?.headers?.["x-forwarded-for"] || "").toString().slice(0, 45);
    const ua = (req?.headers?.["user-agent"] || "").toString().slice(0, 255);
    await pool.query(
      `INSERT INTO activity_logs
        (user_id, action, entity_type, entity_id, description, ip_address, user_agent, metadata)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        action,
        entityType || null,
        entityId || null,
        description || null,
        ip || null,
        ua || null,
        metadata ? JSON.stringify(metadata) : null,
      ],
    );
  } catch (err) {
    // Never break the request because of logging
    console.warn("activity log failed:", err.message);
  }
}
