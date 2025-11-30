import crypto from "crypto";
import { WokiBrain } from "../../domain/wokibrain";
import { IGap, SLOT_MINUTES } from "../../domain/types";
import { Gap, TimeWindow } from "../../domain";
import { databaseRepository } from "../../infrastructure";
import { DiscoverSeatsQueryHandlerResponse, InvalidResult, ValidResult } from "../types";
import { logger } from "../../infrastructure/logger";

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
    const logBase = {
      requestId: crypto.randomUUID(),
      op: "discover-seats"
    };

    const valid = this.validation(query);
        if (!valid.ok) {
      logger.warn({...logBase, outcome: valid});
      return valid as InvalidResult;
    }

    const { restaurant, tables } = (valid as ValidResult).data;

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

    const bookings = databaseRepository.getBookingsByDay(restaurantId, sectorId, date);

    const normalizedDate = new TimeWindow(date, restaurant.timezone);
    const wokiBrain = new WokiBrain(durationMinutes, partySize);
    const candidates = [];

    const rServiceWindows = restaurant.windows ?? [{ start: "00:00", end: "23:59" }];

    for (const sw of rServiceWindows) {
      const finalWindow = normalizedDate.validationWindow(
        sw,
        { start: windowStart, end: windowEnd }
      )

      if (!finalWindow) continue;

      const gapsByTable = new Map<string, IGap[]>;

      for (const table of tables) {
        const reservedTables = bookings.filter((b) => b.tableIds.includes(table.id));

        if (!reservedTables.length) {
          gapsByTable.set(table.id, 
            [{
              startMin: finalWindow.startMin,
              endMin: finalWindow.endMin,
            }]
          );
          continue;
        } 

        const gap = new Gap(normalizedDate.timeISO(),finalWindow);
        gapsByTable.set(table.id, gap.detect(reservedTables));        
      }

      candidates.push(...wokiBrain.generateCandidates(normalizedDate.timeISO(), tables, gapsByTable));
    }

    if (!candidates.length) {
      logger.info({
        ...logBase,
        outcome: "no_capacity",
      });
  
      return {
        ok: false,
        status: 409,
        error: "no_capacity",
        detail: "No room fits"
      };
    }

    const sortCandidates = [...candidates] // TODO revisar esto
      .sort((a, b) =>
        a.capacityMax !== b.capacityMax
          ? a.capacityMax - b.capacityMax
          : a.startISO.localeCompare(b.startISO)
      )
      .slice(0, limit);

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
