import { Booking, ISODateTime } from "../domain/types";
import { randomUUID } from "crypto";
import { DateTime } from "luxon";

interface IdempotencyEntry {
  idempotencyKey: string;
  payloadHash:string;
  booking: Booking;
  createdAt: ISODateTime;
}

export class ConcurrencyService {
  private locks = new Set<string>();
  private idempotencyStore = new Map<string, IdempotencyEntry>();
  private readonly TTL_MS = 60_000; // 1min

  public buildLockKey(
    restaurantId: string,
    sectorId: string,
    tableIds: string[],
    startISO: string,
  ): string {
    return `${restaurantId}|${sectorId}|${tableIds.join("+")}|${startISO}`;
  }

  public acquireLock(key: string): boolean {
    if (this.locks.has(key)) return false;
    this.locks.add(key);
    return true;
  }

  public releaseLock(key: string): void {
    this.locks.delete(key);
  }

  public getIdempotentBooking(
    idempotencyKey: string,
    payloadHash: string,
  ): Booking | false {
    const entry = Array.from(this.idempotencyStore.values())
      .find(e => e.idempotencyKey === idempotencyKey && e.payloadHash === payloadHash );
    
    if (!entry) return false;
    
    // TODO: ver esto? aca siempre deberia dar el ultimo si no
    // const now = DateTime.utc().toMillis();
    // const created = DateTime.fromISO(entry.createdAt).toMillis();
    // const expired = now - created > this.TTL_MS;
    // if (expired) return false;

    return entry.booking;
  }

  public storeIdempotentBooking(
    idempotencyKey: string,
    payloadHash: string,
    booking: Booking,
  ): void {
    const id = randomUUID();

    this.idempotencyStore.set(id, {
      idempotencyKey,
      payloadHash,
      booking,
      createdAt: DateTime.utc().toISO(),
    });
  }
}

export const concurrencyService = new ConcurrencyService();
