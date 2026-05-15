import { v4 as uuidv4 } from "uuid";
import pool from "../config/database.js";
import { asyncHandler } from "../middleware/errorHandler.js";
import { logActivity } from "../utils/activityLogger.js";

const generateOrderNumber = () => {
  const date = new Date();
  const stamp = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, "0")}${String(date.getDate()).padStart(2, "0")}`;
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `ORD-${stamp}-${rand}`;
};

/**
 * POST /api/orders - Create new order
 * Body: { customer_name, customer_phone, order_type, items: [{menu_item_id, quantity, notes}], table_id?, delivery_address?, notes? }
 */
export const createOrder = asyncHandler(async (req, res) => {
  const {
    customer_name,
    customer_phone,
    customer_email,
    order_type = "takeaway",
    items = [],
    table_id,
    delivery_address,
    notes,
  } = req.body;

  if (!items.length) {
    return res.status(400).json({
      success: false,
      message: "Order must contain at least one item",
    });
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // Fetch menu item prices
    const ids = items.map((i) => i.menu_item_id);
    const [menuRows] = await conn.query(
      `SELECT id, name, price FROM menu_items WHERE id IN (?) AND is_available = TRUE`,
      [ids],
    );

    if (menuRows.length !== ids.length) {
      await conn.rollback();
      return res
        .status(400)
        .json({ success: false, message: "One or more items are unavailable" });
    }

    const priceMap = Object.fromEntries(menuRows.map((m) => [m.id, m]));
    let subtotal = 0;
    const orderItems = items.map((it) => {
      const m = priceMap[it.menu_item_id];
      const qty = it.quantity || 1;
      const lineTotal = parseFloat(m.price) * qty;
      subtotal += lineTotal;
      return {
        menu_item_id: m.id,
        quantity: qty,
        unit_price: m.price,
        subtotal: lineTotal,
        notes: it.notes || null,
      };
    });

    const tax = 0;
    const delivery_fee = order_type === "delivery" ? 5000 : 0;
    const total = subtotal + tax + delivery_fee;

    const order_number = generateOrderNumber();
    const uuid = uuidv4();

    const [result] = await conn.query(
      `INSERT INTO orders (order_number, uuid, customer_id, customer_name, customer_phone, customer_email,
        delivery_address, table_id, order_type, subtotal, tax, delivery_fee, total, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        order_number,
        uuid,
        req.user?.id || null,
        customer_name,
        customer_phone,
        customer_email || null,
        delivery_address || null,
        table_id || null,
        order_type,
        subtotal,
        tax,
        delivery_fee,
        total,
        notes || null,
      ],
    );

    const orderId = result.insertId;

    for (const it of orderItems) {
      await conn.query(
        `INSERT INTO order_items (order_id, menu_item_id, quantity, unit_price, subtotal, notes)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          orderId,
          it.menu_item_id,
          it.quantity,
          it.unit_price,
          it.subtotal,
          it.notes,
        ],
      );
    }

    await conn.commit();

    logActivity({
      req,
      action: "order.create",
      entityType: "order",
      entityId: orderId,
      description: `Order ${order_number} created (${order_type})`,
      metadata: { total, items: items.length },
    });

    res.status(201).json({
      success: true,
      message: "Order placed successfully",
      data: { id: orderId, order_number, uuid, total, status: "pending" },
    });
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
});

/**
 * GET /api/orders - List orders (with filters)
 */
export const listOrders = asyncHandler(async (req, res) => {
  const { status, order_type, date, customer_id, include } = req.query;
  let sql = `SELECT o.*,
    t.table_number,
    (SELECT COUNT(*) FROM order_items WHERE order_id = o.id) AS item_count
    FROM orders o
    LEFT JOIN restaurant_tables t ON t.id = o.table_id
    WHERE 1=1`;
  const params = [];

  // Customers can only see their own orders
  if (req.user?.role === "customer") {
    sql += " AND o.customer_id = ?";
    params.push(req.user.id);
  } else if (customer_id) {
    sql += " AND o.customer_id = ?";
    params.push(customer_id);
  }

  if (status) {
    sql += " AND o.status = ?";
    params.push(status);
  }
  if (order_type) {
    sql += " AND o.order_type = ?";
    params.push(order_type);
  }
  if (date) {
    sql += " AND DATE(o.created_at) = ?";
    params.push(date);
  }

  sql += " ORDER BY o.created_at DESC LIMIT 200";

  const [rows] = await pool.query(sql, params);

  if (include === "items" && rows.length) {
    const ids = rows.map((r) => r.id);
    const [items] = await pool.query(
      `SELECT oi.*, m.name AS menu_item_name, m.image
       FROM order_items oi
       JOIN menu_items m ON m.id = oi.menu_item_id
       WHERE oi.order_id IN (?)`,
      [ids],
    );
    const byOrder = {};
    for (const it of items) {
      (byOrder[it.order_id] = byOrder[it.order_id] || []).push(it);
    }
    for (const r of rows) {
      r.items = byOrder[r.id] || [];
    }
  }

  res.json({ success: true, data: rows });
});

/**
 * GET /api/orders/:id - Get order with items
 */
export const getOrder = asyncHandler(async (req, res) => {
  const [orders] = await pool.query(
    "SELECT * FROM orders WHERE id = ? OR uuid = ?",
    [req.params.id, req.params.id],
  );
  if (orders.length === 0) {
    return res.status(404).json({ success: false, message: "Order not found" });
  }
  const order = orders[0];

  // Customer authorization
  if (req.user?.role === "customer" && order.customer_id !== req.user.id) {
    return res.status(403).json({ success: false, message: "Access denied" });
  }

  const [items] = await pool.query(
    `SELECT oi.*, m.name AS item_name, m.image FROM order_items oi
     JOIN menu_items m ON oi.menu_item_id = m.id WHERE oi.order_id = ?`,
    [order.id],
  );

  res.json({ success: true, data: { ...order, items } });
});

/**
 * PATCH /api/orders/:id/status - Update order status
 */
export const updateStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const valid = [
    "pending",
    "confirmed",
    "preparing",
    "ready",
    "served",
    "delivered",
    "completed",
    "cancelled",
  ];
  if (!valid.includes(status)) {
    return res.status(400).json({ success: false, message: "Invalid status" });
  }

  const completedAt = ["completed", "delivered"].includes(status)
    ? new Date()
    : null;
  await pool.query(
    `UPDATE orders SET status = ?, completed_at = COALESCE(?, completed_at) WHERE id = ?`,
    [status, completedAt, req.params.id],
  );

  res.json({ success: true, message: `Order status updated to ${status}` });
});

/**
 * GET /api/orders/stats/today - Sales stats for today
 */
export const todayStats = asyncHandler(async (req, res) => {
  const [[stats]] = await pool.query(
    `SELECT
      COUNT(*) AS total_orders,
      COALESCE(SUM(total), 0) AS total_sales,
      COALESCE(SUM(CASE WHEN status = 'completed' THEN total ELSE 0 END), 0) AS completed_sales,
      COUNT(CASE WHEN status = 'pending' THEN 1 END) AS pending_orders,
      COUNT(CASE WHEN status = 'preparing' THEN 1 END) AS preparing_orders
     FROM orders WHERE DATE(created_at) = CURDATE()`,
  );
  res.json({ success: true, data: stats });
});
