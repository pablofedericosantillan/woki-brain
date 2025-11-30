import crypto from "crypto";
import { Booking, BookingStatus, Candidate, IGap, SLOT_MINUTES } from "../../domain/types";
import { TimeWindow, WokiBrain, Gap } from "../../domain";
import { CreateBookingCommandHandlerResponse, InvalidResult, ValidResult } from "../types";
import { logger } from "../../infrastructure/logger";
import {
  concurrencyLockService,
  idempotencyService,
  databaseRepository
} from "../../infrastructure";

// const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

export class CreateBookingCommand {
  constructor(
    public readonly idempotencyKey: string,
    public readonly data: {
      restaurantId: string;
      sectorId: string;
      date: string;
      partySize: number;
      durationMinutes: number;
      windowStart: string;
      windowEnd: string;
    }
  ) {}
}

export class CreateBookingCommandHandler {
  execute(cmd: CreateBookingCommand): CreateBookingCommandHandlerResponse | InvalidResult {
    const {
      idempotencyKey,
      data: {
        restaurantId,
        sectorId,
        date,
        partySize,
        durationMinutes,
        windowStart,
        windowEnd,
      },
    } = cmd;

    const logBase = {
      requestId: crypto.randomUUID(),
      restaurantId,
      sectorId,
      partySize,
      durationMinutes,
      op: "create-booking"
    };

    const valid = this.validation(cmd);
    if (!valid.ok) {
      logger.warn({...logBase, outcome: valid});
      return valid as InvalidResult;
    }
    
    const { restaurant, tables } = (valid as ValidResult).data;

    const payloadHash = JSON.stringify(cmd.data)
    const idempotentBooking = idempotencyService.getIdempotentBooking(idempotencyKey, payloadHash);

    if (idempotentBooking) {
      logger.info({
        ...logBase,
        outcome: idempotentBooking,
      });
      return { ok: true, booking: idempotentBooking };
    }

    const bookings = databaseRepository.getBookingsByDay(restaurantId, sectorId, date);
    const normalizedDate = new TimeWindow(date, restaurant.timezone);
    const wokiBrain = new WokiBrain(durationMinutes, partySize);

    const candidates: Candidate[] = [];

    const rServiceWindows = restaurant.windows ?? [{ start: "00:00", end: "23:59" }];
    let windowIsValid = false;

    for (const sw of rServiceWindows) {
      const finalWindow = normalizedDate.validationWindow(
        sw,
        { start: windowStart, end: windowEnd }
      )

      if (!finalWindow) continue;
      windowIsValid = true;

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

    const bestCandidate = wokiBrain.selectBestCandidate(candidates);

    if (!bestCandidate) {
      logger.info({ ...logBase, outcome: "no_capacity" });
      return { ok: false, status: 409, error: "no_capacity", detail: "No single or combo gap fits duration within window" };
    }

    const lockKey = concurrencyLockService.buildLockKey(
      restaurantId, sectorId, bestCandidate.tableIds, bestCandidate.startISO
    );

    if (!concurrencyLockService.acquireLock(lockKey)) {
      logger.info({ ...logBase, outcome: "concurrence-conflict" });
      return { ok: false, status: 409, error: "no_capacity", detail: "Concurrence conflict" };
    }

    // await sleep(2000)

    try {
      // TODO: check this
      // const dayBookings = databaseRepository.getBookingsByDay(restaurantId, sectorId, date);
      // const startDt = DateTime.fromISO(bestCandidate.startISO);
      // const endDt = DateTime.fromISO(bestCandidate.endISO);

      // const collision = dayBookings.some((b) => {
      //   const bS = DateTime.fromISO(b.start);
      //   const bE = DateTime.fromISO(b.end);
      //   return b.tableIds.some((t) => bestCandidate.tableIds.includes(t)) &&
      //          !(endDt <= bS || startDt >= bE);
      // });

      // if (collision)
      //   return { ok: false, status: 409, error: "no_capacity", detail: "Slot no longer available" };

      const now = new Date().toISOString();

      const booking: Booking = {
        id: `BK_${crypto.randomUUID()}`,
        restaurantId,
        sectorId,
        tableIds: bestCandidate.tableIds,
        partySize,
        start: bestCandidate.startISO,
        end: bestCandidate.endISO,
        durationMinutes,
        status: BookingStatus.CONFIRMED,
        createdAt: now,
        updatedAt: now
      };

      databaseRepository.addBooking(booking);
      idempotencyService.save(idempotencyKey, payloadHash, booking);
  
      logger.info({...logBase, outcome: "success"});

      return { ok: true, booking: booking };
    } finally {
      concurrencyLockService.releaseLock(lockKey);
    }
  }

  private validation(cmd: CreateBookingCommand): ValidResult | InvalidResult {
    if (cmd.data.durationMinutes % SLOT_MINUTES !== 0)
      return {
        ok: false,
        status: 400,
        error: "invalid_input",
        detail: "duration not in grid"
      };

    const restaurant = databaseRepository.getRestaurantById(cmd.data.restaurantId);
    if (!restaurant)
      return { ok: false, status: 404, error: "not_found", detail: "Restaurant not found" };

    const sector = databaseRepository.getSectorById(cmd.data.sectorId, cmd.data.restaurantId);
    if (!sector)
      return { ok: false, status: 404, error: "not_found", detail: "Sector not found" };

    const tables = databaseRepository.getTablesBySectorId(cmd.data.sectorId);
    if (!tables)
      return { ok: false, status: 409, error: "no_capacity", detail: "No tables in sector" };
  
    return {
      ok: true,
      data: { restaurant, tables }
    };
  }
}
