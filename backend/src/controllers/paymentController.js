import { v4 as uuidv4 } from "uuid";
import pool from "../config/database.js";
import { asyncHandler } from "../middleware/errorHandler.js";

/**
 * POST /api/payments - Record a payment against an order
 * Body: { order_id, amount, payment_method, reference_number?, transaction_id? }
 */
export const recordPayment = asyncHandler(async (req, res) => {
  const {
    order_id,
    amount,
    payment_method,
    reference_number,
    transaction_id,
  } = req.body;

  if (!order_id || !amount || !payment_method) {
    return res.status(400).json({
      success: false,
      message: "order_id, amount, and payment_method are required",
    });
  }

  const validMethods = ["cash", "mobile_money", "card", "bank_transfer"];
  if (!validMethods.includes(payment_method)) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid payment method" });
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [orders] = await conn.query(
      "SELECT id, total FROM orders WHERE id = ?",
      [order_id],
    );
    if (!orders.length) {
      await conn.rollback();
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    const uuid = uuidv4();
    const [result] = await conn.query(
      `INSERT INTO payments
        (uuid, order_id, amount, payment_method, reference_number, transaction_id, status, processed_by)
       VALUES (?, ?, ?, ?, ?, ?, 'success', ?)`,
      [
        uuid,
        order_id,
        amount,
        payment_method,
        reference_number || null,
        transaction_id || null,
        req.user?.id || null,
      ],
    );

    // Sum payments for this order
    const [[{ paid }]] = await conn.query(
      "SELECT COALESCE(SUM(amount), 0) AS paid FROM payments WHERE order_id = ? AND status = 'success'",
      [order_id],
    );

    const total = parseFloat(orders[0].total);
    const paidAmount = parseFloat(paid);
    let payment_status = "pending";
    if (paidAmount >= total) payment_status = "paid";
    else if (paidAmount > 0) payment_status = "partial";

    await conn.query(
      "UPDATE orders SET payment_method = ?, payment_status = ? WHERE id = ?",
      [payment_method, payment_status, order_id],
    );

    await conn.commit();

    res.status(201).json({
      success: true,
      data: {
        id: result.insertId,
        uuid,
        order_id,
        amount,
        payment_method,
        payment_status,
        paid_so_far: paidAmount,
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
 * GET /api/payments?order_id=... - List payments for an order
 */
export const listPayments = asyncHandler(async (req, res) => {
  const { order_id } = req.query;
  let sql = `SELECT p.*, u.full_name AS processed_by_name
             FROM payments p
             LEFT JOIN users u ON u.id = p.processed_by`;
  const params = [];
  if (order_id) {
    sql += " WHERE p.order_id = ?";
    params.push(order_id);
  }
  sql += " ORDER BY p.created_at DESC LIMIT 200";

  const [rows] = await pool.query(sql, params);
  res.json({ success: true, data: rows });
});
