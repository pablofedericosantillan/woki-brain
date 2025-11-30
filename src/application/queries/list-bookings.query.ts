import crypto from "crypto";
import { databaseRepository } from "../../infrastructure";
import { InvalidResult, ListBookingsQueryHandlerResponse } from "../types";
import { logger } from "../../infrastructure/logger";

export class ListBookingsQuery {
  constructor(
    public readonly restaurantId: string,
    public readonly sectorId: string,
    public readonly date: string,
  ) {}
}

export class ListBookingsQueryHandler {
  execute(query: ListBookingsQuery): ListBookingsQueryHandlerResponse | InvalidResult {
    const { restaurantId, sectorId, date } = query;

    const logBase = {
      requestId: crypto.randomUUID(),
      restaurantId,
      sectorId,
      op: "list-bookings"
    };

    const valid = this.validation(query);
    if (!valid?.ok) {
      logger.warn({...logBase, outcome: valid});
      return valid as InvalidResult;
    }

    const bookings = databaseRepository.getBookingsByDay(restaurantId, sectorId, date);

    return { ok: true, date, items: bookings };
  }


  private validation(query: ListBookingsQuery): { ok: boolean } | InvalidResult {
    const restaurant = databaseRepository.getRestaurantById(query.restaurantId);
    if (!restaurant)
      return { ok: false, status: 404, error: "not_found", detail: "Restaurant not found" };

    const sector = databaseRepository.getSectorById(query.sectorId, query.restaurantId);
    if (!sector)
      return { ok: false, status: 404, error: "not_found", detail: "Sector not found" };

    return { ok: true };
  }
}
