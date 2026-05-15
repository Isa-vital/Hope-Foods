import pool from "../config/database.js";
import { asyncHandler } from "../middleware/errorHandler.js";

/**
 * GET /api/menu - Get full menu grouped by category
 */
export const getMenu = asyncHandler(async (req, res) => {
  const [categories] = await pool.query(
    "SELECT id, name, slug, description FROM categories WHERE is_active = TRUE ORDER BY display_order",
  );

  const [items] = await pool.query(
    `SELECT id, category_id, name, description, price, image, preparation_time, is_available, is_featured
     FROM menu_items WHERE is_available = TRUE ORDER BY display_order`,
  );

  const menu = categories.map((cat) => ({
    ...cat,
    items: items.filter((it) => it.category_id === cat.id),
  }));

  res.json({ success: true, data: menu });
});

/**
 * GET /api/menu/categories - List all categories
 */
export const getCategories = asyncHandler(async (req, res) => {
  const [rows] = await pool.query(
    "SELECT * FROM categories ORDER BY display_order",
  );
  res.json({ success: true, data: rows });
});

/**
 * GET /api/menu/items - Get all items (with optional category filter)
 */
export const getItems = asyncHandler(async (req, res) => {
  const { category_id, available_only } = req.query;
  let sql =
    "SELECT m.*, c.name AS category_name FROM menu_items m JOIN categories c ON m.category_id = c.id WHERE 1=1";
  const params = [];

  if (category_id) {
    sql += " AND m.category_id = ?";
    params.push(category_id);
  }
  if (available_only === "true") {
    sql += " AND m.is_available = TRUE";
  }
  sql += " ORDER BY m.display_order";

  const [rows] = await pool.query(sql, params);
  res.json({ success: true, data: rows });
});

/**
 * GET /api/menu/items/:id - Get a single item
 */
export const getItem = asyncHandler(async (req, res) => {
  const [rows] = await pool.query(
    `SELECT m.*, c.name AS category_name FROM menu_items m JOIN categories c ON m.category_id = c.id WHERE m.id = ?`,
    [req.params.id],
  );
  if (rows.length === 0) {
    return res
      .status(404)
      .json({ success: false, message: "Menu item not found" });
  }
  res.json({ success: true, data: rows[0] });
});

/**
 * POST /api/menu/items - Create new menu item (admin/manager)
 */
export const createItem = asyncHandler(async (req, res) => {
  const {
    category_id,
    name,
    description,
    price,
    cost,
    image,
    preparation_time,
    is_featured,
  } = req.body;

  if (!category_id || !name || !price) {
    return res
      .status(400)
      .json({
        success: false,
        message: "category_id, name, and price are required",
      });
  }

  const [result] = await pool.query(
    `INSERT INTO menu_items (category_id, name, description, price, cost, image, preparation_time, is_featured)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      category_id,
      name,
      description || null,
      price,
      cost || 0,
      image || null,
      preparation_time || 15,
      !!is_featured,
    ],
  );

  res
    .status(201)
    .json({
      success: true,
      message: "Menu item created",
      data: { id: result.insertId },
    });
});

/**
 * PATCH /api/menu/items/:id - Update menu item
 */
export const updateItem = asyncHandler(async (req, res) => {
  const allowed = [
    "category_id",
    "name",
    "description",
    "price",
    "cost",
    "image",
    "preparation_time",
    "is_available",
    "is_featured",
    "display_order",
  ];
  const fields = [];
  const values = [];

  for (const key of allowed) {
    if (req.body[key] !== undefined) {
      fields.push(`${key} = ?`);
      values.push(req.body[key]);
    }
  }

  if (fields.length === 0) {
    return res
      .status(400)
      .json({ success: false, message: "No valid fields to update" });
  }

  values.push(req.params.id);
  const [result] = await pool.query(
    `UPDATE menu_items SET ${fields.join(", ")} WHERE id = ?`,
    values,
  );

  if (result.affectedRows === 0) {
    return res
      .status(404)
      .json({ success: false, message: "Menu item not found" });
  }
  res.json({ success: true, message: "Menu item updated" });
});

/**
 * DELETE /api/menu/items/:id - Delete menu item (soft via is_available)
 */
export const deleteItem = asyncHandler(async (req, res) => {
  const [result] = await pool.query(
    "UPDATE menu_items SET is_available = FALSE WHERE id = ?",
    [req.params.id],
  );
  if (result.affectedRows === 0) {
    return res
      .status(404)
      .json({ success: false, message: "Menu item not found" });
  }
  res.json({ success: true, message: "Menu item disabled" });
});

/**
 * POST /api/menu/categories - Create category
 */
export const createCategory = asyncHandler(async (req, res) => {
  const { name, slug, description, display_order } = req.body;
  if (!name || !slug) {
    return res
      .status(400)
      .json({ success: false, message: "name and slug are required" });
  }
  const [result] = await pool.query(
    "INSERT INTO categories (name, slug, description, display_order) VALUES (?, ?, ?, ?)",
    [name, slug, description || null, display_order || 0],
  );
  res.status(201).json({ success: true, data: { id: result.insertId } });
});
