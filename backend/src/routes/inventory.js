import { Router } from "express";
import { authenticate, authorize } from "../middleware/auth.js";
import {
  listSuppliers,
  createSupplier,
  updateSupplier,
  deleteSupplier,
  listItems,
  createItem,
  updateItem,
  deleteItem,
  recordTransaction,
  listTransactions,
} from "../controllers/inventoryController.js";

const router = Router();

router.use(authenticate);
router.use(authorize("admin", "manager", "kitchen"));

router.get("/suppliers", listSuppliers);
router.post("/suppliers", authorize("admin", "manager"), createSupplier);
router.patch("/suppliers/:id", authorize("admin", "manager"), updateSupplier);
router.delete("/suppliers/:id", authorize("admin", "manager"), deleteSupplier);

router.get("/items", listItems);
router.post("/items", authorize("admin", "manager"), createItem);
router.patch("/items/:id", authorize("admin", "manager"), updateItem);
router.delete("/items/:id", authorize("admin", "manager"), deleteItem);

router.get("/transactions", listTransactions);
router.post("/transactions", recordTransaction);

export default router;
