import { Router } from "express";
import { authenticate, authorize } from "../middleware/auth.js";
import {
  salesReport,
  topItemsReport,
  paymentMethodsReport,
  occupancyReport,
  dashboardReport,
} from "../controllers/reportController.js";

const router = Router();

router.use(authenticate);
router.use(authorize("admin", "manager"));

router.get("/dashboard", dashboardReport);
router.get("/sales", salesReport);
router.get("/top-items", topItemsReport);
router.get("/payment-methods", paymentMethodsReport);
router.get("/occupancy", occupancyReport);

export default router;
