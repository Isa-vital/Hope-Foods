import pool from "../config/database.js";
import { asyncHandler } from "../middleware/errorHandler.js";

// ============ SUPPLIERS ============

export const listSuppliers = asyncHandler(async (req, res) => {
  const [rows] = await pool.query(
    "SELECT * FROM suppliers WHERE is_active = TRUE ORDER BY name ASC",
  );
  res.json({ success: true, data: rows });
});

export const createSupplier = asyncHandler(async (req, res) => {
  const { name, contact_person, phone, email, address } = req.body;
  if (!name) {
    return res
      .status(400)
      .json({ success: false, message: "name is required" });
  }
  const [result] = await pool.query(
    "INSERT INTO suppliers (name, contact_person, phone, email, address) VALUES (?, ?, ?, ?, ?)",
    [name, contact_person || null, phone || null, email || null, address || null],
  );
  res.status(201).json({ success: true, data: { id: result.insertId } });
});

export const updateSupplier = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const allowed = ["name", "contact_person", "phone", "email", "address", "is_active"];
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
  await pool.query(
    `UPDATE suppliers SET ${fields.join(", ")} WHERE id = ?`,
    values,
  );
  res.json({ success: true });
});

export const deleteSupplier = asyncHandler(async (req, res) => {
  const { id } = req.params;
  await pool.query("UPDATE suppliers SET is_active = FALSE WHERE id = ?", [id]);
  res.json({ success: true });
});

// ============ ITEMS ============

export const listItems = asyncHandler(async (req, res) => {
  const { low_stock, category } = req.query;
  let sql = `SELECT i.*, s.name AS supplier_name
             FROM inventory_items i
             LEFT JOIN suppliers s ON s.id = i.supplier_id`;
  const clauses = [];
  const params = [];
  if (low_stock === "true") {
    clauses.push("i.current_stock <= i.minimum_stock");
  }
  if (category) {
    clauses.push("i.category = ?");
    params.push(category);
  }
  if (clauses.length) sql += " WHERE " + clauses.join(" AND ");
  sql += " ORDER BY i.name ASC";
  const [rows] = await pool.query(sql, params);
  res.json({ success: true, data: rows });
});

export const createItem = asyncHandler(async (req, res) => {
  const {
    name,
    unit,
    current_stock = 0,
    minimum_stock = 0,
    unit_cost = 0,
    supplier_id,
    category,
  } = req.body;
  if (!name || !unit) {
    return res
      .status(400)
      .json({ success: false, message: "name and unit are required" });
  }
  const [result] = await pool.query(
    `INSERT INTO inventory_items
      (name, unit, current_stock, minimum_stock, unit_cost, supplier_id, category)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      name,
      unit,
      current_stock,
      minimum_stock,
      unit_cost,
      supplier_id || null,
      category || null,
    ],
  );
  res.status(201).json({ success: true, data: { id: result.insertId } });
});

export const updateItem = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const allowed = [
    "name",
    "unit",
    "minimum_stock",
    "unit_cost",
    "supplier_id",
    "category",
  ];
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
  await pool.query(
    `UPDATE inventory_items SET ${fields.join(", ")} WHERE id = ?`,
    values,
  );
  res.json({ success: true });
});

export const deleteItem = asyncHandler(async (req, res) => {
  const { id } = req.params;
  await pool.query("DELETE FROM inventory_items WHERE id = ?", [id]);
  res.json({ success: true });
});

// ============ TRANSACTIONS ============

/**
 * POST /api/inventory/transactions
 * Body: { inventory_item_id, transaction_type, quantity, unit_cost?, notes? }
 * Transaction types: 'purchase'(+), 'usage'(-), 'waste'(-), 'adjustment'(signed)
 */
export const recordTransaction = asyncHandler(async (req, res) => {
  const { inventory_item_id, transaction_type, quantity, unit_cost, notes } =
    req.body;
  const valid = ["purchase", "usage", "adjustment", "waste"];
  if (!inventory_item_id || !transaction_type || quantity === undefined) {
    return res.status(400).json({
      success: false,
      message: "inventory_item_id, transaction_type and quantity are required",
    });
  }
  if (!valid.includes(transaction_type)) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid transaction_type" });
  }

  const qty = Number(quantity);
  let delta = qty;
  if (transaction_type === "usage" || transaction_type === "waste") {
    delta = -Math.abs(qty);
  } else if (transaction_type === "purchase") {
    delta = Math.abs(qty);
  }
  // 'adjustment' keeps sign as-is

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [items] = await conn.query(
      "SELECT id, current_stock FROM inventory_items WHERE id = ? FOR UPDATE",
      [inventory_item_id],
    );
    if (!items.length) {
      await conn.rollback();
      return res
        .status(404)
        .json({ success: false, message: "Item not found" });
    }

    const newStock = Number(items[0].current_stock) + delta;
    if (newStock < 0) {
      await conn.rollback();
      return res.status(400).json({
        success: false,
        message: `Insufficient stock (current: ${items[0].current_stock})`,
      });
    }

    await conn.query(
      "UPDATE inventory_items SET current_stock = ? WHERE id = ?",
      [newStock, inventory_item_id],
    );

    // If purchase, optionally update unit_cost
    if (transaction_type === "purchase" && unit_cost) {
      await conn.query(
        "UPDATE inventory_items SET unit_cost = ? WHERE id = ?",
        [unit_cost, inventory_item_id],
      );
    }

    const [result] = await conn.query(
      `INSERT INTO inventory_transactions
        (inventory_item_id, transaction_type, quantity, unit_cost, notes, created_by)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        inventory_item_id,
        transaction_type,
        delta,
        unit_cost || null,
        notes || null,
        req.user?.id || null,
      ],
    );

    await conn.commit();
    res.status(201).json({
      success: true,
      data: { id: result.insertId, new_stock: newStock },
    });
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
});

export const listTransactions = asyncHandler(async (req, res) => {
  const { inventory_item_id, transaction_type, limit = 100 } = req.query;
  const clauses = [];
  const params = [];
  if (inventory_item_id) {
    clauses.push("t.inventory_item_id = ?");
    params.push(inventory_item_id);
  }
  if (transaction_type) {
    clauses.push("t.transaction_type = ?");
    params.push(transaction_type);
  }
  const where = clauses.length ? "WHERE " + clauses.join(" AND ") : "";
  const [rows] = await pool.query(
    `SELECT t.*, i.name AS item_name, i.unit, u.full_name AS user_name
     FROM inventory_transactions t
     JOIN inventory_items i ON i.id = t.inventory_item_id
     LEFT JOIN users u ON u.id = t.created_by
     ${where}
     ORDER BY t.created_at DESC
     LIMIT ?`,
    [...params, Number(limit)],
  );
  res.json({ success: true, data: rows });
});
