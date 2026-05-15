import pool from "../config/database.js";
import { asyncHandler } from "../middleware/errorHandler.js";

/**
 * GET /api/shifts/current - Get the current open shift for the logged-in cashier
 */
export const getCurrentShift = asyncHandler(async (req, res) => {
  const [rows] = await pool.query(
    "SELECT * FROM shifts WHERE cashier_id = ? AND status = 'open' ORDER BY opened_at DESC LIMIT 1",
    [req.user.id],
  );
  res.json({ success: true, data: rows[0] || null });
});

/**
 * POST /api/shifts/open - Open a new shift
 * Body: { opening_cash, notes? }
 */
export const openShift = asyncHandler(async (req, res) => {
  const { opening_cash, notes } = req.body;
  if (opening_cash === undefined || opening_cash === null) {
    return res
      .status(400)
      .json({ success: false, message: "opening_cash is required" });
  }

  // Ensure user has no open shift
  const [open] = await pool.query(
    "SELECT id FROM shifts WHERE cashier_id = ? AND status = 'open' LIMIT 1",
    [req.user.id],
  );
  if (open.length) {
    return res.status(409).json({
      success: false,
      message: "You already have an open shift. Close it before opening another.",
    });
  }

  const [result] = await pool.query(
    "INSERT INTO shifts (cashier_id, opening_cash, notes) VALUES (?, ?, ?)",
    [req.user.id, opening_cash, notes || null],
  );
  res.status(201).json({ success: true, data: { id: result.insertId } });
});

/**
 * POST /api/shifts/:id/close - Close a shift
 * Body: { closing_cash, notes? }
 * Computes expected_cash from cash payments during the shift window.
 */
export const closeShift = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { closing_cash, notes } = req.body;
  if (closing_cash === undefined || closing_cash === null) {
    return res
      .status(400)
      .json({ success: false, message: "closing_cash is required" });
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [shifts] = await conn.query(
      "SELECT * FROM shifts WHERE id = ? FOR UPDATE",
      [id],
    );
    if (!shifts.length) {
      await conn.rollback();
      return res
        .status(404)
        .json({ success: false, message: "Shift not found" });
    }
    const shift = shifts[0];

    // Only the cashier or a manager/admin can close
    const isOwner = shift.cashier_id === req.user.id;
    const isManager = ["admin", "manager"].includes(req.user.role);
    if (!isOwner && !isManager) {
      await conn.rollback();
      return res
        .status(403)
        .json({ success: false, message: "Not allowed to close this shift" });
    }
    if (shift.status !== "open") {
      await conn.rollback();
      return res
        .status(400)
        .json({ success: false, message: "Shift is already closed" });
    }

    // Compute totals from payments processed by this cashier during the shift
    const [[paymentSums]] = await conn.query(
      `SELECT
         COALESCE(SUM(CASE WHEN payment_method = 'cash' THEN amount ELSE 0 END), 0) AS cash_total,
         COALESCE(SUM(amount), 0) AS total_sales,
         COUNT(DISTINCT order_id) AS total_orders
       FROM payments
       WHERE processed_by = ?
         AND status = 'success'
         AND created_at >= ?
         AND created_at <= NOW()`,
      [shift.cashier_id, shift.opened_at],
    );

    const cashSales = parseFloat(paymentSums.cash_total);
    const expected_cash = parseFloat(shift.opening_cash) + cashSales;
    const cash_difference = parseFloat(closing_cash) - expected_cash;

    await conn.query(
      `UPDATE shifts SET
         closing_cash = ?, expected_cash = ?, cash_difference = ?,
         total_sales = ?, total_orders = ?,
         status = 'closed', closed_at = NOW(),
         notes = COALESCE(CONCAT(IFNULL(notes,''), ?), notes)
       WHERE id = ?`,
      [
        closing_cash,
        expected_cash,
        cash_difference,
        paymentSums.total_sales,
        paymentSums.total_orders,
        notes ? `\n[CLOSE] ${notes}` : "",
        id,
      ],
    );

    await conn.commit();
    res.json({
      success: true,
      data: {
        id: Number(id),
        opening_cash: shift.opening_cash,
        closing_cash,
        expected_cash,
        cash_difference,
        cash_sales: cashSales,
        total_sales: paymentSums.total_sales,
        total_orders: paymentSums.total_orders,
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
 * GET /api/shifts - List shifts (manager+) or own shifts (cashier)
 * Query: ?cashier_id=&status=&date=
 */
export const listShifts = asyncHandler(async (req, res) => {
  const { cashier_id, status, date } = req.query;
  const clauses = [];
  const params = [];

  const isManager = ["admin", "manager"].includes(req.user.role);
  if (!isManager) {
    clauses.push("s.cashier_id = ?");
    params.push(req.user.id);
  } else if (cashier_id) {
    clauses.push("s.cashier_id = ?");
    params.push(cashier_id);
  }
  if (status) {
    clauses.push("s.status = ?");
    params.push(status);
  }
  if (date) {
    clauses.push("DATE(s.opened_at) = ?");
    params.push(date);
  }
  const where = clauses.length ? "WHERE " + clauses.join(" AND ") : "";
  const [rows] = await pool.query(
    `SELECT s.*, u.full_name AS cashier_name
     FROM shifts s
     JOIN users u ON u.id = s.cashier_id
     ${where}
     ORDER BY s.opened_at DESC
     LIMIT 200`,
    params,
  );
  res.json({ success: true, data: rows });
});
