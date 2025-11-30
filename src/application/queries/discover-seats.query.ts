import crypto from "crypto";
import { WokiBrain } from "../../domain/wokibrain";
import { IGap, SLOT_MINUTES } from "../../domain/types";
import { Gap, TimeWindow } from "../../domain";
import { databaseRepository } from "../../infrastructure";
import { DiscoverSeatsQueryHandlerResponse, InvalidResult, ValidResult } from "../types";
import { logger } from "../../shared/logger";

export class DiscoverSeatsQuery {
  constructor(
    public readonly data: {
      restaurantId: string;
      sectorId: string;
      date: string;
      partySize: number;
      durationMinutes: number;
      windowStart?: string;
      windowEnd?: string;
      limit?: number;
    }
  ) {}
}

export class DiscoverSeatsQueryHandler {
  execute(query: DiscoverSeatsQuery): DiscoverSeatsQueryHandlerResponse | InvalidResult {
    const {
      restaurantId,
      sectorId,
      date,
      partySize,
      durationMinutes,
      windowStart,
      windowEnd,
      limit = 10
    } = query.data;

    const logBase = {
      requestId: crypto.randomUUID(),
      restaurantId,
      sectorId,
      partySize,
      durationMinutes,
      op: "discover-seats"
    };

    const valid = this.validation(query);
        if (!valid.ok) {
      logger.warn({...logBase, outcome: valid});
      return valid as InvalidResult;
    }

    const { restaurant, tables } = (valid as ValidResult).data;

    const bookings = databaseRepository.getBookingsByDay(restaurantId, sectorId, date);

    const timeWindow = new TimeWindow(date, restaurant.timezone);
    const wokiBrain = new WokiBrain(durationMinutes, partySize);
    const candidates = [];

    const rServiceWindows = restaurant.windows ?? [{ start: "00:00", end: "23:59" }];
    let windowIsValid = false;

    for (const sw of rServiceWindows) {
      const finalWindow = timeWindow.validationWindow(
        sw,
        { start: windowStart, end: windowEnd }
      );

      if (!finalWindow) continue;
      windowIsValid = true;

      const gapsByTable = new Map<string, IGap[]>;

      for (const table of tables) {
        const tableBookings = bookings.filter((b) => b.tableIds.includes(table.id));

        if (!tableBookings.length) {
          gapsByTable.set(table.id, 
            [{
              startMin: finalWindow.startMin,
              endMin: finalWindow.endMin,
            }]
          );
          continue;
        } 

        const gap = new Gap(timeWindow.timeISO(),finalWindow);
        gapsByTable.set(table.id, gap.detect(tableBookings));        
      }

      candidates.push(...wokiBrain.generateCandidates(timeWindow.timeISO(), tables, gapsByTable));
    }

    if (!windowIsValid) {
      logger.info({ ...logBase, outcome: "outside_service_window" });
      return {
        ok: false,
        status: 422,
        error: "outside_service_window",
        detail: "Window does not intersect service hours"
      };
    }

    if (!candidates.length) {
      logger.info({ ...logBase, outcome: "no_capacity" });
      return {
        ok: false,
        status: 409,
        error: "no_capacity",
        detail: "No single or combo gap fits duration within window"
      };
    }

    const sortCandidates = candidates.sort((a, b) =>
      a.startISO.localeCompare(b.startISO)
    ).slice(0, limit);

    logger.info({...logBase, outcome: "success"});
    return {
      ok: true,
      slotMinutes: SLOT_MINUTES,
      durationMinutes,
      candidates: sortCandidates
    };
  }

  private validation(query: DiscoverSeatsQuery): ValidResult | InvalidResult {
    if (query.data.durationMinutes % SLOT_MINUTES !== 0)
      return {
        ok: false,
        status: 400,
        error: "invalid_input",
        detail: "duration not in grid"
      };

    const restaurant = databaseRepository.getRestaurantById(query.data.restaurantId);
    if (!restaurant)
      return { ok: false, status: 404, error: "not_found", detail: "Restaurant not found" };

    const sector = databaseRepository.getSectorById(query.data.sectorId, query.data.restaurantId);
    if (!sector)
      return { ok: false, status: 404, error: "not_found", detail: "Sector not found" };

    const tables = databaseRepository.getTablesBySectorId(query.data.sectorId);
    if (!tables)
      return { ok: false, status: 409, error: "no_capacity", detail: "No tables in sector" };
  
    return {
      ok: true,
      data: { restaurant, tables }
    };
  }
}
