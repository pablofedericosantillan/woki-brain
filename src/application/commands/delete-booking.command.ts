import crypto from "crypto";
import { InvalidResult } from "../types";
import { logger } from "../../shared/logger";
import { databaseRepository } from "../../infrastructure";

export class DeleteBookingCommandHandler {
  execute(id: string): void | InvalidResult {
    const booking = databaseRepository.softDeleteBooking(id);

    if (!booking) {
      logger.warn({
        requestId: crypto.randomUUID(),
        id,
        op: "delete-booking",
        outcome: "booking-not-found"
      });
      return { ok: false, status: 404, error: "not_found", detail: "Booking not found" };
    }
  }
}
