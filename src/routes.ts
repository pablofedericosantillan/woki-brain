import { Router } from "express";
import { healthController } from "./controllers/health.controller";
import {
    createBookingController,
    discoverSeatsController,
    listBookingsController
} from "./controllers/api.controller";

const router = Router();

router.get("/health", healthController);

router.get("/woki/discover", discoverSeatsController);
router.post("/woki/bookings", createBookingController);
router.get("/woki/bookings/day", listBookingsController);

export default router;