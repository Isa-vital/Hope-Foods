import pool from "../config/database.js";
import { asyncHandler } from "../middleware/errorHandler.js";

/**
 * GET /api/reports/sales?from=YYYY-MM-DD&to=YYYY-MM-DD
 * Aggregates per-day sales (count + revenue) for completed orders.
 */
export const salesReport = asyncHandler(async (req, res) => {
  const { from, to } = req.query;
  if (!from || !to) {
    return res
      .status(400)
      .json({ success: false, message: "from and to dates required" });
  }
  const [rows] = await pool.query(
    `SELECT DATE(created_at) AS date,
            COUNT(*) AS orders,
            COALESCE(SUM(total), 0) AS revenue,
            COALESCE(AVG(total), 0) AS avg_order
     FROM orders
     WHERE status NOT IN ('cancelled')
       AND DATE(created_at) BETWEEN ? AND ?
     GROUP BY DATE(created_at)
     ORDER BY DATE(created_at) ASC`,
    [from, to],
  );
  const [[totals]] = await pool.query(
    `SELECT COUNT(*) AS orders, COALESCE(SUM(total), 0) AS revenue
     FROM orders
     WHERE status NOT IN ('cancelled')
       AND DATE(created_at) BETWEEN ? AND ?`,
    [from, to],
  );
  res.json({ success: true, data: { breakdown: rows, totals } });
});

/**
 * GET /api/reports/top-items?from=...&to=...&limit=10
 */
export const topItemsReport = asyncHandler(async (req, res) => {
  const { from, to, limit = 10 } = req.query;
  if (!from || !to) {
    return res
      .status(400)
      .json({ success: false, message: "from and to dates required" });
  }
  const [rows] = await pool.query(
    `SELECT mi.id, mi.name, mi.category_id, mc.name AS category,
            SUM(oi.quantity) AS qty_sold,
            SUM(oi.quantity * oi.price) AS revenue
     FROM order_items oi
     JOIN orders o ON o.id = oi.order_id
     JOIN menu_items mi ON mi.id = oi.menu_item_id
     LEFT JOIN menu_categories mc ON mc.id = mi.category_id
     WHERE o.status NOT IN ('cancelled')
       AND DATE(o.created_at) BETWEEN ? AND ?
     GROUP BY mi.id, mi.name, mi.category_id, mc.name
     ORDER BY qty_sold DESC
     LIMIT ?`,
    [from, to, Number(limit)],
  );
  res.json({ success: true, data: rows });
});

/**
 * GET /api/reports/payment-methods?from=...&to=...
 */
export const paymentMethodsReport = asyncHandler(async (req, res) => {
  const { from, to } = req.query;
  if (!from || !to) {
    return res
      .status(400)
      .json({ success: false, message: "from and to dates required" });
  }
  const [rows] = await pool.query(
    `SELECT payment_method, COUNT(*) AS count, COALESCE(SUM(amount), 0) AS total
     FROM payments
     WHERE status = 'success'
       AND DATE(created_at) BETWEEN ? AND ?
     GROUP BY payment_method
     ORDER BY total DESC`,
    [from, to],
  );
  res.json({ success: true, data: rows });
});

/**
 * GET /api/reports/occupancy?from=...&to=...
 * Returns total nights booked vs available room-nights.
 */
export const occupancyReport = asyncHandler(async (req, res) => {
  const { from, to } = req.query;
  if (!from || !to) {
    return res
      .status(400)
      .json({ success: false, message: "from and to dates required" });
  }
  // Booked nights: sum across confirmed/checked_in/checked_out bookings,
  // counting only nights that fall in the range.
  const [[booked]] = await pool.query(
    `SELECT
       COALESCE(SUM(
         GREATEST(0,
           DATEDIFF(
             LEAST(check_out_date, DATE_ADD(?, INTERVAL 1 DAY)),
             GREATEST(check_in_date, ?)
           )
         )
       ), 0) AS booked_nights,
       COUNT(*) AS booking_count
     FROM bookings
     WHERE status IN ('confirmed', 'checked_in', 'checked_out')
       AND check_in_date <= ?
       AND check_out_date > ?`,
    [to, from, to, from],
  );
  const [[{ room_count }]] = await pool.query(
    "SELECT COUNT(*) AS room_count FROM rooms WHERE is_active = TRUE",
  );
  const days =
    Math.round((new Date(to) - new Date(from)) / (1000 * 60 * 60 * 24)) + 1;
  const available = (room_count || 0) * days;
  const occupancy_rate = available
    ? (Number(booked.booked_nights) / available) * 100
    : 0;
  res.json({
    success: true,
    data: {
      booked_nights: Number(booked.booked_nights),
      booking_count: booked.booking_count,
      room_count,
      total_room_nights: available,
      days,
      occupancy_rate: Math.round(occupancy_rate * 10) / 10,
    },
  });
});

/**
 * GET /api/reports/dashboard
 * Combined overview: today + week + month totals + low stock count.
 */
export const dashboardReport = asyncHandler(async (req, res) => {
  const [[today]] = await pool.query(
    `SELECT COUNT(*) AS orders, COALESCE(SUM(total), 0) AS revenue
     FROM orders
     WHERE status NOT IN ('cancelled') AND DATE(created_at) = CURDATE()`,
  );
  const [[week]] = await pool.query(
    `SELECT COUNT(*) AS orders, COALESCE(SUM(total), 0) AS revenue
     FROM orders
     WHERE status NOT IN ('cancelled')
       AND created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)`,
  );
  const [[month]] = await pool.query(
    `SELECT COUNT(*) AS orders, COALESCE(SUM(total), 0) AS revenue
     FROM orders
     WHERE status NOT IN ('cancelled')
       AND created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)`,
  );
  const [[{ low_stock_count }]] = await pool.query(
    `SELECT COUNT(*) AS low_stock_count
     FROM inventory_items WHERE current_stock <= minimum_stock`,
  );
  const [[{ active_bookings }]] = await pool.query(
    `SELECT COUNT(*) AS active_bookings FROM bookings
     WHERE status IN ('confirmed', 'checked_in')`,
  );
  res.json({
    success: true,
    data: { today, week, month, low_stock_count, active_bookings },
  });
});
